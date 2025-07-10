import { useState, useEffect } from 'react'
import { BrowserProvider } from 'ethers'

export default function SimpleWalletConnect() {
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [balance, setBalance] = useState('0')
  const [isConnecting, setIsConnecting] = useState(false)

  const SEPOLIA_CHAIN_ID = 11155111

  useEffect(() => {
    checkConnection()
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setChainId(parseInt(chainId, 16))
          await updateBalance(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    } else {
      setAccount(null)
      setBalance('0')
    }
  }

  const handleChainChanged = (chainId) => {
    setChainId(parseInt(chainId, 16))
  }

  const updateBalance = async (address) => {
    try {
      const provider = new BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(address)
      setBalance((Number(balance) / 1e18).toFixed(4))
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or use a Web3 wallet browser!')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      setAccount(accounts[0])
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const chainIdInt = parseInt(chainId, 16)
      setChainId(chainIdInt)
      
      if (chainIdInt !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia()
      }
      
      await updateBalance(accounts[0])
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet: ' + error.message)
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }]
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          })
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError)
        }
      }
    }
  }

  const disconnect = () => {
    setAccount(null)
    setBalance('0')
    setChainId(null)
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const isOnSepolia = chainId === SEPOLIA_CHAIN_ID

  if (account) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Connected</p>
            <p className="font-mono text-sm">{formatAddress(account)}</p>
          </div>
          <button
            onClick={disconnect}
            className="btn-secondary text-sm px-3 py-1"
          >
            Disconnect
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Balance</p>
            <p className="font-semibold">{balance} ETH</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Network</p>
            <p className={`text-sm font-medium ${isOnSepolia ? 'text-green-400' : 'text-orange-400'}`}>
              {isOnSepolia ? 'Sepolia' : 'Wrong Network'}
            </p>
          </div>
        </div>

        {!isOnSepolia && (
          <button
            onClick={switchToSepolia}
            className="btn-primary w-full text-sm"
          >
            Switch to Sepolia
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="btn-primary w-full"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          MetaMask or Web3 browser required
        </p>
      </div>
    </div>
  )
}