export default function Footer() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
  const gitCommit = (__GIT_COMMIT_SHA__ || 'unknown').slice(0, 7)
  
  return (
    <footer className="mt-8 pt-6 border-t border-gray-700">
      <div className="text-center space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-center sm:gap-6 gap-2 text-xs text-gray-500">
          {/* Contract Link */}
          {contractAddress && (
            <a
              href={`https://sepolia.etherscan.io/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="View contract on Etherscan"
            >
              📄 Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </a>
          )}
          
          {/* GitHub Commit */}
          <a
            href={`https://github.com/J-Son89/safe-send/commit/${__GIT_COMMIT_SHA__ || 'main'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="View source code commit"
          >
            🐙 Commit: {gitCommit}
          </a>
        </div>
        
        <p className="text-xs text-gray-600">
          Open source • Verify contract code before use
        </p>
      </div>
    </footer>
  )
}
