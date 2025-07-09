import { useState } from 'react'
import WalletConnect from './components/WalletConnect'

function App() {
  const [activeTab, setActiveTab] = useState('send')

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">SafeSend</h1>
          <p className="text-gray-400">Secure ETH transfers with password verification</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'send'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Send
          </button>
          <button
            onClick={() => setActiveTab('claim')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'claim'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Claim
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === 'send' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Send ETH</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Amount (ETH)
                  </label>
                  <input
                    type="number"
                    placeholder="0.01"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="input-field w-full"
                  />
                </div>
                <WalletConnect />
              </div>
            </div>
          )}

          {activeTab === 'claim' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Claim ETH</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Deposit ID
                  </label>
                  <input
                    type="number"
                    placeholder="Enter deposit ID"
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="input-field w-full"
                  />
                </div>
                <WalletConnect />
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
              <div className="text-center text-gray-400">
                <p>Connect your wallet to view deposits</p>
                <WalletConnect />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App