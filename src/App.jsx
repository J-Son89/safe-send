import { useState, useEffect } from 'react'
import { BrowserProvider } from 'ethers'
import WalletConnect from './components/WalletConnect'
import SendForm from './components/SendForm'
import ContractService from './services/contractService'
import { modal } from './utils/walletConnect'

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
  const [activeTab, setActiveTab] = useState('send')
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
    if (!sendForm.amount || parseFloat(sendForm.amount) < 0.01) {
      newErrors.amount = 'Minimum amount is 0.01 ETH'
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
      
      // If user is on reclaim tab, refresh deposits
      if (activeTab === 'reclaim') {
        loadUserDeposits()
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
      loadUserDeposits()
      
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

  // Load user deposits when wallet connects or reclaim tab is activated
  useEffect(() => {
    if (walletState.isConnected && activeTab === 'reclaim') {
      loadUserDeposits()
    }
  }, [walletState.isConnected, walletState.address, activeTab])

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
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'send'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Send
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'claim'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Claim
          </button>
          <button
            onClick={() => setActiveTab('reclaim')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'reclaim'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Reclaim
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'dashboard'
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
                    min="0.01"
                    placeholder="0.01"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                    className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: 0.01 ETH (includes 0.001 ETH notification fee)
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
                        ✅ MetaMask Connected: {walletState.address?.slice(0,6)}...{walletState.address?.slice(-4)}
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
              <h2 className="text-xl font-semibold mb-4">Claim ETH</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deposit ID
                  </label>
                  <input
                    type="number"
                    placeholder="Enter deposit ID"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="input-field w-full"
                  />
                </div>
                <WalletConnect onConnectionChange={handleWalletConnectionChange} />
              </div>
            </div>
          )}

          {activeTab === 'reclaim' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Reclaim Your ETH</h2>
              <p className="text-gray-400 text-sm mb-4">
                Cancel expired or unwanted deposits to get your ETH back
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
                  ) : userDeposits.length === 0 ? (
                    <div className="text-center text-gray-400">
                      <p>No deposits found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Deposits you create will appear here
                      </p>
                    </div>
                  ) : (
                    userDeposits.map((deposit) => (
                      <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Deposit #{deposit.id}</p>
                            <p className="text-sm text-gray-400">
                              To: {deposit.recipient.slice(0, 6)}...{deposit.recipient.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-blue-400">{deposit.amount} ETH</p>
                            <p className={`text-xs ${
                              deposit.claimed ? 'text-green-400' : 
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
                          {deposit.canCancel && (
                            <button 
                              onClick={() => handleReclaimETH(deposit.id)}
                              className="btn-secondary text-sm px-3 py-1"
                            >
                              🔄 {deposit.isExpired ? 'Reclaim ETH' : 'Cancel Deposit'}
                            </button>
                          )}
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
              <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
              <div className="text-center text-gray-400">
                <p>Connect your wallet to view deposits</p>
                <WalletConnect onConnectionChange={handleWalletConnectionChange} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App