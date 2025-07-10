import { createWeb3Modal, defaultConfig } from '@web3modal/ethers'

// 1. Get projectId from env vars
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io',
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC || 'https://rpc.sepolia.org'
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
  rpcUrl: import.meta.env.VITE_SEPOLIA_RPC || 'https://rpc.sepolia.org',
  defaultChainId: 11155111
})

// 5. Create a Web3Modal instance
export const modal = createWeb3Modal({
  ethersConfig,
  chains: [sepolia],
  projectId,
  enableAnalytics: true
})

export default modal