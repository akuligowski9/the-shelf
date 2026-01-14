/**
 * API client for The Shelf backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function fetchJson(endpoint, options = {}) {
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

// Practices
export async function getPractices() {
  const data = await fetchJson('/habits/practices')
  return data.practices
}

// Actions
export async function getActions() {
  const data = await fetchJson('/habits/actions')
  return data.actions
}

// Targets
export async function getTargets() {
  const data = await fetchJson('/targets')
  return data.targets
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

export async function saveClosure(closure) {
  const data = await fetchJson('/closures', {
    method: 'PUT',
    body: JSON.stringify(closure),
  })
  return data.closure
}

// Load all initial data for the app
export async function loadInitialData() {
  const [habits, practices, actions, targets] = await Promise.all([
    getHabits(),
    getPractices(),
    getActions(),
    getTargets().catch(() => []), // targets endpoint might not exist yet
  ])

  return { habits, practices, actions, targets }
}
