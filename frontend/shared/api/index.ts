/**
 * API client for The Shelf backend
 * Works with both web and React Native
 */

import type {
  Habit,
  Practice,
  Action,
  Target,
  Entry,
  HabitTransition,
  Preparation,
  Closure,
  Reflection,
  Setting,
  Prompt,
  CautionBehavior,
} from '../types'

// Platform detection for API base URL
function getDefaultApiUrl(): string {
  // Check if we're in React Native
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Android emulator uses 10.0.2.2 to reach host machine
    // iOS simulator and real devices use localhost or actual IP
    return 'http://localhost:3001'
  }
  // Web - check for Vite env variable
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL
  }
  return 'http://localhost:3001'
}

let API_BASE = getDefaultApiUrl()

// Allow setting custom API URL (useful for mobile with device IP)
export function setApiBaseUrl(url: string) {
  API_BASE = url
}

export function getApiBaseUrl(): string {
  return API_BASE
}

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!data.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

// Habits
export async function getHabits(): Promise<Habit[]> {
  const data = await fetchJson<{ habits: Habit[] }>('/habits')
  return data.habits
}

export async function createHabit(habit: Partial<Habit>): Promise<Habit> {
  const data = await fetchJson<{ habit: Habit }>('/habits', {
    method: 'POST',
    body: JSON.stringify(habit),
  })
  return data.habit
}

