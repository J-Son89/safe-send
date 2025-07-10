import { TAB_NAMES } from '../../utils/constants'

export default function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: TAB_NAMES.SEND, label: 'Send', icon: '📤' },
    { id: TAB_NAMES.CLAIM, label: 'Claim', icon: '💰' },
    { id: TAB_NAMES.RECLAIM, label: 'Reclaim', icon: '🔄' },
    { id: TAB_NAMES.HISTORY, label: 'History', icon: '📋' }
  ]

  return (
    <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}