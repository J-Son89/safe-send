import { useState, useEffect } from 'react'
import { BrowserProvider } from 'ethers'
import ContractService from '../services/contractService'
import { modal } from '../utils/walletConnect'
import { formatTimeUntil } from '../utils/formatters'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import WalletConnect from '../components/WalletConnect'

export default function ShareableClaimPage({
  depositId,
  password,
  walletState,
  connectMetaMask,
  WalletConnect: WalletConnectComponent,
  onWalletConnectionChange
}) {
  const [deposit, setDeposit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [claimResult, setClaimResult] = useState(null)
  const [error, setError] = useState(null)
  const [passwordInput, setPasswordInput] = useState(password || '')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)

  // Load the specific deposit
  const loadDeposit = async () => {
    if (!depositId) return

    setLoading(true)
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

      console.log('Loading deposit:', depositId)

      // Get deposit details
      const depositData = await contractService.getDeposit(depositId)
      
      if (!depositData || depositData.depositor === '0x0000000000000000000000000000000000000000') {
        throw new Error('Deposit not found')
      }

      setDeposit(depositData)
      setError(null)
      
      // Check if we have a connected wallet to validate authorization
      if (walletState.isConnected && walletState.account) {
        const userAddress = walletState.account.toLowerCase()
        const isRecipient = depositData.recipient.toLowerCase() === userAddress
        const isDepositor = depositData.depositor.toLowerCase() === userAddress
        setIsAuthorized(isRecipient || isDepositor)
        setWalletAddress(userAddress)
      } else {
        setIsAuthorized(false)
        setWalletAddress(null)
      }

    } catch (error) {
      console.error('Error loading deposit:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    if (!walletState.isConnected) {
      alert('Please connect your wallet first')
      return
    }

    if (!passwordInput) {
      setError('Password is required')
      return
    }

    setClaiming(true)
    setError(null)

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
      const result = await contractService.claimDeposit(depositId, passwordInput)

      setClaimResult(result)

      // Reload deposit to show updated status
      loadDeposit()

    } catch (error) {
      console.error('Claim error:', error)
      setError(error.message)
    } finally {
      setClaiming(false)
    }
  }

  // Load deposit on component mount or when depositId changes
  useEffect(() => {
    if (depositId) {
      loadDeposit()
    }
  }, [depositId])

  // Re-check authorization when wallet state changes
  useEffect(() => {
    if (deposit && walletState.isConnected && walletState.account) {
      const userAddress = walletState.account.toLowerCase()
      const isRecipient = deposit.recipient.toLowerCase() === userAddress
      const isDepositor = deposit.depositor.toLowerCase() === userAddress
      setIsAuthorized(isRecipient || isDepositor)
      setWalletAddress(userAddress)
    } else {
      setIsAuthorized(false)
      setWalletAddress(null)
    }
  }, [walletState.isConnected, walletState.account, deposit])

  if (!depositId) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Claim Link</h1>
          <p className="text-gray-400">This claim link is missing deposit information.</p>
          <a href="https://safe-send-3f3cbc0807c0.herokuapp.com/" className="btn-primary mt-4 inline-block">
            Go to SafeSend
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">SafeSend</h1>
        </div>

        <div className="card">
          {loading ? (
            <LoadingSpinner text="Loading deposit details..." />
          ) : error ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Error</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <a href="https://safe-send-3f3cbc0807c0.herokuapp.com/" className="btn-primary">
                Go to SafeSend
              </a>
            </div>
          ) : !walletState.isConnected ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Connect Wallet Required</h2>
              <p className="text-gray-400 mb-4">Please connect your wallet to view this deposit</p>
              
              {!window.ethereum ? (
                <WalletConnectComponent onConnectionChange={onWalletConnectionChange} />
              ) : (
                <button
                  onClick={connectMetaMask}
                  className="btn-primary"
                >
                  🦊 Connect MetaMask
                </button>
              )}
              
              <div className="text-center mt-6">
                <a 
                  href="https://safe-send-3f3cbc0807c0.herokuapp.com/" 
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  ← Go to SafeSend
                </a>
              </div>
            </div>
          ) : deposit && !isAuthorized ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Access Denied</h2>
              <p className="text-gray-400 mb-4">
                This deposit can only be viewed by the sender or recipient.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Connected wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </p>
              
              <div className="text-center mt-6">
                <a 
                  href="https://safe-send-3f3cbc0807c0.herokuapp.com/" 
                  className="btn-primary"
                >
                  Go to SafeSend
                </a>
              </div>
            </div>
          ) : deposit && isAuthorized ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Claim ETH Transfer</h2>
              
              {/* Success banner */}
              {claimResult && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-300 font-medium text-sm">✅ Claimed Successfully!</p>
                  <div className="text-xs text-gray-300 mt-1">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${claimResult.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      View Transaction
                    </a>
                  </div>
                </div>
              )}

              {/* Deposit Details */}
              <div className="border border-gray-600 rounded-lg p-4 mb-4">
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
                    <p className="text-xs text-green-400">
                      {deposit.claimed ? 'Claimed' : deposit.cancelled ? 'Cancelled' : 'Active'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Expires: {deposit.expiryTime.toLocaleString()} •
                  {deposit.claimed ? ' Already claimed' : ` Expires in ${formatTimeUntil(deposit.expiryTime)}`}
                </div>
              </div>

              {/* Deposit Status Checks */}
              {deposit.claimed ? (
                <div className="text-center text-gray-400">
                  <p>This deposit has already been claimed.</p>
                </div>
              ) : deposit.cancelled ? (
                <div className="text-center text-red-400">
                  <p>This deposit has been cancelled by the sender.</p>
                </div>
              ) : new Date() > deposit.expiryTime ? (
                <div className="text-center text-red-400">
                  <p>This deposit has expired.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password from sender
                    </label>
                    <input
                      type="text"
                      placeholder="Enter password to claim"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className={`input-field w-full ${error ? 'border-red-500' : ''}`}
                      disabled={claiming}
                      readOnly={!!password} // Make readonly if password was provided in URL
                    />
                    {error && (
                      <p className="text-red-400 text-sm mt-1">{error}</p>
                    )}
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={handleClaim}
                    disabled={claiming || !passwordInput || claimResult}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {claiming ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Claiming...
                      </>
                    ) : (
                      '💰 Claim ETH'
                    )}
                  </button>

                </div>
              )}

              {/* Footer Link */}
              <div className="text-center mt-6">
                <a 
                  href="https://safe-send-3f3cbc0807c0.herokuapp.com/" 
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  ← Go to SafeSend
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}