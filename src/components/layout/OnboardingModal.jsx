import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'

const Step = ({ icon, title, desc }) => (
  <div className="flex items-start space-x-3">
    <div className="text-lg">{icon}</div>
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-gray-400 text-xs">{desc}</p>
    </div>
  </div>
)

export default function OnboardingModal({ open, onClose }) {
  const [showAgain, setShowAgain] = useState(true)

  useEffect(() => {
    const hide = localStorage.getItem('safesend-onboarding-hide')
    if (hide) onClose()
  }, [onClose])

  const handleClose = () => {
    if (!showAgain) {
      localStorage.setItem('safesend-onboarding-hide', 'true')
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <Dialog.Panel className="bg-gray-900 text-white p-6 px-2 rounded-2xl max-w-md w-full space-y-4 shadow-lg">
        <Dialog.Title className="text-xl font-semibold text-center">🚀 Welcome to SafeSend</Dialog.Title>
        <p className="text-gray-300 text-sm text-center">
          Send ETH securely with password verification — no more lost funds from copy-paste mistakes.
        </p>

        <div className="flex flex-col space-y-2 text-sm">
          <Step icon="🧾" title="Create a SafeSend" desc="Enter amount, recipient, and generate a password." />
          <Step icon="🔐" title="Secure Deposit" desc="Funds are held safely in the smart contract." />
          <Step icon="📬" title="Recipient Claims" desc="They use the password to claim the ETH." />
          <Step icon="🔄" title="Always Recoverable" desc="Cancel any unclaimed deposit at any time." />
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={!showAgain}
            onChange={() => setShowAgain(!showAgain)}
            className="form-checkbox accent-blue-500"
          />
          <label className="text-sm text-gray-400">Don't show this again</label>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-xl"
        >
          ✅ Let's Go
        </button>
      </Dialog.Panel>
    </Dialog>
  )
}