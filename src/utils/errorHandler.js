// Enhanced error handling for SafeSend dApp
export class SafeSendError extends Error {
  constructor(message, code, originalError = null) {
    super(message)
    this.name = 'SafeSendError'
    this.code = code
    this.originalError = originalError
  }
}

export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  DEPOSIT_NOT_FOUND: 'DEPOSIT_NOT_FOUND',
  DEPOSIT_EXPIRED: 'DEPOSIT_EXPIRED',
  DEPOSIT_ALREADY_CLAIMED: 'DEPOSIT_ALREADY_CLAIMED',
  DEPOSIT_CANCELLED: 'DEPOSIT_CANCELLED',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

export function parseError(error) {
  if (!error) return { code: ERROR_CODES.UNKNOWN_ERROR, message: 'Unknown error occurred' }

  const errorMessage = error.message || error.toString()
  const lowerMessage = errorMessage.toLowerCase()

  // User rejected transaction
  if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
    return {
      code: ERROR_CODES.TRANSACTION_REJECTED,
      message: 'Transaction was cancelled by user',
      userFriendly: true
    }
  }

  // Wrong network
  if (lowerMessage.includes('switch to sepolia') || lowerMessage.includes('wrong network')) {
    return {
      code: ERROR_CODES.WRONG_NETWORK,
      message: 'Please switch to Sepolia testnet in your wallet',
      userFriendly: true
    }
  }

  // Insufficient funds
  if (lowerMessage.includes('insufficient funds') || lowerMessage.includes('insufficient balance')) {
    return {
      code: ERROR_CODES.INSUFFICIENT_FUNDS,
      message: 'Insufficient ETH balance for this transaction',
      userFriendly: true
    }
  }

  // Invalid address
  if (lowerMessage.includes('invalid address') || lowerMessage.includes('invalid recipient')) {
    return {
      code: ERROR_CODES.INVALID_ADDRESS,
      message: 'Invalid recipient address. Please check the address format.',
      userFriendly: true
    }
  }

  // Password related errors
  if (lowerMessage.includes('incorrect password') || lowerMessage.includes('invalid password')) {
    return {
      code: ERROR_CODES.INVALID_PASSWORD,
      message: 'Incorrect password. Please check and try again.',
      userFriendly: true
    }
  }

  // Deposit not found
  if (lowerMessage.includes('deposit not found') || lowerMessage.includes('does not exist')) {
    return {
      code: ERROR_CODES.DEPOSIT_NOT_FOUND,
      message: 'Deposit not found. Please check the deposit ID.',
      userFriendly: true
    }
  }

  // Deposit expired
  if (lowerMessage.includes('expired') || lowerMessage.includes('deadline')) {
    return {
      code: ERROR_CODES.DEPOSIT_EXPIRED,
      message: 'This deposit has expired and can no longer be claimed.',
      userFriendly: true
    }
  }

  // Already claimed
  if (lowerMessage.includes('already claimed') || lowerMessage.includes('claimed')) {
    return {
      code: ERROR_CODES.DEPOSIT_ALREADY_CLAIMED,
      message: 'This deposit has already been claimed.',
      userFriendly: true
    }
  }

  // Cancelled
  if (lowerMessage.includes('cancelled') || lowerMessage.includes('canceled')) {
    return {
      code: ERROR_CODES.DEPOSIT_CANCELLED,
      message: 'This deposit has been cancelled by the sender.',
      userFriendly: true
    }
  }

  // Network/RPC errors
  if (lowerMessage.includes('network') || lowerMessage.includes('rpc') || lowerMessage.includes('connection')) {
    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: 'Network connection error. Please check your internet and try again.',
      userFriendly: true
    }
  }

  // Contract errors
  if (lowerMessage.includes('revert') || lowerMessage.includes('execution reverted')) {
    return {
      code: ERROR_CODES.CONTRACT_ERROR,
      message: 'Transaction failed. Please check your inputs and try again.',
      userFriendly: true
    }
  }

  // Default case
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: errorMessage.length > 100 ? 'An unexpected error occurred. Please try again.' : errorMessage,
    userFriendly: false
  }
}

export function getErrorSolution(errorCode) {
  const solutions = {
    [ERROR_CODES.WALLET_NOT_CONNECTED]: 'Connect your MetaMask or WalletConnect wallet to continue.',
    [ERROR_CODES.WRONG_NETWORK]: 'Open your wallet and switch to the Sepolia testnet.',
    [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Get Sepolia ETH from a faucet or reduce the amount.',
    [ERROR_CODES.INVALID_ADDRESS]: 'Ensure the address starts with 0x and is 42 characters long.',
    [ERROR_CODES.INVALID_PASSWORD]: 'Double-check the password with the sender.',
    [ERROR_CODES.DEPOSIT_NOT_FOUND]: 'Verify the deposit ID with the sender.',
    [ERROR_CODES.DEPOSIT_EXPIRED]: 'Contact the sender to create a new deposit.',
    [ERROR_CODES.DEPOSIT_ALREADY_CLAIMED]: 'This deposit cannot be claimed again.',
    [ERROR_CODES.DEPOSIT_CANCELLED]: 'This deposit is no longer available.',
    [ERROR_CODES.TRANSACTION_REJECTED]: 'Approve the transaction in your wallet to continue.',
    [ERROR_CODES.NETWORK_ERROR]: 'Check your internet connection and try again.',
    [ERROR_CODES.CONTRACT_ERROR]: 'Verify all inputs are correct and try again.',
    [ERROR_CODES.UNKNOWN_ERROR]: 'Please try again or contact support if the issue persists.'
  }

  return solutions[errorCode] || solutions[ERROR_CODES.UNKNOWN_ERROR]
}