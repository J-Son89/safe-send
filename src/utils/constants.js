// App constants
export const DEFAULT_CONTRACT_CONSTANTS = {
  notificationAmount: '0.001',
  minDeposit: '0.01',
  nextDepositId: '0',
  platformFeePercentage: '50',
  platformFeePercent: '0.5',
  collectedFees: '0'
}

export const EXPIRY_OPTIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '360', label: '6 hours' },
  { value: '720', label: '12 hours' },
  { value: '1440', label: '24 hours' }
]

export const DEPOSIT_STATUS = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
}

export const TAB_NAMES = {
  SEND: 'send',
  CLAIM: 'claim',
  RECLAIM: 'reclaim',
  HISTORY: 'history'
}