export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-blue-500`}></div>
      {text && <span className="text-gray-400 text-sm">{text}</span>}
    </div>
  )
}