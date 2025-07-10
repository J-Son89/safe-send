import { useState, useEffect } from 'react'
import { BrowserProvider } from 'ethers'
import WalletConnect from './components/WalletConnect'
import ContractService from './services/contractService'
import { modal } from './utils/walletConnect'
import { generateSecurePassword } from './utils/passwordGenerator'
import { TAB_NAMES, DEPOSIT_FILTER_TYPES, DEPOSIT_TYPES } from './utils/constants'
import OnboardingModal from './components/layout/OnboardingModal'
import TabNavigation from './components/layout/TabNavigation'
import SendPage from './pages/SendPage'
import ClaimPage from './pages/ClaimPage'
import ReclaimPage from './pages/ReclaimPage'
import HistoryPage from './pages/HistoryPage'

function App() {
  // Get initial tab from URL or default to 'send'
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabFromUrl = urlParams.get('tab')
    const validTabs = Object.values(TAB_NAMES)
    return validTabs.includes(tabFromUrl) ? tabFromUrl : TAB_NAMES.SEND
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())

  // Function to update URL when tab changes
  const updateActiveTab = (newTab) => {
    setActiveTab(newTab)

    // Update URL without page reload
    const url = new URL(window.location)
    url.searchParams.set('tab', newTab)
    window.history.pushState({}, '', url)
  }

  const [walletState, setWalletState] = useState({
    isConnected: false,
    address: null
  })

  // Send form state
  const [sendForm, setSendForm] = useState({
    amount: '',
    recipient: '',
    password: '',
    expiryMinutes: '30'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)
  const [errors, setErrors] = useState({})

  // Reclaim tab state
  const [userDeposits, setUserDeposits] = useState([])
  const [depositsLoading, setDepositsLoading] = useState(false)

  // Dashboard/History tab state
  const [allDeposits, setAllDeposits] = useState([])
  const [allDepositsLoading, setAllDepositsLoading] = useState(false)
  const [depositFilter, setDepositFilter] = useState(DEPOSIT_FILTER_TYPES.ALL)
  const [searchTerm, setSearchTerm] = useState('')

  // Claim tab state
  const [claimableDeposits, setClaimableDeposits] = useState([])
  const [claimableLoading, setClaimableLoading] = useState(false)
  const [claimPasswords, setClaimPasswords] = useState({}) // depositId -> password
  const [claimingDeposits, setClaimingDeposits] = useState({}) // depositId -> boolean
  const [claimResults, setClaimResults] = useState({}) // depositId -> result
  const [claimErrors, setClaimErrors] = useState({}) // depositId -> error

  // Contract constants with defaults
  const [contractConstants, setContractConstants] = useState({
    notificationAmount: '0.001',
    minDeposit: '0.01',
    platformFeePercent: '0.5', // Default 0.5%
    collectedFees: '0'
  })

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setSendForm(prev => ({ ...prev, password: newPassword }))
  }

  const handleSendETH = async () => {
    // Check wallet connection
    if (!walletState.isConnected) {
      alert('Please connect your wallet first')
      return
    }

    // Validate form
    const newErrors = {}
    const minAmount = parseFloat(contractConstants.notificationAmount) + parseFloat(contractConstants.minDeposit)
    if (!sendForm.amount || parseFloat(sendForm.amount) < minAmount) {
      newErrors.amount = `Minimum amount is ${minAmount} ETH (includes ${contractConstants.notificationAmount} ETH notification + ${contractConstants.platformFeePercent}% platform fee)`
    }
    if (!sendForm.recipient) {
      newErrors.recipient = 'Recipient address is required'
    }
    if (!sendForm.password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})
    setTxResult(null)

    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        console.log('Using MetaMask browser extension')
        provider = new BrowserProvider(window.ethereum)
      } else {
        console.log('Using WalletConnect provider')
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          throw new Error('No wallet provider found - please install MetaMask or connect via WalletConnect')
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()

      console.log('Provider:', provider)
      console.log('Signer:', signer)
      console.log('Network:', await provider.getNetwork())

      console.log('Attempting to send transaction...')

      // Create contract service
      const contractService = new ContractService(provider, signer)

      // Create deposit
      const result = await contractService.createDeposit(
        sendForm.recipient,
        sendForm.password,
        parseInt(sendForm.expiryMinutes),
        sendForm.amount
      )

      setTxResult(result)

      // Reset form on success
      setSendForm({
        amount: '',
        recipient: '',
        password: '',
        expiryMinutes: '30'
      })

      // Refresh deposits after sending
      if (activeTab === TAB_NAMES.RECLAIM) {
        loadUserDeposits()
      }
      if (activeTab === TAB_NAMES.HISTORY) {
        loadAllDeposits()
      }

    } catch (error) {
      console.error('Send error:', error)
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const loadContractConstants = async () => {
    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum)
      } else {
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          console.log('No wallet provider found for constants')
          return
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()
      const contractService = new ContractService(provider, signer)

      const constants = await contractService.getConstants()
      console.log('Loaded contract constants:', constants)

      setContractConstants(prev => ({
        ...prev,
        ...constants
      }))

    } catch (error) {
      console.log('Using default constants (contract may not have new features):', error.message)
      // Keep the default values if contract doesn't have new constants
    }
  }

  const loadUserDeposits = async () => {
    if (!walletState.isConnected || !walletState.address) {
      return
    }

    setDepositsLoading(true)
    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum)
      } else {
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          throw new Error('No wallet provider found')
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()
      const contractService = new ContractService(provider, signer)

      console.log('Loading deposits for user:', walletState.address)

      // Get user's deposits
      const deposits = await contractService.getDepositsForUser(walletState.address)

      console.log('Found deposits:', deposits)
      setUserDeposits(deposits)

    } catch (error) {
      console.error('Error loading deposits:', error)
      setUserDeposits([])
    } finally {
      setDepositsLoading(false)
    }
  }

  const loadAllDeposits = async () => {
    if (!walletState.isConnected || !walletState.address) {
      return
    }

    setAllDepositsLoading(true)
    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum)
      } else {
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          throw new Error('No wallet provider found')
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()
      const contractService = new ContractService(provider, signer)

      console.log('Loading all deposits for user:', walletState.address)

      // Get all user's deposits (sent and received)
      const deposits = await contractService.getAllDepositsForUser(walletState.address)

      console.log('Found all deposits:', deposits)
      setAllDeposits(deposits)

    } catch (error) {
      console.error('Error loading all deposits:', error)
      setAllDeposits([])
    } finally {
      setAllDepositsLoading(false)
    }
  }

  const loadClaimableDeposits = async () => {
    if (!walletState.isConnected || !walletState.address) {
      return
    }

    setClaimableLoading(true)
    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        provider = new BrowserProvider(window.ethereum)
      } else {
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          throw new Error('No wallet provider found')
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()
      const contractService = new ContractService(provider, signer)

      console.log('Loading claimable deposits for user:', walletState.address)

      // Get all user's deposits and filter for claimable ones
      const allDeposits = await contractService.getAllDepositsForUser(walletState.address)
      const claimable = allDeposits.filter(d => d.canClaim)

      console.log('All deposits for user:', allDeposits)
      console.log('Filtered claimable deposits:', claimable)
      console.log('Claimable count:', claimable.length)
      setClaimableDeposits(claimable)

    } catch (error) {
      console.error('Error loading claimable deposits:', error)
      setClaimableDeposits([])
    } finally {
      setClaimableLoading(false)
    }
  }

  const handleClaimETH = async (depositId) => {
    // Check wallet connection
    if (!walletState.isConnected) {
      alert('Please connect your wallet first')
      return
    }

    const password = claimPasswords[depositId]

    // Validate password
    if (!password) {
      setClaimErrors(prev => ({ ...prev, [depositId]: 'Password is required' }))
      return
    }

    setClaimingDeposits(prev => ({ ...prev, [depositId]: true }))
    setClaimErrors(prev => ({ ...prev, [depositId]: null }))

    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        console.log('Using MetaMask for claim')
        provider = new BrowserProvider(window.ethereum)
      } else {
        console.log('Using WalletConnect for claim')
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          throw new Error('No wallet provider found - please install MetaMask or connect via WalletConnect')
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()
      const contractService = new ContractService(provider, signer)

      console.log('Attempting to claim deposit:', depositId)

      // Claim deposit
      const result = await contractService.claimDeposit(depositId, password)

      setClaimResults(prev => ({ ...prev, [depositId]: result }))

      // Clear password after successful claim
      setClaimPasswords(prev => ({ ...prev, [depositId]: '' }))

      // Refresh deposits after claiming
      loadClaimableDeposits()
      if (activeTab === TAB_NAMES.HISTORY) {
        loadAllDeposits()
      }

    } catch (error) {
      console.error('Claim error:', error)
      setClaimErrors(prev => ({ ...prev, [depositId]: error.message }))
    } finally {
      setClaimingDeposits(prev => ({ ...prev, [depositId]: false }))
    }
  }

  const handleReclaimETH = async (depositId) => {
    if (!walletState.isConnected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      // Use MetaMask if available, otherwise fall back to WalletConnect
      let provider

      if (window.ethereum) {
        console.log('Using MetaMask for reclaim')
        provider = new BrowserProvider(window.ethereum)
      } else {
        console.log('Using WalletConnect for reclaim')
        const walletProvider = modal.getWalletProvider()
        if (!walletProvider) {
          throw new Error('No wallet provider found')
        }
        provider = new BrowserProvider(walletProvider)
      }

      const signer = await provider.getSigner()
      const contractService = new ContractService(provider, signer)

      console.log('Cancelling deposit:', depositId)

      // Call the cancel function
      const result = await contractService.cancelDeposit(depositId)

      alert(`✅ Deposit #${depositId} cancelled successfully!\nTX: ${result.txHash}`)

      // Reload deposits to show updated status
      if (activeTab === TAB_NAMES.RECLAIM) {
        loadUserDeposits()
      }
      if (activeTab === TAB_NAMES.HISTORY) {
        loadAllDeposits()
      }

    } catch (error) {
      console.error('Reclaim error:', error)
      alert('Failed to reclaim deposit: ' + error.message)
    }
  }

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        if (accounts.length > 0) {
          setWalletState({
            isConnected: true,
            address: accounts[0]
          })
        }
      } catch (error) {
        console.error('Error connecting to MetaMask:', error)
        alert('Failed to connect MetaMask: ' + error.message)
      }
    }
  }

  const handleWalletConnectionChange = (connectionState) => {
    // Only update wallet state if MetaMask is not available
    if (!window.ethereum) {
      setWalletState(connectionState)
    }
  }

  // Check for MetaMask connection on load
  useEffect(() => {
    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setWalletState({
              isConnected: true,
              address: accounts[0]
            })
          }
        } catch (error) {
          console.log('MetaMask not connected')
        }
      }
    }

    checkMetaMaskConnection()

    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletState({
            isConnected: true,
            address: accounts[0]
          })
        } else {
          setWalletState({
            isConnected: false,
            address: null
          })
        }
      })
    }
  }, [])

  // Load user deposits when wallet connects or tabs are activated
  useEffect(() => {
    if (walletState.isConnected) {
      // Load contract constants when wallet connects
      loadContractConstants()

      // Load tab-specific data
      if (activeTab === TAB_NAMES.RECLAIM) {
        loadUserDeposits()
      }
      if (activeTab === TAB_NAMES.HISTORY) {
        loadAllDeposits()
      }
      if (activeTab === TAB_NAMES.CLAIM) {
        loadClaimableDeposits()
      }
    }
  }, [walletState.isConnected, walletState.address, activeTab])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const newTab = getInitialTab()
      setActiveTab(newTab)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Filter deposits based on search and filter criteria
  const getFilteredDeposits = () => {
    if (!allDeposits.length) return []

    let filtered = allDeposits

    // Filter by type
    if (depositFilter === DEPOSIT_FILTER_TYPES.SENT) {
      filtered = filtered.filter(d => d.type === DEPOSIT_TYPES.SENT)
    } else if (depositFilter === DEPOSIT_FILTER_TYPES.RECEIVED) {
      filtered = filtered.filter(d => d.type === DEPOSIT_TYPES.RECEIVED)
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(d =>
        d.id.toString().includes(search) ||
        d.recipient.toLowerCase().includes(search) ||
        d.depositor.toLowerCase().includes(search) ||
        d.amount.toString().includes(search)
      )
    }

    return filtered
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  useEffect(() => {
    const skip = localStorage.getItem('safesend-onboarding-hide');
    if (!skip) {
      setModalOpen(true);
      setHasShownOnce(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">SafeSend</h1>
          <p className="text-gray-400">Secure ETH transfers with password verification</p>
        </div>

        <TabNavigation activeTab={activeTab} onTabChange={updateActiveTab} />

        {/* Content */}
        <div className="card">
          {activeTab === TAB_NAMES.SEND && (
            <SendPage
              isConnected={walletState.isConnected}
              contractConstants={contractConstants}
              onSendETH={handleSendETH}
              isLoading={isLoading}
              txResult={txResult}
              errors={errors}
              formData={sendForm}
              onFormChange={setSendForm}
              onGeneratePassword={handleGeneratePassword}
              connectMetaMask={connectMetaMask}
              WalletConnect={WalletConnect}
              onWalletConnectionChange={handleWalletConnectionChange}
              walletState={walletState}
            />
          )}

          {activeTab === TAB_NAMES.CLAIM && (
            <ClaimPage
              walletState={walletState}
              claimableDeposits={claimableDeposits}
              claimableLoading={claimableLoading}
              claimPasswords={claimPasswords}
              claimingDeposits={claimingDeposits}
              claimResults={claimResults}
              claimErrors={claimErrors}
              onLoadClaimableDeposits={loadClaimableDeposits}
              onClaimETH={handleClaimETH}
              onPasswordChange={(depositId, value) => setClaimPasswords(prev => ({ ...prev, [depositId]: value }))}
              connectMetaMask={connectMetaMask}
              WalletConnect={WalletConnect}
              onWalletConnectionChange={handleWalletConnectionChange}
            />
          )}

          {activeTab === TAB_NAMES.RECLAIM && (
            <ReclaimPage
              walletState={walletState}
              userDeposits={userDeposits}
              depositsLoading={depositsLoading}
              onReclaimETH={handleReclaimETH}
              connectMetaMask={connectMetaMask}
              WalletConnect={WalletConnect}
              onWalletConnectionChange={handleWalletConnectionChange}
            />
          )}

          {activeTab === TAB_NAMES.HISTORY && (
            <HistoryPage
              walletState={walletState}
              allDeposits={allDeposits}
              allDepositsLoading={allDepositsLoading}
              depositFilter={depositFilter}
              searchTerm={searchTerm}
              onDepositFilterChange={setDepositFilter}
              onSearchTermChange={setSearchTerm}
              onTabChange={updateActiveTab}
              onReclaimETH={handleReclaimETH}
              getFilteredDeposits={getFilteredDeposits}
              connectMetaMask={connectMetaMask}
              WalletConnect={WalletConnect}
              onWalletConnectionChange={handleWalletConnectionChange}
            />
          )}

        </div>
        <div className="flex justify-center pt-2">
          <button className="text-sm text-gray-300 hover:text-white">
            ❓ How It Works
          </button>
        </div>
      </div>
      <OnboardingModal open={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  )
}

export default App