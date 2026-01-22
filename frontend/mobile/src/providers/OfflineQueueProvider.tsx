import { useEffect } from 'react'
import { useOfflineQueueStore } from '../stores/offlineQueueStore'
import { startAutoSync } from '../utils/syncManager'

interface Props {
  children: React.ReactNode
}

/**
 * Provider that initializes offline queue system
 * - Loads persisted queue on mount
 * - Starts auto-sync monitoring
 */
export function OfflineQueueProvider({ children }: Props) {
  const loadQueue = useOfflineQueueStore((state) => state.loadQueue)

  useEffect(() => {
    // Load persisted queue
    loadQueue().catch((error) => {
      console.error('Failed to load offline queue:', error)
    })

    // Start auto-sync monitoring
    const unsubscribe = startAutoSync()

    return () => {
      unsubscribe()
    }
  }, [loadQueue])

  return <>{children}</>
}
