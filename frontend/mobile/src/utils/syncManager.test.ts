import NetInfo from '@react-native-community/netinfo'
import { syncOfflineQueue, startAutoSync } from './syncManager'
import { useOfflineQueueStore } from '../stores/offlineQueueStore'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Get fresh store state helper
const getStore = () => useOfflineQueueStore.getState()

// Reset everything before each test
beforeEach(async () => {
  // Reset fetch mock
  mockFetch.mockReset()

  // Reset NetInfo mock to connected
  ;(NetInfo.fetch as jest.Mock).mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  })

  // Reset store state
  useOfflineQueueStore.setState({
    queue: [],
    isSyncing: false,
    syncErrors: [],
  })
})

describe('syncOfflineQueue', () => {
  describe('preconditions', () => {
    it('does nothing if already syncing', async () => {
      getStore().setSyncing(true)
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      // Should not have made any fetch calls
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does nothing if no network connection', async () => {
      ;(NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      })
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does nothing if internet not reachable', async () => {
      ;(NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
      })
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('does nothing if queue is empty', async () => {
      await syncOfflineQueue()

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('successful sync', () => {
    it('processes mutations and removes from queue on success', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ ok: true, entry: { id: 1 } }),
      })

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        body: { habit_id: 1 },
        entityType: 'entry',
      })
      expect(getStore().queue).toHaveLength(1)

      await syncOfflineQueue()

      expect(getStore().queue).toHaveLength(0)
    })

    it('sets syncing state during sync', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      })

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      // Use a longer-running fetch to check intermediate state
      let syncingDuringFetch = false
      mockFetch.mockImplementation(() => {
        syncingDuringFetch = getStore().isSyncing
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        })
      })

      await syncOfflineQueue()

      expect(syncingDuringFetch).toBe(true)
      expect(getStore().isSyncing).toBe(false)
    })

    it('clears sync errors before sync', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      })

      getStore().addSyncError('old-error', 'Previous error')
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(getStore().syncErrors).toHaveLength(0)
    })

    it('sends correct request to API', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      })

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        body: { habit_id: 1, duration_minutes: 30 },
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/entries',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habit_id: 1, duration_minutes: 30 }),
        })
      )
    })

    it('processes mutations in order', async () => {
      const callOrder: string[] = []
      mockFetch.mockImplementation((url: string) => {
        callOrder.push(url)
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        })
      })

      await getStore().enqueueMutation({
        endpoint: '/entries/1',
        method: 'PUT',
        entityType: 'entry',
      })
      await getStore().enqueueMutation({
        endpoint: '/entries/2',
        method: 'PUT',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(callOrder).toEqual([
        'http://localhost:3001/entries/1',
        'http://localhost:3001/entries/2',
      ])
    })
  })

  describe('failed sync', () => {
    it('increments retry count on API error', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        json: () => Promise.resolve({ ok: false, error: 'Server error' }),
      })

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(getStore().queue[0].retryCount).toBe(1)
    })

    it('keeps mutation in queue on retryable error', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        json: () => Promise.resolve({ ok: false, error: 'Server error' }),
      })

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(getStore().queue).toHaveLength(1)
    })

    it('adds sync error for non-retryable errors', async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        json: () => Promise.resolve({ ok: false, error: 'Bad request' }),
      })

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      expect(getStore().syncErrors).toHaveLength(1)
      expect(getStore().syncErrors[0].error).toBe('Bad request')
    })

    it('skips mutations that exceeded max retry count', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id

      // Exceed retry limit
      await getStore().updateMutationRetry(mutationId, 'Error 1')
      await getStore().updateMutationRetry(mutationId, 'Error 2')
      await getStore().updateMutationRetry(mutationId, 'Error 3')

      await syncOfflineQueue()

      // Should not have called fetch for this mutation
      expect(mockFetch).not.toHaveBeenCalled()
      // Should add error message
      expect(getStore().syncErrors).toHaveLength(1)
      expect(getStore().syncErrors[0].error).toContain('Failed after')
    })

    it('continues processing after individual mutation failure', async () => {
      let callCount = 0
      mockFetch.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({
            status: 400,
            json: () => Promise.resolve({ ok: false, error: 'Bad request' }),
          })
        }
        return Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        })
      })

      await getStore().enqueueMutation({
        endpoint: '/entries/1',
        method: 'POST',
        entityType: 'entry',
      })
      await getStore().enqueueMutation({
        endpoint: '/entries/2',
        method: 'POST',
        entityType: 'entry',
      })

      await syncOfflineQueue()

      // Both mutations should have been attempted
      expect(mockFetch).toHaveBeenCalledTimes(2)
      // Second one should be removed (success), first stays (failed)
      expect(getStore().queue).toHaveLength(1)
    })
  })
})

describe('startAutoSync', () => {
  it('returns unsubscribe function', () => {
    const unsubscribe = startAutoSync()
    expect(typeof unsubscribe).toBe('function')
  })

  it('subscribes to NetInfo events', () => {
    startAutoSync()
    expect(NetInfo.addEventListener).toHaveBeenCalled()
  })

  it('triggers initial sync if online', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ ok: true }),
    })

    await getStore().enqueueMutation({
      endpoint: '/entries',
      method: 'POST',
      entityType: 'entry',
    })

    startAutoSync()

    // Wait for async initial sync
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockFetch).toHaveBeenCalled()
  })

  it('does not trigger initial sync if offline', async () => {
    ;(NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    })

    await getStore().enqueueMutation({
      endpoint: '/entries',
      method: 'POST',
      entityType: 'entry',
    })

    startAutoSync()

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
