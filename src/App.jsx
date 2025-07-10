import { useState, useEffect } from 'react'
import { BrowserProvider } from 'ethers'
import WalletConnect from './components/WalletConnect'
import SendForm from './components/SendForm'
import ContractService from './services/contractService'
import { modal } from './utils/walletConnect'
import { Dialog } from '@headlessui/react';

function OnboardingModal({ open, onClose }) {
  const [showAgain, setShowAgain] = useState(true);

  useEffect(() => {
    const hide = localStorage.getItem('safesend-onboarding-hide');
    if (hide) onClose();
  }, []);

  const handleClose = () => {
    if (!showAgain) {
      localStorage.setItem('safesend-onboarding-hide', 'true');
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <Dialog.Panel className="bg-gray-900 text-white p-6 px-2 rounded-2xl max-w-md w-full space-y-4 shadow-lg">
        <Dialog.Title className="text-xl font-semibold text-center">🚀 Welcome to SafeSend</Dialog.Title>
        <p className="text-gray-300 text-sm text-center">
          Send ETH securely with password verification — no more lost funds from copy-paste mistakes.
        </p>

        <div className="flex flex-col space-y-2 text-sm">
          <Step icon="🧾" title="Create a SafeSend" desc="Enter amount, recipient, and generate a password." />
          <Step icon="🔐" title="Secure Deposit" desc="Funds are held safely in the smart contract." />
          <Step icon="📬" title="Recipient Claims" desc="They use the password to claim the ETH." />
          <Step icon="🔄" title="Always Recoverable" desc="Cancel any unclaimed deposit at any time." />
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={!showAgain}
            onChange={() => setShowAgain(!showAgain)}
            className="form-checkbox accent-blue-500"
          />
          <label className="text-sm text-gray-400">Don’t show this again</label>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl"
        >
          ✅ Let’s Go
        </button>
      </Dialog.Panel>
    </Dialog>
  );
}

const Step = ({ icon, title, desc }) => (
  <div className="flex items-start space-x-3">
    <div className="text-lg">{icon}</div>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-gray-400 text-xs">{desc}</p>
    </div>
  </div>
);

// Simple password generation function
const generatePassword = () => {
  const words = ['apple', 'brave', 'cloud', 'dream', 'earth', 'flame', 'globe', 'happy', 'island', 'jungle']
  const numbers = Math.floor(Math.random() * 100)
  const word1 = words[Math.floor(Math.random() * words.length)]
  const word2 = words[Math.floor(Math.random() * words.length)]
  return `${word1}-${word2}-${numbers}`
}

// Format time ago
const formatTimeAgo = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Format time until
const formatTimeUntil = (date) => {
  const now = new Date()
  const diffMs = date - now
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs <= 0) return 'Expired'
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''}`
  return 'Less than 1 min'
}

function App() {
  // Get initial tab from URL or default to 'send'
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabFromUrl = urlParams.get('tab')
    const validTabs = ['send', 'claim', 'reclaim', 'dashboard']
    return validTabs.includes(tabFromUrl) ? tabFromUrl : 'send'
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
  const [depositFilter, setDepositFilter] = useState('all') // 'all', 'sent', 'received'
  const [searchTerm, setSearchTerm] = useState('')

  // Claim tab state
  const [claimableDeposits, setClaimableDeposits] = useState([])
  const [claimableLoading, setClaimableLoading] = useState(false)
  const [claimPasswords, setClaimPasswords] = useState({}) // depositId -> password
  const [claimingDeposits, setClaimingDeposits] = useState({}) // depositId -> boolean
  const [claimResults, setClaimResults] = useState({}) // depositId -> result
  const [claimErrors, setClaimErrors] = useState({}) // depositId -> error

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
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
    if (!sendForm.amount || parseFloat(sendForm.amount) < 0.011) {
      newErrors.amount = 'Minimum amount is 0.011 ETH (includes 0.001 ETH notification fee)'
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
      if (activeTab === 'reclaim') {
        loadUserDeposits()
      }
      if (activeTab === 'dashboard') {
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
      if (activeTab === 'dashboard') {
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
      if (activeTab === 'reclaim') {
        loadUserDeposits()
      }
      if (activeTab === 'dashboard') {
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
    if (walletState.isConnected && activeTab === 'reclaim') {
      loadUserDeposits()
    }
    if (walletState.isConnected && activeTab === 'dashboard') {
      loadAllDeposits()
    }
    if (walletState.isConnected && activeTab === 'claim') {
      loadClaimableDeposits()
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
    if (depositFilter === 'sent') {
      filtered = filtered.filter(d => d.type === 'sent')
    } else if (depositFilter === 'received') {
      filtered = filtered.filter(d => d.type === 'received')
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


        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => updateActiveTab('send')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${activeTab === 'send'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Send
          </button>
          <button
            onClick={() => updateActiveTab('claim')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${activeTab === 'claim'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Claim
          </button>
          <button
            onClick={() => updateActiveTab('reclaim')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${activeTab === 'reclaim'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            Reclaim
          </button>
          <button
            onClick={() => updateActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'send' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Send ETH</h2>

              {txResult && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 font-medium">✅ Deposit Created!</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Deposit ID: <span className="font-mono text-blue-300">{txResult.depositId}</span>
                  </p>
                  <div className="text-sm text-gray-300 mt-2">
                    <p className="mb-1">Transaction:</p>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${txResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-mono text-xs break-all"
                    >
                      {txResult.txHash}
                    </a>
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    <p className="mb-1">Contract:</p>
                    <a
                      href={`https://sepolia.etherscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-mono text-xs break-all"
                    >
                      {import.meta.env.VITE_CONTRACT_ADDRESS}
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🔗 Click links to view on Sepolia Explorer
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.011"
                    placeholder="0.011"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                    className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: 0.011 ETH (0.001 ETH sent immediately as notification, rest held until claimed)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={sendForm.recipient}
                    onChange={(e) => setSendForm(prev => ({ ...prev, recipient: e.target.value }))}
                    className={`input-field w-full ${errors.recipient ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.recipient && <p className="text-red-400 text-sm mt-1">{errors.recipient}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Click generate or enter manually"
                      value={sendForm.password}
                      onChange={(e) => setSendForm(prev => ({ ...prev, password: e.target.value }))}
                      className={`input-field flex-1 ${errors.password ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="btn-secondary px-3 py-2 text-sm"
                      disabled={isLoading}
                    >
                      Generate
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}

                  {sendForm.password && (
                    <div className="mt-2 p-2 bg-gray-700 rounded border-l-4 border-blue-500">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-blue-300">{sendForm.password}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sendForm.password)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                          disabled={isLoading}
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Share this password with the recipient
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Expires in
                  </label>
                  <select
                    value={sendForm.expiryMinutes}
                    onChange={(e) => setSendForm(prev => ({ ...prev, expiryMinutes: e.target.value }))}
                    className="input-field w-full"
                    disabled={isLoading}
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="360">6 hours</option>
                    <option value="720">12 hours</option>
                    <option value="1440">24 hours</option>
                  </select>
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">{errors.submit}</p>
                  </div>
                )}

                {!window.ethereum ? (
                  <WalletConnect onConnectionChange={handleWalletConnectionChange} />
                ) : (
                  <div className="text-center">
                    {walletState.isConnected ? (
                      <p className="text-sm text-gray-400">
                        ✅ MetaMask Connected: {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                      </p>
                    ) : (
                      <button
                        onClick={connectMetaMask}
                        className="btn-primary w-full"
                      >
                        🦊 Connect MetaMask
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSendETH}
                  disabled={isLoading}
                  className="btn-primary w-full text-lg font-semibold"
                >
                  {isLoading ? '⏳ Sending...' : '🚀 Send ETH'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'claim' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Claim ETH</h2>
                {walletState.isConnected && (
                  <button
                    onClick={loadClaimableDeposits}
                    disabled={claimableLoading}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    {claimableLoading ? '⏳' : '🔄'} Refresh
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Enter the password for each deposit to claim your ETH
              </p>

              {!walletState.isConnected ? (
                <div className="text-center text-gray-400">
                  <p>Connect your wallet to view claimable deposits</p>
                  {!window.ethereum ? (
                    <WalletConnect onConnectionChange={handleWalletConnectionChange} />
                  ) : (
                    <button
                      onClick={connectMetaMask}
                      className="btn-primary mt-4"
                    >
                      🦊 Connect MetaMask
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {claimableLoading ? (
                    <div className="text-center text-gray-400">
                      <p>⏳ Loading claimable deposits...</p>
                    </div>
                  ) : claimableDeposits.length === 0 ? (
                    <div className="text-center text-gray-400">
                      <p>No claimable deposits found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Deposits sent to you will appear here
                      </p>
                      <div className="mt-3 p-3 bg-gray-800/50 rounded text-left text-xs">
                        <p className="text-gray-400 mb-1">Debug info:</p>
                        <p>Connected address: {walletState.address}</p>
                        <p>Check browser console for detailed logs</p>
                      </div>
                    </div>
                  ) : (
                    claimableDeposits.map((deposit) => (
                      <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                        {/* Success banner for this specific deposit */}
                        {claimResults[deposit.id] && (
                          <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-300 font-medium text-sm">✅ Claimed Successfully!</p>
                            <div className="text-xs text-gray-300 mt-1">
                              <a
                                href={`https://sepolia.etherscan.io/tx/${claimResults[deposit.id].txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 underline break-all"
                              >
                                View Transaction
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Deposit #{deposit.id}</p>
                              <span className="text-xs px-2 py-1 rounded-full bg-green-900/30 text-green-300">
                                📥 Received
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              From: {deposit.depositor.slice(0, 6)}...{deposit.depositor.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-400">{deposit.amount} ETH</p>
                            <p className="text-xs text-green-400">Active</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Password from sender
                            </label>
                            <input
                              type="text"
                              placeholder="Enter password to claim"
                              value={claimPasswords[deposit.id] || ''}
                              onChange={(e) => setClaimPasswords(prev => ({
                                ...prev,
                                [deposit.id]: e.target.value
                              }))}
                              className={`input-field w-full ${claimErrors[deposit.id] ? 'border-red-500' : ''}`}
                              disabled={claimingDeposits[deposit.id] || claimResults[deposit.id]}
                            />
                            {claimErrors[deposit.id] && (
                              <p className="text-red-400 text-sm mt-1">{claimErrors[deposit.id]}</p>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              Expires: {deposit.expiryTime.toLocaleString()} •
                              Expires in {formatTimeUntil(deposit.expiryTime)}
                            </p>

                            {!claimResults[deposit.id] && (
                              <button
                                onClick={() => handleClaimETH(deposit.id)}
                                disabled={claimingDeposits[deposit.id] || !claimPasswords[deposit.id]}
                                className="btn-primary text-sm px-4 py-2"
                              >
                                {claimingDeposits[deposit.id] ? '⏳ Claiming...' : '💰 Claim'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="text-center text-gray-500 text-sm">
                    <p>💡 Ask the sender for the password to claim each deposit</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reclaim' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reclaim Your ETH</h2>
              <p className="text-gray-400 text-sm mb-4">
                Cancel deposits you created to get your ETH back
              </p>

              {!walletState.isConnected ? (
                <div className="text-center text-gray-400">
                  <p>Connect your wallet to view reclaimable deposits</p>
                  {!window.ethereum ? (
                    <WalletConnect onConnectionChange={handleWalletConnectionChange} />
                  ) : (
                    <button
                      onClick={connectMetaMask}
                      className="btn-primary mt-4"
                    >
                      🦊 Connect MetaMask
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {depositsLoading ? (
                    <div className="text-center text-gray-400">
                      <p>⏳ Loading your deposits...</p>
                    </div>
                  ) : userDeposits.filter(d => d.canCancel).length === 0 ? (
                    <div className="text-center text-gray-400">
                      <p>No reclaimable deposits found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Active deposits you create will appear here
                      </p>
                    </div>
                  ) : (
                    userDeposits
                      .filter(d => d.canCancel)
                      .map((deposit) => (
                        <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">Deposit #{deposit.id}</p>
                                <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30 text-orange-300">
                                  📤 Sent
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                To: {deposit.recipient.slice(0, 6)}...{deposit.recipient.slice(-4)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-blue-400">{deposit.amount} ETH</p>
                              <p className={`text-xs ${deposit.isExpired ? 'text-red-400' : 'text-green-400'
                                }`}>
                                {deposit.isExpired ? 'Expired' : 'Active'}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              Expires: {deposit.expiryTime.toLocaleString()} •
                              {deposit.isExpired ?
                                `Expired ${formatTimeAgo(deposit.expiryTime)}` :
                                `Expires in ${formatTimeUntil(deposit.expiryTime)}`
                              }
                            </p>
                            <button
                              onClick={() => handleReclaimETH(deposit.id)}
                              className="btn-secondary text-sm px-3 py-1"
                            >
                              🔄 {deposit.isExpired ? 'Reclaim ETH' : 'Cancel Deposit'}
                            </button>
                          </div>
                        </div>
                      ))
                  )}

                  <div className="text-center text-gray-500 text-sm">
                    <p>💡 You can cancel any deposit you created at any time</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Deposits</h2>

              {!walletState.isConnected ? (
                <div className="text-center text-gray-400">
                  <p>Connect your wallet to view all your deposits</p>
                  {!window.ethereum ? (
                    <WalletConnect onConnectionChange={handleWalletConnectionChange} />
                  ) : (
                    <button
                      onClick={connectMetaMask}
                      className="btn-primary mt-4"
                    >
                      🦊 Connect MetaMask
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search and Filter Controls */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Search by ID, address, or amount..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field w-full text-sm"
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDepositFilter('all')}
                        className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${depositFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                          }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setDepositFilter('sent')}
                        className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${depositFilter === 'sent'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                          }`}
                      >
                        Sent
                      </button>
                      <button
                        onClick={() => setDepositFilter('received')}
                        className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${depositFilter === 'received'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                          }`}
                      >
                        Received
                      </button>
                    </div>
                  </div>

                  {/* Deposits List */}
                  {allDepositsLoading ? (
                    <div className="text-center text-gray-400">
                      <p>⏳ Loading your deposits...</p>
                    </div>
                  ) : getFilteredDeposits().length === 0 ? (
                    <div className="text-center text-gray-400">
                      <p>
                        {searchTerm ? 'No deposits match your search' :
                          depositFilter === 'all' ? 'No deposits found' :
                            depositFilter === 'sent' ? 'No deposits sent' :
                              'No deposits received'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {depositFilter === 'all' && !searchTerm && 'Deposits you send or receive will appear here'}
                      </p>
                    </div>
                  ) : (
                    getFilteredDeposits().map((deposit) => (
                      <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Deposit #{deposit.id}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${deposit.type === 'sent' ? 'bg-orange-900/30 text-orange-300' : 'bg-green-900/30 text-green-300'
                                }`}>
                                {deposit.type === 'sent' ? '📤 Sent' : '📥 Received'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {deposit.type === 'sent' ?
                                `To: ${deposit.recipient.slice(0, 6)}...${deposit.recipient.slice(-4)}` :
                                `From: ${deposit.depositor.slice(0, 6)}...${deposit.depositor.slice(-4)}`
                              }
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-400">{deposit.amount} ETH</p>
                            <p className={`text-xs ${deposit.claimed ? 'text-green-400' :
                              deposit.cancelled ? 'text-gray-400' :
                                deposit.isExpired ? 'text-red-400' :
                                  'text-green-400'
                              }`}>
                              {deposit.claimed ? 'Claimed' :
                                deposit.cancelled ? 'Cancelled' :
                                  deposit.isExpired ? 'Expired' :
                                    'Active'}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Expires: {deposit.expiryTime.toLocaleString()} •
                            {deposit.isExpired ?
                              `Expired ${formatTimeAgo(deposit.expiryTime)}` :
                              `Expires in ${formatTimeUntil(deposit.expiryTime)}`
                            }
                          </p>
                          <div className="flex gap-2">
                            {deposit.canClaim && (
                              <button
                                onClick={() => updateActiveTab('claim')}
                                className="btn-primary text-sm px-3 py-1"
                              >
                                💰 Claim
                              </button>
                            )}
                            {deposit.canCancel && (
                              <button
                                onClick={() => handleReclaimETH(deposit.id)}
                                className="btn-secondary text-sm px-3 py-1"
                              >
                                🔄 Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="text-center text-gray-500 text-sm">
                    <p>💡 Shows all deposits sent to or from your address</p>
                  </div>
                </div>
              )}
            </div>
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
