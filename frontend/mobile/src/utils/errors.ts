/**
 * Error types and user-friendly error messages
 */

export class NetworkError extends Error {
  constructor(message: string = 'No internet connection') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ServerError extends Error {
  constructor(message: string = 'Server error occurred', public statusCode?: number) {
    super(message)
    this.name = 'ServerError'
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Invalid data', public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class QueueError extends Error {
  constructor(message: string = 'Queue operation failed') {
    super(message)
    this.name = 'QueueError'
  }
}

/**
 * Convert API errors to user-friendly messages
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return "No internet connection. Your changes will sync when you're back online."
  }

  if (error instanceof ValidationError) {
    return error.field
      ? `Invalid ${error.field}: ${error.message}`
      : `Validation error: ${error.message}`
  }

  if (error instanceof ServerError) {
    if (error.statusCode === 404) {
      return 'The requested item was not found.'
    }
    if (error.statusCode === 403 || error.statusCode === 401) {
      return "You don't have permission to perform this action."
    }
    if (error.statusCode && error.statusCode >= 500) {
      return 'Server error. Please try again later.'
    }
    return error.message || 'Something went wrong on the server.'
  }

  if (error instanceof QueueError) {
    return 'Failed to queue your change. Please try again.'
  }

  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.'
  }

  return 'An unexpected error occurred.'
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) {
    return true
  }

  if (error instanceof ServerError) {
    // Retry on 5xx errors and 429 (rate limit)
    return error.statusCode ? error.statusCode >= 500 || error.statusCode === 429 : false
  }

  return false
}

/**
 * Get retry delay based on attempt count (exponential backoff)
 */
export function getRetryDelay(attemptCount: number): number {
  const baseDelay = 1000 // 1 second
  const maxDelay = 30000 // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay)
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000
}
