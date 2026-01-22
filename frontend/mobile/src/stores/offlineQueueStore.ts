import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NetworkError, QueueError } from '../utils/errors'

export interface QueuedMutation {
  id: string
  timestamp: number
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  entityType: 'entry' | 'habit' | 'practice' | 'action' | 'target' | 'preparation' | 'closure' | 'reflection' | 'other'
  entityId?: number
  retryCount: number
  lastError?: string
}

interface OfflineQueueState {
  queue: QueuedMutation[]
  isSyncing: boolean
  syncErrors: Array<{ mutationId: string; error: string }>

  // Actions
  enqueueMutation: (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>) => Promise<void>
  dequeueMutation: (id: string) => Promise<void>
  updateMutationRetry: (id: string, error: string) => Promise<void>
  clearQueue: () => Promise<void>
  loadQueue: () => Promise<void>
  persistQueue: () => Promise<void>

  // Sync state
  setSyncing: (syncing: boolean) => void
  addSyncError: (mutationId: string, error: string) => void
  clearSyncErrors: () => void

  // Computed
  getPendingCount: () => number
  hasFailedMutations: () => boolean
}

const QUEUE_STORAGE_KEY = '@shelf/offline_queue'
const MAX_RETRY_COUNT = 3

export const useOfflineQueueStore = create<OfflineQueueState>((set, get) => ({
  queue: [],
  isSyncing: false,
  syncErrors: [],

  // Enqueue a new mutation
  enqueueMutation: async (mutation) => {
    const queuedMutation: QueuedMutation = {
      ...mutation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    }

    set((state) => ({
      queue: [...state.queue, queuedMutation],
    }))

    await get().persistQueue()
  },

  // Remove a mutation from the queue (after successful sync)
  dequeueMutation: async (id) => {
    set((state) => ({
      queue: state.queue.filter((m) => m.id !== id),
      syncErrors: state.syncErrors.filter((e) => e.mutationId !== id),
    }))

    await get().persistQueue()
  },

  // Update retry count and error for a failed sync attempt
  updateMutationRetry: async (id, error) => {
    set((state) => ({
      queue: state.queue.map((m) =>
        m.id === id
          ? { ...m, retryCount: m.retryCount + 1, lastError: error }
          : m
      ),
    }))

    await get().persistQueue()
  },

  // Clear entire queue
  clearQueue: async () => {
    set({ queue: [], syncErrors: [] })
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY)
  },

  // Load queue from AsyncStorage
  loadQueue: async () => {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY)
      if (stored) {
        const queue = JSON.parse(stored) as QueuedMutation[]
        set({ queue })
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  },

  // Persist queue to AsyncStorage
  persistQueue: async () => {
    try {
      const { queue } = get()
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to persist offline queue:', error)
      throw new QueueError('Failed to save offline changes')
    }
  },

  // Sync state
  setSyncing: (syncing) => set({ isSyncing: syncing }),

  addSyncError: (mutationId, error) =>
    set((state) => ({
      syncErrors: [...state.syncErrors, { mutationId, error }],
    })),

  clearSyncErrors: () => set({ syncErrors: [] }),

  // Computed
  getPendingCount: () => get().queue.length,

  hasFailedMutations: () => {
    const { queue } = get()
    return queue.some((m) => m.retryCount >= MAX_RETRY_COUNT)
  },
}))

/**
 * Throw NetworkError to trigger offline queue
 */
export function throwNetworkError(): never {
  throw new NetworkError('No internet connection')
}
