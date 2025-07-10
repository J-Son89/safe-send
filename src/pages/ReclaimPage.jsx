import { formatTimeAgo, formatTimeUntil } from '../utils/formatters'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ReclaimPage({
  walletState,
  userDeposits,
  depositsLoading,
  onReclaimETH,
  onLoadUserDeposits,
  connectMetaMask,
  WalletConnect,
  onWalletConnectionChange
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Reclaim Your ETH</h2>
          <p className="text-gray-400 text-sm">
            Cancel deposits you created to get your ETH back
          </p>
        </div>
        {walletState.isConnected && (
          <button
            onClick={onLoadUserDeposits}
            disabled={depositsLoading}
            className="btn-secondary text-sm px-3 py-1 flex items-center gap-1 transition-all duration-200"
          >
            {depositsLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh</span>
              </>
            )}
          </button>
        )}
      </div>

      {!walletState.isConnected ? (
        <div className="text-center text-gray-400">
          <p>Connect your wallet to view reclaimable deposits</p>
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
          {depositsLoading ? (
            <LoadingSpinner text="Loading your deposits..." />
          ) : userDeposits.filter(d => d.canCancel).length === 0 ? (
            <div className="text-center text-gray-400">
              <p>No reclaimable deposits found</p>
              <p className="text-sm text-gray-500 mt-1">
                Active deposits you create will appear here
              </p>
            </div>
          ) : (
            userDeposits
              .filter(d => d.canCancel)
              .map((deposit) => (
                <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Deposit #{deposit.id}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-900/30 text-orange-300">
                          📤 Sent
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        To: {deposit.recipient.slice(0, 6)}...{deposit.recipient.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-400">{deposit.amount} ETH</p>
                      <p className={`text-xs ${deposit.isExpired ? 'text-red-400' : 'text-green-400'}`}>
                        {deposit.isExpired ? 'Expired' : 'Active'}
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
                    <button
                      onClick={() => onReclaimETH(deposit.id)}
                      className="btn-secondary text-sm px-3 py-1"
                    >
                      🔄 {deposit.isExpired ? 'Reclaim ETH' : 'Cancel Deposit'}
                    </button>
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
  )
}