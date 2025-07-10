import { parseError, getErrorSolution } from '../../utils/errorHandler'

export default function ErrorDisplay({ error, onDismiss, className = "" }) {
  if (!error) return null

  const parsedError = parseError(error)
  const solution = getErrorSolution(parsedError.code)

  return (
    <div className={`p-4 bg-red-900/20 border border-red-500/30 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="text-red-400 text-lg">❌</div>
        <div className="flex-1">
          <h4 className="text-red-300 font-medium mb-1">Error</h4>
          <p className="text-gray-300 text-sm mb-3">{parsedError.message}</p>
          
          {solution && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-3 mb-3">
              <p className="text-yellow-300 text-sm">
                <strong>💡 How to fix:</strong> {solution}
              </p>
            </div>
          )}

          {!parsedError.userFriendly && parsedError.originalError && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-400">
                Technical details
              </summary>
              <pre className="mt-2 p-2 bg-gray-800 rounded overflow-auto">
                {parsedError.originalError.toString()}
              </pre>
            </details>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}