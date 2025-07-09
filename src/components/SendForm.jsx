import { useState } from 'react'

// Simple password generation function - will enhance later
const generatePassword = () => {
  const words = ['apple', 'brave', 'cloud', 'dream', 'earth', 'flame', 'globe', 'happy', 'island', 'jungle']
  const numbers = Math.floor(Math.random() * 100)
  const word1 = words[Math.floor(Math.random() * words.length)]
  const word2 = words[Math.floor(Math.random() * words.length)]
  return `${word1}-${word2}-${numbers}`
}

export default function SendForm() {
  const [formData, setFormData] = useState({
    amount: '',
    recipient: '',
    password: '',
    expiryMinutes: '30'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const handleGenerate = () => {
    const newPassword = generatePassword()
    setFormData(prev => ({ ...prev, password: newPassword }))
    setShowPassword(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
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

    // Mock send logic
    alert(`Mock Send:
Amount: ${formData.amount} ETH
To: ${formData.recipient}
Password: ${formData.password}
Expires in: ${formData.expiryMinutes} minutes
    
In real app: This would create a deposit on the blockchain!`)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Send ETH</h2>
      
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
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`input-field flex-1 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Click generate or enter manually"
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="btn-secondary px-3 py-2 text-sm"
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
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="360">6 hours</option>
            <option value="720">12 hours</option>
            <option value="1440">24 hours</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Send ETH (Mock)
        </button>
      </form>
    </div>
  )
}