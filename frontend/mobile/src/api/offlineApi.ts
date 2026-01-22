/**
 * Mobile API wrapper that adds offline queue support
 * Wraps the shared API functions and intercepts mutations when offline
 */

import * as sharedApi from '@shared/api'
import NetInfo from '@react-native-community/netinfo'
import { useOfflineQueueStore, QueuedMutation } from '../stores/offlineQueueStore'
import { NetworkError, getUserFriendlyErrorMessage } from '../utils/errors'

/**
 * Check if device is online
 */
async function isOnline(): Promise<boolean> {
  const netInfo = await NetInfo.fetch()
  return netInfo.isConnected ?? false
}

/**
 * Wrapper for mutation operations that supports offline queueing
 */
async function withOfflineQueue<T>(
  operation: () => Promise<T>,
  queueData: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>
): Promise<T> {
  const online = await isOnline()

  if (!online) {
    // Queue the mutation for later sync
    const queueStore = useOfflineQueueStore.getState()
    await queueStore.enqueueMutation(queueData)
    throw new NetworkError('No internet connection. Changes will sync when online.')
  }

  try {
    return await operation()
  } catch (error) {
    // If fetch fails with network error, queue the mutation
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      const queueStore = useOfflineQueueStore.getState()
      await queueStore.enqueueMutation(queueData)
      throw new NetworkError('No internet connection. Changes will sync when online.')
    }
    throw error
  }
}

// Re-export all read-only operations directly from shared API
export {
  getHabits,
  getPractices,
  getActions,
  getTargets,
  getHabitTransitions,
  getEntries,
  getTodayDashboard,
  getPreparation,
  getPreparationsInRange,
  getClosure,
  getClosuresInRange,
  getSettings,
  getSetting,
  getWeeklyMetrics,
  getMetricsForRange,
  getReflections,
  getPrompts,
  getPromptsForHabit,
  getCautionBehaviors,
  exportData,
  loadInitialData,
  setApiBaseUrl,
  getApiBaseUrl,
} from '@shared/api'

// Wrap mutation operations with offline queue support

// Habits
export async function createHabit(habit: any) {
  return withOfflineQueue(
    () => sharedApi.createHabit(habit),
    {
      endpoint: '/habits',
      method: 'POST',
      body: habit,
      entityType: 'habit',
    }
  )
}

export async function updateHabit(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updateHabit(id, updates),
    {
      endpoint: `/habits/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'habit',
      entityId: id,
    }
  )
}

export async function deleteHabit(id: number) {
  return withOfflineQueue(
    () => sharedApi.deleteHabit(id),
    {
      endpoint: `/habits/${id}`,
      method: 'DELETE',
      entityType: 'habit',
      entityId: id,
    }
  )
}

// Practices
export async function createPractice(practice: any) {
  return withOfflineQueue(
    () => sharedApi.createPractice(practice),
    {
      endpoint: '/habits/practices',
      method: 'POST',
      body: practice,
      entityType: 'practice',
    }
  )
}

export async function updatePractice(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updatePractice(id, updates),
    {
      endpoint: `/habits/practices/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'practice',
      entityId: id,
    }
  )
}

export async function deletePractice(id: number) {
  return withOfflineQueue(
    () => sharedApi.deletePractice(id),
    {
      endpoint: `/habits/practices/${id}`,
      method: 'DELETE',
      entityType: 'practice',
      entityId: id,
    }
  )
}

// Actions
export async function createAction(action: any) {
  return withOfflineQueue(
    () => sharedApi.createAction(action),
    {
      endpoint: '/habits/actions',
      method: 'POST',
      body: action,
      entityType: 'action',
    }
  )
}

export async function updateAction(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updateAction(id, updates),
    {
      endpoint: `/habits/actions/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'action',
      entityId: id,
    }
  )
}

export async function deleteAction(id: number) {
  return withOfflineQueue(
    () => sharedApi.deleteAction(id),
    {
      endpoint: `/habits/actions/${id}`,
      method: 'DELETE',
      entityType: 'action',
      entityId: id,
    }
  )
}

// Targets
export async function createTarget(target: any) {
  return withOfflineQueue(
    () => sharedApi.createTarget(target),
    {
      endpoint: '/targets',
      method: 'POST',
      body: target,
      entityType: 'target',
    }
  )
}

export async function updateTarget(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updateTarget(id, updates),
    {
      endpoint: `/targets/${id}`,
      method: 'PATCH',
      body: updates,
      entityType: 'target',
      entityId: id,
    }
  )
}

export async function deleteTarget(id: number) {
  return withOfflineQueue(
    () => sharedApi.deleteTarget(id),
    {
      endpoint: `/targets/${id}`,
      method: 'DELETE',
      entityType: 'target',
      entityId: id,
    }
  )
}

export async function reorderTargets(targetIds: number[]) {
  return withOfflineQueue(
    () => sharedApi.reorderTargets(targetIds),
    {
      endpoint: '/targets/reorder',
      method: 'PUT',
      body: { target_ids: targetIds },
      entityType: 'target',
    }
  )
}

// Entries
export async function createEntry(entry: any) {
  return withOfflineQueue(
    () => sharedApi.createEntry(entry),
    {
      endpoint: '/entries',
      method: 'POST',
      body: entry,
      entityType: 'entry',
    }
  )
}

export async function updateEntry(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updateEntry(id, updates),
    {
      endpoint: `/entries/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'entry',
      entityId: id,
    }
  )
}

