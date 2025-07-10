import { formatTimeUntil } from '../utils/formatters'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ClaimPage({
  walletState,
  claimableDeposits,
  claimableLoading,
  claimPasswords,
  claimingDeposits,
  claimResults,
  claimErrors,
  onLoadClaimableDeposits,
  onClaimETH,
  onPasswordChange,
  connectMetaMask,
  WalletConnect,
  onWalletConnectionChange
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Claim ETH</h2>
        {walletState.isConnected && (
          <button
            onClick={onLoadClaimableDeposits}
            disabled={claimableLoading}
            className="btn-secondary text-sm px-3 py-1 flex items-center gap-1 transition-all duration-200"
          >
            {claimableLoading ? (
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
      <p className="text-gray-400 text-sm mb-4">
        Enter the password for each deposit to claim your ETH
      </p>

      {!walletState.isConnected ? (
        <div className="text-center text-gray-400">
          <p>Connect your wallet to view claimable deposits</p>
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
          {claimableLoading ? (
            <LoadingSpinner text="Loading claimable deposits..." />
          ) : claimableDeposits.length === 0 ? (
            <div className="text-center text-gray-400">
              <p>No claimable deposits found</p>
              <p className="text-sm text-gray-500 mt-1">
                Deposits sent to you will appear here
              </p>
            </div>
          ) : (
            claimableDeposits.map((deposit) => (
              <div key={deposit.id} className="border border-gray-600 rounded-lg p-4">
                {/* Success banner for this specific deposit */}
                {claimResults[deposit.id] && (
                  <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 font-medium text-sm">✅ Claimed Successfully!</p>
                    <div className="text-xs text-gray-300 mt-1">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${claimResults[deposit.id].txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline break-all"
                      >
                        View Transaction
                      </a>
                    </div>
                  </div>
                )}

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
                    <p className="text-xs text-green-400">Active</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password from sender
                    </label>
                    <input
                      type="text"
                      placeholder="Enter password to claim"
                      value={claimPasswords[deposit.id] || ''}
                      onChange={(e) => onPasswordChange(deposit.id, e.target.value)}
                      className={`input-field w-full ${claimErrors[deposit.id] ? 'border-red-500' : ''}`}
                      disabled={claimingDeposits[deposit.id] || claimResults[deposit.id]}
                    />
                    {claimErrors[deposit.id] && (
                      <p className="text-red-400 text-sm mt-1">{claimErrors[deposit.id]}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Expires: {deposit.expiryTime.toLocaleString()} •
                      Expires in {formatTimeUntil(deposit.expiryTime)}
                    </p>

                    {!claimResults[deposit.id] && (
                      <button
                        onClick={() => onClaimETH(deposit.id)}
                        disabled={claimingDeposits[deposit.id] || !claimPasswords[deposit.id]}
                        className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                      >
                        {claimingDeposits[deposit.id] ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Claiming...
                          </>
                        ) : (
                          '💰 Claim'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="text-center text-gray-500 text-sm">
            <p>💡 Ask the sender for the password to claim each deposit</p>
          </div>
        </div>
      )}
    </div>
  )
}