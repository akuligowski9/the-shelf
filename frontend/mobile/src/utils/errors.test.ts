import {
  NetworkError,
  ServerError,
  ValidationError,
  QueueError,
  getUserFriendlyErrorMessage,
  isRetryableError,
  getRetryDelay,
} from './errors'

describe('Error Classes', () => {
  describe('NetworkError', () => {
    it('creates error with default message', () => {
      const error = new NetworkError()
      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('No internet connection')
    })

    it('creates error with custom message', () => {
      const error = new NetworkError('Custom network error')
      expect(error.message).toBe('Custom network error')
    })

    it('is instanceof Error', () => {
      const error = new NetworkError()
      expect(error).toBeInstanceOf(Error)
    })
  })

  describe('ServerError', () => {
    it('creates error with default message', () => {
      const error = new ServerError()
      expect(error.name).toBe('ServerError')
      expect(error.message).toBe('Server error occurred')
      expect(error.statusCode).toBeUndefined()
    })

    it('creates error with custom message and status code', () => {
      const error = new ServerError('Not found', 404)
      expect(error.message).toBe('Not found')
      expect(error.statusCode).toBe(404)
    })
  })

  describe('ValidationError', () => {
    it('creates error with default message', () => {
      const error = new ValidationError()
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Invalid data')
      expect(error.field).toBeUndefined()
    })

    it('creates error with custom message and field', () => {
      const error = new ValidationError('Too short', 'password')
      expect(error.message).toBe('Too short')
      expect(error.field).toBe('password')
    })
  })

  describe('QueueError', () => {
    it('creates error with default message', () => {
      const error = new QueueError()
      expect(error.name).toBe('QueueError')
      expect(error.message).toBe('Queue operation failed')
    })

    it('creates error with custom message', () => {
      const error = new QueueError('Storage full')
      expect(error.message).toBe('Storage full')
    })
  })
})

describe('getUserFriendlyErrorMessage', () => {
  it('returns friendly message for NetworkError', () => {
    const error = new NetworkError()
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toContain('No internet connection')
    expect(message).toContain('sync when')
  })

  it('returns field-specific message for ValidationError with field', () => {
    const error = new ValidationError('must be at least 8 characters', 'password')
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('Invalid password: must be at least 8 characters')
  })

  it('returns generic message for ValidationError without field', () => {
    const error = new ValidationError('Data format invalid')
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('Validation error: Data format invalid')
  })

  it('returns 404 message for ServerError with 404 status', () => {
    const error = new ServerError('Not found', 404)
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('The requested item was not found.')
  })

  it('returns permission message for ServerError with 401 status', () => {
    const error = new ServerError('Unauthorized', 401)
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toContain('permission')
  })

  it('returns permission message for ServerError with 403 status', () => {
    const error = new ServerError('Forbidden', 403)
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toContain('permission')
  })

  it('returns server error message for 5xx errors', () => {
    const error = new ServerError('Internal error', 500)
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('Server error. Please try again later.')
  })

  it('returns original message for other ServerError', () => {
    const error = new ServerError('Bad request', 400)
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('Bad request')
  })

  it('returns queue error message for QueueError', () => {
    const error = new QueueError()
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('Failed to queue your change. Please try again.')
  })

  it('returns error message for generic Error', () => {
    const error = new Error('Something happened')
    const message = getUserFriendlyErrorMessage(error)
    expect(message).toBe('Something happened')
  })

  it('returns fallback for non-Error objects', () => {
    const message = getUserFriendlyErrorMessage('string error')
    expect(message).toBe('An unexpected error occurred.')
  })

  it('returns fallback for null/undefined', () => {
    expect(getUserFriendlyErrorMessage(null)).toBe('An unexpected error occurred.')
    expect(getUserFriendlyErrorMessage(undefined)).toBe('An unexpected error occurred.')
  })
})

describe('isRetryableError', () => {
  it('returns true for NetworkError', () => {
    const error = new NetworkError()
    expect(isRetryableError(error)).toBe(true)
  })

  it('returns true for ServerError with 5xx status', () => {
    expect(isRetryableError(new ServerError('Error', 500))).toBe(true)
    expect(isRetryableError(new ServerError('Error', 502))).toBe(true)
    expect(isRetryableError(new ServerError('Error', 503))).toBe(true)
  })

  it('returns true for ServerError with 429 (rate limit)', () => {
    const error = new ServerError('Too many requests', 429)
    expect(isRetryableError(error)).toBe(true)
  })

  it('returns false for ServerError with 4xx status (except 429)', () => {
    expect(isRetryableError(new ServerError('Error', 400))).toBe(false)
    expect(isRetryableError(new ServerError('Error', 401))).toBe(false)
    expect(isRetryableError(new ServerError('Error', 404))).toBe(false)
  })

  it('returns false for ServerError without status code', () => {
    const error = new ServerError('Error')
    expect(isRetryableError(error)).toBe(false)
  })

  it('returns false for ValidationError', () => {
    const error = new ValidationError()
    expect(isRetryableError(error)).toBe(false)
  })

  it('returns false for QueueError', () => {
    const error = new QueueError()
    expect(isRetryableError(error)).toBe(false)
  })

  it('returns false for generic Error', () => {
    const error = new Error('Generic')
    expect(isRetryableError(error)).toBe(false)
  })

  it('returns false for non-Error values', () => {
    expect(isRetryableError('string')).toBe(false)
    expect(isRetryableError(null)).toBe(false)
    expect(isRetryableError(undefined)).toBe(false)
  })
})

describe('getRetryDelay', () => {
  it('returns ~1 second for first attempt (attempt 0)', () => {
    const delay = getRetryDelay(0)
    // Base delay is 1000ms, plus up to 1000ms jitter
    expect(delay).toBeGreaterThanOrEqual(1000)
    expect(delay).toBeLessThan(2000)
  })

  it('returns ~2 seconds for second attempt (attempt 1)', () => {
    const delay = getRetryDelay(1)
    expect(delay).toBeGreaterThanOrEqual(2000)
    expect(delay).toBeLessThan(3000)
  })

  it('returns ~4 seconds for third attempt (attempt 2)', () => {
    const delay = getRetryDelay(2)
    expect(delay).toBeGreaterThanOrEqual(4000)
    expect(delay).toBeLessThan(5000)
  })

  it('caps delay at 30 seconds for high attempt counts', () => {
    const delay = getRetryDelay(10)
    // Max delay is 30000ms, plus up to 1000ms jitter
    expect(delay).toBeGreaterThanOrEqual(30000)
    expect(delay).toBeLessThan(31000)
  })

  it('includes jitter (randomness) in delay', () => {
    // Run multiple times and check for variance
    const delays = Array.from({ length: 10 }, () => getRetryDelay(0))
    const uniqueDelays = new Set(delays)
    // With random jitter, we should get multiple unique values
    expect(uniqueDelays.size).toBeGreaterThan(1)
  })
})
