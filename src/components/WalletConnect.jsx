import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'
import { useEffect, useState } from 'react'
import { BrowserProvider } from 'ethers'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'YOUR_PROJECT_ID' // You'll need to get this

// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org'
}

// 3. Create a metadata object
const metadata = {
  name: 'SafeSend',
  description: 'Secure ETH transfers with password verification',
  url: 'https://safesend.app', 
  icons: ['https://safesend.app/icon.png']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: 'https://rpc.sepolia.org',
  defaultChainId: 11155111
})

// 5. Create a Web3Modal instance
const modal = createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
  enableAnalytics: true
})

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('0')
  const [chainId, setChainId] = useState(null)

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        const walletProvider = modal.getWalletProvider()
        if (walletProvider) {
          const provider = new BrowserProvider(walletProvider)
          const accounts = await provider.listAccounts()
          
          if (accounts.length > 0) {
            setIsConnected(true)
            setAddress(accounts[0].address)
            updateBalance(provider, accounts[0].address)
            
            const network = await provider.getNetwork()
            setChainId(Number(network.chainId))
          }
        }
      } catch (error) {
        console.log('No existing connection')
      }
    }

    checkConnection()

    // Subscribe to connection events
    const unsubscribe = modal.subscribeProvider(({ address, chainId, isConnected }) => {
      setIsConnected(isConnected)
      if (isConnected && address) {
        setAddress(address)
        setChainId(chainId)
        
        // Get provider and update balance
        const walletProvider = modal.getWalletProvider()
        if (walletProvider) {
          const provider = new BrowserProvider(walletProvider)
          updateBalance(provider, address)
        }
      } else {
        setAddress('')
        setBalance('0')
        setChainId(null)
      }
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  const updateBalance = async (provider, address) => {
    try {
      const balance = await provider.getBalance(address)
      setBalance((Number(balance) / 1e18).toFixed(4))
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const connectWallet = async () => {
    try {
      await modal.open()
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const disconnect = async () => {
    try {
      await modal.disconnect()
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const isOnSepolia = chainId === 11155111

  if (isConnected && address) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Connected</p>
            <p className="font-mono text-sm">{formatAddress(address)}</p>
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
          <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <p className="text-sm text-orange-300">
              Please switch to Sepolia testnet in your wallet
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={connectWallet}
        className="btn-primary w-full"
      >
        Connect Wallet
      </button>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Supports 100+ wallets via QR code
        </p>
      </div>
    </div>
  )
}