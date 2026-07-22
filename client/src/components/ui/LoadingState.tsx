import { LoadingSpinner } from './LoadingSpinner'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = 'Chargement...', fullScreen }: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <LoadingSpinner size={32} />
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  )

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-gray-950">{content}</div>
  }

  return <div className="flex justify-center py-16">{content}</div>
}
