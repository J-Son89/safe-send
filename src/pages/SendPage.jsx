import { useState } from 'react'
import { generateSecurePassword } from '../utils/passwordGenerator'
import { copyToClipboard } from '../utils/formatters'
import { EXPIRY_OPTIONS } from '../utils/constants'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function SendPage({ 
  isConnected, 
  contractConstants, 
  onSendETH, 
  isLoading, 
  txResult, 
  errors 
}) {
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    password: '',
    expiryMinutes: '30'
  })

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSendETH(formData)
  }

  const handleCopy = async (text) => {
    const success = await copyToClipboard(text)
    if (success) {
      // Could add toast notification here
      console.log('Copied to clipboard')
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center text-gray-400">
        <p>Connect your wallet to send ETH</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Send ETH</h2>

      {txResult && (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-green-300 font-medium text-lg">✅ Deposit Created Successfully!</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 text-sm">
            {/* Deposit Details */}
            <div className="bg-gray-800/50 rounded p-3">
              <p className="text-blue-300 font-medium mb-2">📋 Deposit Details:</p>
              <div className="space-y-1 text-gray-300">
                <p>• ID: <span className="font-mono text-blue-300">#{txResult.depositId}</span></p>
                <p>• Amount: <span className="text-green-400">{formData.amount} ETH</span></p>
                <p>• To: <span className="font-mono">{formData.recipient.slice(0,8)}...{formData.recipient.slice(-6)}</span></p>
                <p>• Expires: <span className="text-yellow-400">{formData.expiryMinutes} minutes</span></p>
                <p>• Password: <span className="font-mono text-purple-300">{formData.password}</span></p>
              </div>
            </div>
            
            {/* Fee Breakdown */}
            <div className="bg-gray-800/50 rounded p-3">
              <p className="text-blue-300 font-medium mb-2">💰 Fee Breakdown:</p>
              <div className="space-y-1 text-gray-300">
                <p>• Notification sent: <span className="text-green-400">{contractConstants.notificationAmount} ETH</span></p>
                <p>• Platform fee: <span className="text-orange-400">{contractConstants.platformFeePercent}%</span></p>
                <p>• Gas used: <span className="text-gray-400">{txResult.gasUsed ? `${(parseInt(txResult.gasUsed) / 1000).toFixed(1)}k` : 'N/A'}</span></p>
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="bg-blue-900/30 rounded p-3">
              <p className="text-blue-300 font-medium mb-2">📤 Next Steps:</p>
              <div className="space-y-1 text-gray-300 text-xs">
                <p>1. Share Deposit ID <span className="font-mono text-blue-300">#{txResult.depositId}</span> with recipient</p>
                <p>2. Share password <span className="font-mono text-purple-300">{formData.password}</span> with recipient</p>
                <p>3. Recipient uses Claim tab to get their ETH</p>
                <p>4. You can cancel anytime in Reclaim tab if needed</p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex gap-4 text-xs">
              <a
                href={`https://sepolia.etherscan.io/tx/${txResult.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                🔗 View Transaction
              </a>
              <a
                href={`https://sepolia.etherscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                🔗 View Contract
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Amount (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min={parseFloat(contractConstants.notificationAmount) + parseFloat(contractConstants.minDeposit)}
            placeholder={parseFloat(contractConstants.notificationAmount) + parseFloat(contractConstants.minDeposit)}
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Minimum: {parseFloat(contractConstants.notificationAmount) + parseFloat(contractConstants.minDeposit)} ETH (includes {contractConstants.notificationAmount} ETH notification + {contractConstants.platformFeePercent}% platform fee)
          </p>
          <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-xs">
            <p className="text-blue-300 font-medium">💡 Fee Breakdown:</p>
            <p className="text-gray-400 mt-1">
              • {contractConstants.notificationAmount} ETH notification (sent immediately to recipient)<br/>
              • {contractConstants.platformFeePercent}% SafeSend platform fee<br/>
              • Remaining amount held in contract until claimed<br/>
              • Plus standard Ethereum gas fees
            </p>
          </div>
        </div>

        {/* Recipient Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={formData.recipient}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
            className={`input-field w-full ${errors.recipient ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.recipient && <p className="text-red-400 text-sm mt-1">{errors.recipient}</p>}
        </div>

        {/* Password Generation */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`input-field flex-1 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Click generate or enter manually"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="btn-secondary px-3 py-2 text-sm"
              disabled={isLoading}
            >
              Generate
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          
          {formData.password && (
            <div className="mt-2 p-2 bg-gray-700 rounded border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-blue-300">{formData.password}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(formData.password)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                  disabled={isLoading}
                >
                  📋 Copy
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>📤 Share this with the recipient</p>
              </div>
            </div>
          )}
        </div>

        {/* Expiry Time */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Expires in
          </label>
          <select
            value={formData.expiryMinutes}
            onChange={(e) => setFormData(prev => ({ ...prev, expiryMinutes: e.target.value }))}
            className="input-field w-full"
            disabled={isLoading}
          >
            {EXPIRY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Sending...
            </>
          ) : (
            'Send ETH'
          )}
        </button>
      </form>
    </div>
  )
}