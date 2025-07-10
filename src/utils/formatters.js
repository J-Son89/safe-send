// Format time ago
export const formatTimeAgo = (date) => {
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Format time until
export const formatTimeUntil = (date) => {
  const now = new Date()
  const diffMs = date - now
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs <= 0) return 'Expired'
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? 's' : ''}`
  return 'Less than 1 min'
}

// Copy to clipboard utility
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}