import { useState, useEffect } from 'react'
import LoadingSpinner from './LoadingSpinner'

export default function TransactionStatus({ 
  isLoading, 
  txHash, 
  error, 
  success, 
  onClose,
  title = "Transaction Status"
}) {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    if (!isLoading) return

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isLoading])

  useEffect(() => {
    if (!isLoading) {
      setTimeElapsed(0)
    }
  }, [isLoading])

  if (!isLoading && !error && !success) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {!isLoading && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {isLoading && (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-300 mt-4">Processing transaction...</p>
            <p className="text-sm text-gray-500 mt-2">
              This may take 15-30 seconds
            </p>
            {timeElapsed > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {timeElapsed}s elapsed
              </p>
            )}
            {txHash && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
                >
                  {txHash}
                </a>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">❌</div>
            <h4 className="text-red-300 font-medium mb-2">Transaction Failed</h4>
            <p className="text-gray-300 text-sm mb-4">{error.message}</p>
            {error.solution && (
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-3 mb-4">
                <p className="text-yellow-300 text-sm">
                  <strong>💡 Solution:</strong> {error.solution}
                </p>
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="text-center">
            <div className="text-green-400 text-4xl mb-4">✅</div>
            <h4 className="text-green-300 font-medium mb-2">Transaction Successful</h4>
            <p className="text-gray-300 text-sm mb-4">{success.message}</p>
            {success.txHash && (
              <div className="bg-gray-700 rounded p-3 mb-4">
                <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${success.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all"
                >
                  {success.txHash}
                </a>
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                Continue
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}