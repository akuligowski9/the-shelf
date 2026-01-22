import NetInfo from '@react-native-community/netinfo'
import { useOfflineQueueStore } from '../stores/offlineQueueStore'
import { getApiBaseUrl } from '@shared/api'
import { NetworkError, ServerError, getRetryDelay, isRetryableError } from './errors'

const MAX_RETRY_COUNT = 3

/**
 * Process the offline queue and sync mutations with the server
 */
export async function syncOfflineQueue(): Promise<void> {
  const queueStore = useOfflineQueueStore.getState()

  // Check if already syncing
  if (queueStore.isSyncing) {
    return
  }

  // Check network connectivity
  const netInfo = await NetInfo.fetch()
  if (!netInfo.isConnected || netInfo.isInternetReachable === false) {
    console.log('Cannot sync: no network connection')
    return
  }

  const { queue } = queueStore
  if (queue.length === 0) {
    return
  }

  console.log(`Starting sync of ${queue.length} queued mutations`)
  queueStore.setSyncing(true)
  queueStore.clearSyncErrors()

  // Process mutations in order
  for (const mutation of queue) {
    try {
      // Skip if already retried too many times
      if (mutation.retryCount >= MAX_RETRY_COUNT) {
        console.warn(
          `Skipping mutation ${mutation.id} - exceeded max retry count`,
          mutation
        )
        queueStore.addSyncError(
          mutation.id,
          `Failed after ${MAX_RETRY_COUNT} attempts. Please try manually.`
        )
        continue
      }

      // Execute the mutation
      await executeMutation(mutation)

      // Success - remove from queue
      await queueStore.dequeueMutation(mutation.id)
      console.log(`Successfully synced mutation ${mutation.id}`)
    } catch (error) {
      console.error(`Failed to sync mutation ${mutation.id}:`, error)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Update retry count
      await queueStore.updateMutationRetry(mutation.id, errorMessage)

      // If error is retryable, continue to next mutation
      // If not retryable, mark as error and continue
      if (!isRetryableError(error)) {
        queueStore.addSyncError(mutation.id, errorMessage)
      }
    }
  }

  queueStore.setSyncing(false)
  console.log('Sync complete')
}

/**
 * Execute a single queued mutation
 */
async function executeMutation(mutation: any): Promise<void> {
  const url = `${getApiBaseUrl()}${mutation.endpoint}`

  const response = await fetch(url, {
    method: mutation.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: mutation.body ? JSON.stringify(mutation.body) : undefined,
  })

  const data = await response.json()

  // Handle API errors
  if (!data.ok) {
    throw new ServerError(data.error || 'API request failed', response.status)
  }

  return data
}

/**
 * Start monitoring network state and auto-sync when online
 */
export function startAutoSync(): () => void {
  let previousState: boolean | null = null

  const unsubscribe = NetInfo.addEventListener((state) => {
    const isConnected = state.isConnected ?? false

    // Trigger sync when transitioning from offline to online
    if (previousState === false && isConnected) {
      console.log('Network restored - triggering sync')
      syncOfflineQueue().catch((error) => {
        console.error('Auto-sync failed:', error)
      })
    }

    previousState = isConnected
  })

  // Trigger initial sync if online
  NetInfo.fetch().then((state) => {
    if (state.isConnected) {
      syncOfflineQueue().catch((error) => {
        console.error('Initial sync failed:', error)
      })
    }
  })

  return unsubscribe
}
