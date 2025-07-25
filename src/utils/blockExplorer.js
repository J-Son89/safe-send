// Block explorer utility functions

const BLOCK_EXPLORERS = {
  1: 'https://etherscan.io', // Mainnet
  11155111: 'https://sepolia.etherscan.io' // Sepolia testnet
}

export function getBlockExplorerUrl(chainId, txHash) {
  const baseUrl = BLOCK_EXPLORERS[chainId]
  if (!baseUrl) {
    return null
  }
  return `${baseUrl}/tx/${txHash}`
}

export function getBlockExplorerName(chainId) {
  switch (chainId) {
    case 1:
      return 'Etherscan'
    case 11155111:
      return 'Sepolia Etherscan'
    default:
      return 'Block Explorer'
  }
}