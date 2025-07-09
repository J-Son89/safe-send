import { createContext, useContext, useState, useEffect } from 'react'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'
import { BrowserProvider } from 'ethers'

const WalletContext = createContext()

// Web3Modal configuration
const projectId = 'YOUR_PROJECT_ID' // You'll need to get this from WalletConnect Cloud

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: 'https://rpc.sepolia.org'
}

const metadata = {
  name: 'SafeSend',
  description: 'Secure ETH transfers with password verification',
  url: 'https://safesend.app',
  icons: ['https://safesend.app/icon.png']
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: '...',
  defaultChainId: 11155111, // Sepolia
})

// Create modal
const modal = createWeb3Modal({
  ethersConfig,
  chains: [mainnet, sepolia],
  projectId,
  enableAnalytics: true
})

export function WalletProvider({ children }) {
  const [walletProvider, setWalletProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState('0')

  useEffect(() => {
    // Subscribe to connection events
    const unsubscribe = modal.subscribeProvider(({ provider, address, chainId: chain, isConnected: connected }) => {
      if (connected && provider) {
        setWalletProvider(provider)
        setAccount(address)
        setChainId(chain)
        setIsConnected(true)
        updateBalance(provider, address)
      } else {
        setWalletProvider(null)
        setAccount(null)
        setChainId(null)
        setIsConnected(false)
        setBalance('0')
      }
    })

    return unsubscribe
  }, [])

  const updateBalance = async (provider, address) => {
    try {
      const ethersProvider = new BrowserProvider(provider)
      const balance = await ethersProvider.getBalance(address)
      setBalance(balance.toString())
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  const connectWallet = async () => {
    try {
      await modal.open()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await modal.disconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const switchNetwork = async (targetChainId) => {
    try {
      if (walletProvider) {
        await walletProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${targetChainId.toString(16)}` }]
        })
      }
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const getProvider = () => {
    if (walletProvider) {
      return new BrowserProvider(walletProvider)
    }
    return null
  }

  const value = {
    account,
    chainId,
    isConnected,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    getProvider,
    updateBalance: () => updateBalance(walletProvider, account)
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}