import { formatTimeAgo, formatTimeUntil, copyToClipboard } from '../utils/formatters'
import { TAB_NAMES, DEPOSIT_FILTER_TYPES, DEPOSIT_TYPES } from '../utils/constants'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import SkeletonLoader from '../components/ui/SkeletonLoader'

export default function HistoryPage({
  walletState,
  allDeposits,
  allDepositsLoading,
  depositFilter,
  searchTerm,
  onDepositFilterChange,
  onSearchTermChange,
  onTabChange,
  onReclaimETH,
  filteredDeposits,
  connectMetaMask,
  WalletConnect,
  onWalletConnectionChange
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Deposits</h2>

      {!walletState.isConnected ? (
        <div className="text-center text-gray-400">
          <p>Connect your wallet to view all your deposits</p>
          {!window.ethereum ? (
            <WalletConnect onConnectionChange={onWalletConnectionChange} />
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
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="input-field w-full text-sm"
            />

            <div className="flex gap-2">
              <button
                onClick={() => onDepositFilterChange(DEPOSIT_FILTER_TYPES.ALL)}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${depositFilter === DEPOSIT_FILTER_TYPES.ALL
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => onDepositFilterChange(DEPOSIT_FILTER_TYPES.SENT)}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${depositFilter === DEPOSIT_FILTER_TYPES.SENT
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
              >
                Sent
              </button>
              <button
                onClick={() => onDepositFilterChange(DEPOSIT_FILTER_TYPES.RECEIVED)}
                className={`flex-1 py-2 px-3 rounded-md font-medium transition-colors text-sm ${depositFilter === DEPOSIT_FILTER_TYPES.RECEIVED
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
            <SkeletonLoader variant="deposit" count={3} />
          ) : filteredDeposits.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>
                {searchTerm ? 'No deposits match your search' :
                  depositFilter === DEPOSIT_FILTER_TYPES.ALL ? 'No deposits found' :
                    depositFilter === DEPOSIT_FILTER_TYPES.SENT ? 'No deposits sent' :
                      'No deposits received'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {depositFilter === DEPOSIT_FILTER_TYPES.ALL && !searchTerm && 'Deposits you send or receive will appear here'}
              </p>
            </div>
          ) : (
            filteredDeposits.map((deposit) => (
              <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">Deposit #{deposit.id}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${deposit.type === DEPOSIT_TYPES.SENT ? 'bg-orange-900/30 text-orange-300' : 'bg-green-900/30 text-green-300'
                        }`}>
                        {deposit.type === DEPOSIT_TYPES.SENT ? '📤 Sent' : '📥 Received'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>
                        {deposit.type === DEPOSIT_TYPES.SENT ?
                          `To: ${deposit.recipient.slice(0, 6)}...${deposit.recipient.slice(-4)}` :
                          `From: ${deposit.depositor.slice(0, 6)}...${deposit.depositor.slice(-4)}`
                        }
                      </span>
                      <button
                        onClick={() => copyToClipboard(deposit.type === DEPOSIT_TYPES.SENT ? deposit.recipient : deposit.depositor)}
                        className="text-blue-400 hover:text-blue-300 text-xs px-1 py-0.5 rounded hover:bg-blue-900/30"
                        title="Copy address"
                      >
                        Copy
                      </button>
                    </div>
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

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                  <p className="text-xs text-gray-500 break-words">
                    {deposit.isExpired ?
                      `Expired ${formatTimeAgo(deposit.expiryTime)}` :
                      `Expires in ${formatTimeUntil(deposit.expiryTime)}`
                    }
                  </p>
                  <div className="flex gap-2 flex-shrink-0">
                    {deposit.canClaim && (
                      <button
                        onClick={() => onTabChange(TAB_NAMES.CLAIM)}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        💰 Claim
                      </button>
                    )}
                    {deposit.canCancel && (
                      <button
                        onClick={() => onReclaimETH(deposit.id)}
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
  )
}