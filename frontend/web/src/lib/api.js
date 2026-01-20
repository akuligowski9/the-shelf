/**
 * API client for The Shelf backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    credentials: 'include', // Send cookies for auth
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
export async function getHabits() {
  const data = await fetchJson('/habits')
  return data.habits
}

export async function createHabit(habit) {
  const data = await fetchJson('/habits', {
    method: 'POST',
    body: JSON.stringify(habit),
  })
  return data.habit
}

export async function updateHabit(id, updates) {
  const data = await fetchJson(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.habit
}

export async function deleteHabit(id) {
  const data = await fetchJson(`/habits/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Practices
export async function getPractices() {
  const data = await fetchJson('/habits/practices')
  return data.practices
}

export async function createPractice(practice) {
  const data = await fetchJson('/habits/practices', {
    method: 'POST',
    body: JSON.stringify(practice),
  })
  return data.practice
}

export async function updatePractice(id, updates) {
  const data = await fetchJson(`/habits/practices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.practice
}

export async function deletePractice(id) {
  const data = await fetchJson(`/habits/practices/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Actions
export async function getActions() {
  const data = await fetchJson('/habits/actions')
  return data.actions
}

export async function createAction(action) {
  const data = await fetchJson('/habits/actions', {
    method: 'POST',
    body: JSON.stringify(action),
  })
  return data.action
}

export async function updateAction(id, updates) {
  const data = await fetchJson(`/habits/actions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.action
}

export async function deleteAction(id) {
  const data = await fetchJson(`/habits/actions/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Targets
export async function getTargets() {
  const data = await fetchJson('/targets')
  return data.targets
}

export async function createTarget(target) {
  const data = await fetchJson('/targets', {
    method: 'POST',
    body: JSON.stringify(target),
  })
  return data.target
}

export async function updateTarget(id, updates) {
  const data = await fetchJson(`/targets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
  return data.target
}

export async function deleteTarget(id) {
  const data = await fetchJson(`/targets/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

export async function reorderTargets(targetIds) {
  const data = await fetchJson('/targets/reorder', {
    method: 'PUT',
    body: JSON.stringify({ target_ids: targetIds }),
  })
  return data.reordered
}

// Habit Transitions
export async function getHabitTransitions(limit = 15) {
  const data = await fetchJson(`/transitions?limit=${limit}`)
  return data.transitions
}

export async function createHabitTransition(transition) {
  const data = await fetchJson('/transitions', {
    method: 'POST',
    body: JSON.stringify(transition),
  })
  return data.transition
}

// Entries
export async function getEntries(from, to) {
  const data = await fetchJson(`/entries?from=${from}&to=${to}`)
  return data.entries
}

export async function createEntry(entry) {
  const data = await fetchJson('/entries', {
    method: 'POST',
    body: JSON.stringify(entry),
  })
  return data.entry
}

export async function updateEntry(id, updates) {
  const data = await fetchJson(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.entry
}

export async function deleteEntry(id) {
  const data = await fetchJson(`/entries/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Dashboard
export async function getTodayDashboard() {
  const data = await fetchJson('/dashboard/today')
  return data
}

// Preparations
export async function getPreparation(periodType, periodStart) {
  const data = await fetchJson(`/preparations?period_type=${periodType}&period_start=${periodStart}`)
  return data.preparation
}

export async function getPreparationsInRange(periodType, from, to) {
  const data = await fetchJson(`/preparations?period_type=${periodType}&from=${from}&to=${to}`)
  return data.preparations
}

export async function savePreparation(preparation) {
  const data = await fetchJson('/preparations', {
    method: 'PUT',
    body: JSON.stringify(preparation),
  })
  return data.preparation
}

// Closures
export async function getClosure(scope, date) {
  const data = await fetchJson(`/closures?scope=${scope}&date=${date}`)
  return data.closure
}

export async function getClosuresInRange(scope, from, to) {
  const data = await fetchJson(`/closures?scope=${scope}&from=${from}&to=${to}`)
  return data.closures
}

export async function saveClosure(closure) {
  const data = await fetchJson('/closures', {
    method: 'PUT',
    body: JSON.stringify(closure),
  })
  return data.closure
}

// Settings
export async function getSettings() {
  const data = await fetchJson('/settings')
  return data.settings
}

export async function getSetting(key) {
  const data = await fetchJson(`/settings/${key}`)
  return data.setting
}

export async function setSetting(key, value) {
  const data = await fetchJson(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify(value),
  })
  return data.setting
}

// Metrics
export async function getWeeklyMetrics(startDate) {
  const data = await fetchJson(`/metrics/weekly?start=${startDate}`)
  return data.metrics
}

export async function getMetricsForRange(startDate, endDate) {
  const data = await fetchJson(`/metrics/range?start=${startDate}&end=${endDate}`)
  return data.metrics
}

// Reflections
export async function getReflections(params = {}) {
  const query = new URLSearchParams(params).toString()
  const data = await fetchJson(`/reflections${query ? `?${query}` : ''}`)
  return data.reflections
}

export async function createReflection(reflection) {
  const data = await fetchJson('/reflections', {
    method: 'POST',
    body: JSON.stringify(reflection),
  })
  return data.reflection
}

export async function updateReflection(id, updates) {
  const data = await fetchJson(`/reflections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.reflection
}

export async function deleteReflection(id) {
  const data = await fetchJson(`/reflections/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Prompts (Warm-up / Cool-down Templates)
export async function getPrompts() {
  const data = await fetchJson('/habits/prompts')
  return data.prompts
}

export async function getPromptsForHabit(habitId) {
  const data = await fetchJson(`/habits/${habitId}/prompts`)
  return data.prompts
}

export async function createPrompt(habitId, prompt) {
  const data = await fetchJson(`/habits/${habitId}/prompts`, {
    method: 'POST',
    body: JSON.stringify(prompt),
  })
  return data.prompt
}

export async function updatePrompt(id, updates) {
  const data = await fetchJson(`/habits/prompts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  })
  return data.prompt
}

export async function deletePrompt(id) {
  const data = await fetchJson(`/habits/prompts/${id}`, {
    method: 'DELETE',
  })
  return data.deleted
}

// Data Import/Export
export async function exportData() {
  const data = await fetchJson('/data/export')
  return data.data
}

export async function importData(data) {
  const result = await fetchJson('/data/import', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return result.results
}

export async function getPendingImports() {
  const data = await fetchJson('/data/pending')
  return data.files
}

export async function importFile(filename) {
  const result = await fetchJson('/data/import-file', {
    method: 'POST',
    body: JSON.stringify({ filename }),
  })
  return result
}

export async function previewFile(filename) {
  const result = await fetchJson('/data/preview-file', {
    method: 'POST',
    body: JSON.stringify({ filename }),
  })
  return result.preview
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

// Generic API helper for custom endpoints
const api = {
  async get(endpoint) {
    try {
      const data = await fetchJson(endpoint)
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  },
  async post(endpoint, body) {
    try {
      const data = await fetchJson(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      })
      return { ok: true, data }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }
}

export default api