export async function deleteEntry(id: number) {
  return withOfflineQueue(
    () => sharedApi.deleteEntry(id),
    {
      endpoint: `/entries/${id}`,
      method: 'DELETE',
      entityType: 'entry',
      entityId: id,
    }
  )
}

export async function archiveEntry(id: number) {
  return withOfflineQueue(
    () => sharedApi.archiveEntry(id),
    {
      endpoint: `/entries/${id}`,
      method: 'PUT',
      body: { archived_at: new Date().toISOString() },
      entityType: 'entry',
      entityId: id,
    }
  )
}

export async function unarchiveEntry(id: number) {
  return withOfflineQueue(
    () => sharedApi.unarchiveEntry(id),
    {
      endpoint: `/entries/${id}`,
      method: 'PUT',
      body: { archived_at: null },
      entityType: 'entry',
      entityId: id,
    }
  )
}

// Preparations
export async function savePreparation(preparation: any) {
  return withOfflineQueue(
    () => sharedApi.savePreparation(preparation),
    {
      endpoint: '/preparations',
      method: 'PUT',
      body: preparation,
      entityType: 'preparation',
    }
  )
}

// Closures
export async function saveClosure(closure: any) {
  return withOfflineQueue(
    () => sharedApi.saveClosure(closure),
    {
      endpoint: '/closures',
      method: 'PUT',
      body: closure,
      entityType: 'closure',
    }
  )
}

// Reflections
export async function createReflection(reflection: any) {
  return withOfflineQueue(
    () => sharedApi.createReflection(reflection),
    {
      endpoint: '/reflections',
      method: 'POST',
      body: reflection,
      entityType: 'reflection',
    }
  )
}

export async function updateReflection(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updateReflection(id, updates),
    {
      endpoint: `/reflections/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'reflection',
      entityId: id,
    }
  )
}

export async function deleteReflection(id: number) {
  return withOfflineQueue(
    () => sharedApi.deleteReflection(id),
    {
      endpoint: `/reflections/${id}`,
      method: 'DELETE',
      entityType: 'reflection',
      entityId: id,
    }
  )
}

// Settings
export async function setSetting(key: string, value: any) {
  return withOfflineQueue(
    () => sharedApi.setSetting(key, value),
    {
      endpoint: `/settings/${key}`,
      method: 'PUT',
      body: value,
      entityType: 'other',
    }
  )
}

// Prompts
export async function createPrompt(habitId: number, prompt: any) {
  return withOfflineQueue(
    () => sharedApi.createPrompt(habitId, prompt),
    {
      endpoint: `/habits/${habitId}/prompts`,
      method: 'POST',
      body: prompt,
      entityType: 'other',
    }
  )
}

export async function updatePrompt(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updatePrompt(id, updates),
    {
      endpoint: `/habits/prompts/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'other',
    }
  )
}

export async function deletePrompt(id: number) {
  return withOfflineQueue(
    () => sharedApi.deletePrompt(id),
    {
      endpoint: `/habits/prompts/${id}`,
      method: 'DELETE',
      entityType: 'other',
    }
  )
}

// Habit Transitions
export async function createHabitTransition(transition: any) {
  return withOfflineQueue(
    () => sharedApi.createHabitTransition(transition),
    {
      endpoint: '/transitions',
      method: 'POST',
      body: transition,
      entityType: 'other',
    }
  )
}

// Caution Behaviors
export async function createCautionBehavior(behavior: any) {
  return withOfflineQueue(
    () => sharedApi.createCautionBehavior(behavior),
    {
      endpoint: '/behaviors',
      method: 'POST',
      body: behavior,
      entityType: 'other',
    }
  )
}

export async function updateCautionBehavior(id: number, updates: any) {
  return withOfflineQueue(
    () => sharedApi.updateCautionBehavior(id, updates),
    {
      endpoint: `/behaviors/${id}`,
      method: 'PUT',
      body: updates,
      entityType: 'other',
    }
  )
}

export async function deleteCautionBehavior(id: number) {
  return withOfflineQueue(
    () => sharedApi.deleteCautionBehavior(id),
    {
      endpoint: `/behaviors/${id}`,
      method: 'DELETE',
      entityType: 'other',
    }
  )
}

// Import
export async function importData(importData: any) {
  return withOfflineQueue(
    () => sharedApi.importData(importData),
    {
      endpoint: '/data/import',
      method: 'POST',
      body: importData,
      entityType: 'other',
    }
  )
}
