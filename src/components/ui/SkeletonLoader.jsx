export default function SkeletonLoader({ variant = 'deposit', count = 3 }) {
  const DepositSkeleton = () => (
    <div className="border border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
          <div className="h-3 bg-gray-700 rounded w-32"></div>
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 bg-gray-700 rounded w-16"></div>
          <div className="h-3 bg-gray-700 rounded w-12"></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-700 rounded w-48"></div>
        <div className="h-8 bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  )

  const FormSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-20"></div>
        <div className="h-10 bg-gray-700 rounded w-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-24"></div>
        <div className="h-10 bg-gray-700 rounded w-full"></div>
      </div>
      <div className="h-12 bg-gray-700 rounded w-full"></div>
    </div>
  )

  const CardSkeleton = () => (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
      </div>
    </div>
  )

  const renderSkeleton = () => {
    switch (variant) {
      case 'form': return <FormSkeleton />
      case 'card': return <CardSkeleton />
      default: return <DepositSkeleton />
    }
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  )
}