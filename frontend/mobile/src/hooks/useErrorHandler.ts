import { useCallback } from 'react'
import { useToast } from '../components/ui/ToastProvider'
import { getUserFriendlyErrorMessage, NetworkError } from '../utils/errors'

/**
 * Hook for handling errors with user-friendly messages
 */
export function useErrorHandler() {
  const { showToast } = useToast()

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const message = getUserFriendlyErrorMessage(error)
      const fullMessage = context ? `${context}: ${message}` : message

      // Network errors are informational (queued for sync)
      // Other errors are actual failures
      const toastType = error instanceof NetworkError ? 'info' : 'error'

      showToast({
        type: toastType,
        message: fullMessage,
      })

      // Still log to console for debugging
      console.error(context ? `[${context}]` : 'Error:', error)
    },
    [showToast]
  )

  const handleSuccess = useCallback(
    (message: string) => {
      showToast({
        type: 'success',
        message,
      })
    },
    [showToast]
  )

  return { handleError, handleSuccess }
}
