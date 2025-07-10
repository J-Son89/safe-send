import LoadingSpinner from './LoadingSpinner'

export default function AppLoader() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">SafeSend</h1>
          <p className="text-gray-400">Secure ETH transfers with password verification</p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            <p className="text-gray-300">Initializing SafeSend...</p>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>

        {/* Loading Steps */}
        <div className="text-sm text-gray-500 space-y-1">
          <p>✓ Loading wallet providers...</p>
          <p>✓ Connecting to Ethereum network...</p>
          <p>○ Ready to use</p>
        </div>
      </div>
    </div>
  )
}