export async function updateHabit(id: number, updates: Partial<Habit>): Promise<Habit> {
  const data = await fetchJson<{ habit: Habit }>(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.habit
}

export async function deleteHabit(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/habits/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Practices
export async function getPractices(): Promise<Practice[]> {
  const data = await fetchJson<{ practices: Practice[] }>('/habits/practices')
  return data.practices
}

export async function createPractice(practice: Partial<Practice>): Promise<Practice> {
  const data = await fetchJson<{ practice: Practice }>('/habits/practices', {
    method: 'POST',
    body: JSON.stringify(practice),
  })
  return data.practice
}

export async function updatePractice(id: number, updates: Partial<Practice>): Promise<Practice> {
  const data = await fetchJson<{ practice: Practice }>(`/habits/practices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.practice
}

export async function deletePractice(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/habits/practices/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Actions
export async function getActions(): Promise<Action[]> {
  const data = await fetchJson<{ actions: Action[] }>('/habits/actions')
  return data.actions
}

export async function createAction(action: Partial<Action>): Promise<Action> {
  const data = await fetchJson<{ action: Action }>('/habits/actions', {
    method: 'POST',
    body: JSON.stringify(action),
  })
  return data.action
}

export async function updateAction(id: number, updates: Partial<Action>): Promise<Action> {
  const data = await fetchJson<{ action: Action }>(`/habits/actions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.action
}

export async function deleteAction(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/habits/actions/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Targets
export async function getTargets(): Promise<Target[]> {
  const data = await fetchJson<{ targets: Target[] }>('/targets')
  return data.targets
}

export async function createTarget(target: Partial<Target>): Promise<Target> {
  const data = await fetchJson<{ target: Target }>('/targets', {
    method: 'POST',
    body: JSON.stringify(target),
  })
  return data.target
}

export async function updateTarget(id: number, updates: Partial<Target>): Promise<Target> {
  const data = await fetchJson<{ target: Target }>(`/targets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return data.target
}

export async function deleteTarget(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/targets/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

export async function reorderTargets(targetIds: number[]): Promise<boolean> {
  const data = await fetchJson<{ reordered: boolean }>('/targets/reorder', {
    method: 'PUT',
    body: JSON.stringify({ target_ids: targetIds }),
  })
  return data.reordered
}

// Habit Transitions
export async function getHabitTransitions(limit = 15): Promise<HabitTransition[]> {
  const data = await fetchJson<{ transitions: HabitTransition[] }>(`/transitions?limit=${limit}`)
  return data.transitions
}

export async function createHabitTransition(transition: Partial<HabitTransition>): Promise<HabitTransition> {
  const data = await fetchJson<{ transition: HabitTransition }>('/transitions', {
    method: 'POST',
    body: JSON.stringify(transition),
  })
  return data.transition
}

// Entries
export async function getEntries(from: string, to: string): Promise<Entry[]> {
  const data = await fetchJson<{ entries: Entry[] }>(`/entries?from=${from}&to=${to}`)
  return data.entries
}

export async function createEntry(entry: Partial<Entry>): Promise<Entry> {
  const data = await fetchJson<{ entry: Entry }>('/entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return data.entry
}

export async function updateEntry(id: number, updates: Partial<Entry>): Promise<Entry> {
  const data = await fetchJson<{ entry: Entry }>(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.entry
}

export async function deleteEntry(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/entries/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

export async function archiveEntry(id: number): Promise<Entry> {
  const data = await fetchJson<{ entry: Entry }>(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ archived_at: new Date().toISOString() }),
  })
  return data.entry
}

export async function unarchiveEntry(id: number): Promise<Entry> {
  const data = await fetchJson<{ entry: Entry }>(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ archived_at: null }),
  })
  return data.entry
}

// Dashboard
export async function getTodayDashboard(): Promise<any> {
  const data = await fetchJson<any>('/dashboard/today')
  return data
}

// Preparations
export async function getPreparation(periodType: string, periodStart: string): Promise<Preparation | null> {
  const data = await fetchJson<{ preparation: Preparation | null }>(
    `/preparations?period_type=${periodType}&period_start=${periodStart}`
  )
  return data.preparation
}

export async function getPreparationsInRange(
  periodType: string,
  from: string,
  to: string
): Promise<Preparation[]> {
  const data = await fetchJson<{ preparations: Preparation[] }>(
    `/preparations?period_type=${periodType}&from=${from}&to=${to}`
  )
  return data.preparations
}

export async function savePreparation(preparation: Partial<Preparation>): Promise<Preparation> {
  const data = await fetchJson<{ preparation: Preparation }>('/preparations', {
    method: 'PUT',
    body: JSON.stringify(preparation),
  })
  return data.preparation
}

// Closures
export async function getClosure(scope: string, date: string): Promise<Closure | null> {
  const data = await fetchJson<{ closure: Closure | null }>(`/closures?scope=${scope}&date=${date}`)
  return data.closure
}

export async function getClosuresInRange(scope: string, from: string, to: string): Promise<Closure[]> {
  const data = await fetchJson<{ closures: Closure[] }>(`/closures?scope=${scope}&from=${from}&to=${to}`)
  return data.closures
}

export async function saveClosure(closure: Partial<Closure>): Promise<Closure> {
  const data = await fetchJson<{ closure: Closure }>('/closures', {
    method: 'PUT',
    body: JSON.stringify(closure),
  })
  return data.closure
}

// Settings
export async function getSettings(): Promise<Setting[]> {
  const data = await fetchJson<{ settings: Setting[] }>('/settings')
  return data.settings
}

export async function getSetting(key: string): Promise<Setting | null> {
  const data = await fetchJson<{ setting: Setting | null }>(`/settings/${key}`)
  return data.setting
}

export async function setSetting(key: string, value: any): Promise<Setting> {
  const data = await fetchJson<{ setting: Setting }>(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify(value),
  })
  return data.setting
}

// Metrics
export async function getWeeklyMetrics(startDate: string): Promise<any> {
  const data = await fetchJson<{ metrics: any }>(`/metrics/weekly?start=${startDate}`)
  return data.metrics
}

export async function getMetricsForRange(startDate: string, endDate: string): Promise<any> {
  const data = await fetchJson<{ metrics: any }>(`/metrics/range?start=${startDate}&end=${endDate}`)
  return data.metrics
}

// Reflections
export async function getReflections(params: Record<string, string> = {}): Promise<Reflection[]> {
  const query = new URLSearchParams(params).toString()
  const data = await fetchJson<{ reflections: Reflection[] }>(`/reflections${query ? `?${query}` : ''}`)
  return data.reflections
}

export async function createReflection(reflection: Partial<Reflection>): Promise<Reflection> {
  const data = await fetchJson<{ reflection: Reflection }>('/reflections', {
    method: 'POST',
    body: JSON.stringify(reflection),
  })
  return data.reflection
}

export async function updateReflection(id: number, updates: Partial<Reflection>): Promise<Reflection> {
  const data = await fetchJson<{ reflection: Reflection }>(`/reflections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.reflection
}

export async function deleteReflection(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/reflections/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Prompts (Warm-up / Cool-down Templates)
export async function getPrompts(): Promise<Prompt[]> {
  const data = await fetchJson<{ prompts: Prompt[] }>('/habits/prompts')
  return data.prompts
}

export async function getPromptsForHabit(habitId: number): Promise<Prompt[]> {
  const data = await fetchJson<{ prompts: Prompt[] }>(`/habits/${habitId}/prompts`)
  return data.prompts
}

export async function createPrompt(habitId: number, prompt: Partial<Prompt>): Promise<Prompt> {
  const data = await fetchJson<{ prompt: Prompt }>(`/habits/${habitId}/prompts`, {
    method: 'POST',
    body: JSON.stringify(prompt),
  })
  return data.prompt
}

export async function updatePrompt(id: number, updates: Partial<Prompt>): Promise<Prompt> {
  const data = await fetchJson<{ prompt: Prompt }>(`/habits/prompts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.prompt
}

export async function deletePrompt(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/habits/prompts/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Caution Behaviors
export async function getCautionBehaviors(): Promise<CautionBehavior[]> {
  const data = await fetchJson<{ behaviors: CautionBehavior[] }>('/behaviors')
  return data.behaviors
}

export async function createCautionBehavior(behavior: Partial<CautionBehavior>): Promise<CautionBehavior> {
  const data = await fetchJson<{ behavior: CautionBehavior }>('/behaviors', {
    method: 'POST',
    body: JSON.stringify(behavior),
  })
  return data.behavior
}

export async function updateCautionBehavior(
  id: number,
  updates: Partial<CautionBehavior>
): Promise<CautionBehavior> {
  const data = await fetchJson<{ behavior: CautionBehavior }>(`/behaviors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.behavior
}

export async function deleteCautionBehavior(id: number): Promise<boolean> {
  const data = await fetchJson<{ deleted: boolean }>(`/behaviors/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Data Import/Export
export async function exportData(): Promise<any> {
  const data = await fetchJson<{ data: any }>('/data/export')
  return data.data
}

export async function importData(importData: any): Promise<any> {
  const result = await fetchJson<{ results: any }>('/data/import', {
    method: 'POST',
    body: JSON.stringify(importData),
  })
  return result.results
}

// Load all initial data for the app
export async function loadInitialData() {
  const [habits, practices, actions, targets, prompts] = await Promise.all([
    getHabits(),
    getPractices(),
    getActions(),
    getTargets().catch(() => []),
    getPrompts().catch(() => []),
  ])

  return { habits, practices, actions, targets, prompts }
}
