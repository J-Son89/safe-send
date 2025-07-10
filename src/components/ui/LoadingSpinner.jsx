export default function LoadingSpinner({ size = 'md', text = '', variant = 'spin' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const SpinVariant = () => (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-blue-500`}></div>
  )

  const DotsVariant = () => (
    <div className="flex space-x-1">
      <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}></div>
      <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
      <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
    </div>
  )

  const PulseVariant = () => (
    <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}></div>
  )

  const renderSpinner = () => {
    switch (variant) {
      case 'dots': return <DotsVariant />
      case 'pulse': return <PulseVariant />
      default: return <SpinVariant />
    }
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {renderSpinner()}
      {text && (
        <span className="text-gray-400 text-sm animate-pulse">
          {text}
        </span>
      )}
    </div>
  )
}