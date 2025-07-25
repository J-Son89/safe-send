import { useState } from 'react'
import { BrowserProvider } from 'ethers'
import ContractService from '../services/contractService'
import { generateSecurePassword } from '../utils/passwordGenerator'
import { getBlockExplorerUrl, getBlockExplorerName } from '../utils/blockExplorer'

export default function SendForm({ isConnected, account }) {
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    password: '',
    expiryMinutes: '30'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [txResult, setTxResult] = useState(null)
  const [chainId, setChainId] = useState(null)

  const handleGenerate = () => {
    const newPassword = generateSecurePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Please connect your wallet first')
      return
    }

    // Basic validation
    const newErrors = {}
    if (!formData.amount || parseFloat(formData.amount) < 0.01) {
      newErrors.amount = 'Minimum amount is 0.01 ETH'
    }
    if (!formData.recipient) {
      newErrors.recipient = 'Recipient address is required'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})
    setTxResult(null)

    try {
      // Get provider and signer
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Get network info for block explorer
      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))
      
      // Create contract service
      const contractService = new ContractService(provider, signer)
      
      // Create deposit
      const result = await contractService.createDeposit(
        formData.recipient,
        formData.password,
        parseInt(formData.expiryMinutes),
        formData.amount
      )

      setTxResult(result)
      
      // Reset form on success
      setFormData({
        amount: '',
        recipient: '',
        password: '',
        expiryMinutes: '30'
      })
      setShowPassword(false)

    } catch (error) {
      console.error('Send error:', error)
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
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
          <p className="text-green-300 font-medium">✅ Deposit Created!</p>
          <p className="text-sm text-gray-300 mt-1">
            Deposit ID: <span className="font-mono">{txResult.depositId}</span>
          </p>
          <div className="text-sm text-gray-300 mt-1">
            TX: <span className="font-mono text-xs">{txResult.txHash}</span>
            {chainId && getBlockExplorerUrl(chainId, txResult.txHash) && (
              <a
                href={getBlockExplorerUrl(chainId, txResult.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-400 hover:text-blue-300 underline text-xs"
              >
                View on {getBlockExplorerName(chainId)}
              </a>
            )}
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
            min="0.01"
            placeholder="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className={`input-field w-full ${errors.amount ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 0.01 ETH (includes 0.001 ETH notification fee)
          </p>
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
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                readOnly
                className={`input-field w-full pr-10 ${errors.password ? 'border-red-500' : ''} ${!formData.password ? 'text-gray-500' : ''}`}
                placeholder="Click generate to create password"
                disabled={isLoading}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleGenerate}
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
                  onClick={() => copyToClipboard(formData.password)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                  disabled={isLoading}
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Share this password with the recipient
              </p>
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
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="360">6 hours</option>
            <option value="720">12 hours</option>
            <option value="1440">24 hours</option>
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
          className="btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send ETH'}
        </button>
      </form>
    </div>
  )
}