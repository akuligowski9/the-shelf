import AsyncStorage from '@react-native-async-storage/async-storage'
import { useOfflineQueueStore, QueuedMutation, throwNetworkError } from './offlineQueueStore'
import { NetworkError } from '../utils/errors'

// Get fresh store state helper
const getStore = () => useOfflineQueueStore.getState()

// Reset store before each test
beforeEach(async () => {
  // Clear AsyncStorage mock
  ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
  ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
  ;(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined)

  // Reset store state
  useOfflineQueueStore.setState({
    queue: [],
    isSyncing: false,
    syncErrors: [],
  })
})

describe('offlineQueueStore', () => {
  describe('initial state', () => {
    it('starts with empty queue', () => {
      expect(getStore().queue).toEqual([])
    })

    it('starts with isSyncing false', () => {
      expect(getStore().isSyncing).toBe(false)
    })

    it('starts with empty syncErrors', () => {
      expect(getStore().syncErrors).toEqual([])
    })
  })

  describe('enqueueMutation', () => {
    it('adds mutation to queue with generated id and timestamp', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        body: { habit_id: 1, duration_minutes: 30 },
        entityType: 'entry',
      })

      const { queue } = getStore()
      expect(queue).toHaveLength(1)
      expect(queue[0].endpoint).toBe('/entries')
      expect(queue[0].method).toBe('POST')
      expect(queue[0].body).toEqual({ habit_id: 1, duration_minutes: 30 })
      expect(queue[0].entityType).toBe('entry')
      expect(queue[0].retryCount).toBe(0)
      expect(queue[0].id).toBeDefined()
      expect(queue[0].timestamp).toBeDefined()
    })

    it('generates unique ids for each mutation', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      const { queue } = getStore()
      expect(queue[0].id).not.toBe(queue[1].id)
    })

    it('persists queue to AsyncStorage', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })

    it('maintains queue order (FIFO)', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries/1',
        method: 'PUT',
        entityType: 'entry',
        entityId: 1,
      })
      await getStore().enqueueMutation({
        endpoint: '/entries/2',
        method: 'DELETE',
        entityType: 'entry',
        entityId: 2,
      })

      const { queue } = getStore()
      expect(queue[0].endpoint).toBe('/entries/1')
      expect(queue[1].endpoint).toBe('/entries/2')
    })
  })

  describe('dequeueMutation', () => {
    it('removes mutation from queue by id', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const { queue } = getStore()
      const mutationId = queue[0].id

      await getStore().dequeueMutation(mutationId)

      expect(getStore().queue).toHaveLength(0)
    })

    it('removes associated sync error when dequeuing', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id
      getStore().addSyncError(mutationId, 'Test error')

      await getStore().dequeueMutation(mutationId)

      expect(getStore().syncErrors).toHaveLength(0)
    })

    it('persists queue after dequeue', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id
      ;(AsyncStorage.setItem as jest.Mock).mockClear()

      await getStore().dequeueMutation(mutationId)

      expect(AsyncStorage.setItem).toHaveBeenCalled()
    })

    it('does nothing if mutation id not found', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      await getStore().dequeueMutation('nonexistent-id')

      expect(getStore().queue).toHaveLength(1)
    })
  })

  describe('updateMutationRetry', () => {
    it('increments retry count', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id

      await getStore().updateMutationRetry(mutationId, 'Network error')

      expect(getStore().queue[0].retryCount).toBe(1)
    })

    it('stores last error message', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id

      await getStore().updateMutationRetry(mutationId, 'Server timeout')

      expect(getStore().queue[0].lastError).toBe('Server timeout')
    })

    it('accumulates retry counts', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id

      await getStore().updateMutationRetry(mutationId, 'Error 1')
      await getStore().updateMutationRetry(mutationId, 'Error 2')
      await getStore().updateMutationRetry(mutationId, 'Error 3')

      expect(getStore().queue[0].retryCount).toBe(3)
      expect(getStore().queue[0].lastError).toBe('Error 3')
    })
  })

  describe('clearQueue', () => {
    it('removes all mutations', async () => {
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

      await getStore().clearQueue()

      expect(getStore().queue).toHaveLength(0)
    })

    it('clears sync errors', async () => {
      getStore().addSyncError('test-id', 'Error')

      await getStore().clearQueue()

      expect(getStore().syncErrors).toHaveLength(0)
    })

    it('removes queue from AsyncStorage', async () => {
      await getStore().clearQueue()

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@shelf/offline_queue')
    })
  })

  describe('loadQueue', () => {
    it('loads queue from AsyncStorage', async () => {
      const storedQueue: QueuedMutation[] = [
        {
          id: 'test-1',
          timestamp: Date.now(),
          endpoint: '/entries',
          method: 'POST',
          entityType: 'entry',
          retryCount: 0,
        },
      ]
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedQueue))

      await getStore().loadQueue()

      expect(getStore().queue).toHaveLength(1)
      expect(getStore().queue[0].id).toBe('test-1')
    })

    it('handles empty storage gracefully', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)

      await getStore().loadQueue()

      expect(getStore().queue).toHaveLength(0)
    })

    it('handles corrupted storage gracefully', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json{')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await getStore().loadQueue()

      expect(getStore().queue).toHaveLength(0)
      consoleSpy.mockRestore()
    })
  })

  describe('persistQueue', () => {
    it('saves queue to AsyncStorage', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      const calls = (AsyncStorage.setItem as jest.Mock).mock.calls
      const lastCall = calls[calls.length - 1]
      expect(lastCall[0]).toBe('@shelf/offline_queue')
      expect(JSON.parse(lastCall[1])).toHaveLength(1)
    })
  })

  describe('sync state', () => {
    it('setSyncing updates isSyncing', () => {
      getStore().setSyncing(true)
      expect(getStore().isSyncing).toBe(true)

      getStore().setSyncing(false)
      expect(getStore().isSyncing).toBe(false)
    })

    it('addSyncError adds error to list', () => {
      getStore().addSyncError('mutation-1', 'Failed to sync')

      expect(getStore().syncErrors).toHaveLength(1)
      expect(getStore().syncErrors[0]).toEqual({
        mutationId: 'mutation-1',
        error: 'Failed to sync',
      })
    })

    it('addSyncError accumulates errors', () => {
      getStore().addSyncError('mutation-1', 'Error 1')
      getStore().addSyncError('mutation-2', 'Error 2')

      expect(getStore().syncErrors).toHaveLength(2)
    })

    it('clearSyncErrors removes all errors', () => {
      getStore().addSyncError('mutation-1', 'Error 1')
      getStore().addSyncError('mutation-2', 'Error 2')

      getStore().clearSyncErrors()

      expect(getStore().syncErrors).toHaveLength(0)
    })
  })

  describe('computed values', () => {
    it('getPendingCount returns queue length', async () => {
      expect(getStore().getPendingCount()).toBe(0)

      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      expect(getStore().getPendingCount()).toBe(1)
    })

    it('hasFailedMutations returns false when no failed mutations', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })

      expect(getStore().hasFailedMutations()).toBe(false)
    })

    it('hasFailedMutations returns true when mutation exceeds max retries', async () => {
      await getStore().enqueueMutation({
        endpoint: '/entries',
        method: 'POST',
        entityType: 'entry',
      })
      const mutationId = getStore().queue[0].id

      // Retry 3 times (max is 3)
      await getStore().updateMutationRetry(mutationId, 'Error')
      await getStore().updateMutationRetry(mutationId, 'Error')
      await getStore().updateMutationRetry(mutationId, 'Error')

      expect(getStore().hasFailedMutations()).toBe(true)
    })
  })

  describe('throwNetworkError', () => {
    it('throws NetworkError', () => {
      expect(() => throwNetworkError()).toThrow(NetworkError)
    })

    it('throws with correct message', () => {
      expect(() => throwNetworkError()).toThrow('No internet connection')
    })
  })
})
