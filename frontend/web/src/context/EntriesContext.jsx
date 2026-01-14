import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { mockEntries as initialEntries } from '@/data/mockData'
import { getEntries, createEntry as apiCreateEntry } from '@/lib/api'

const EntriesContext = createContext(null)

// Helper to format date as YYYY-MM-DD
function formatDate(date) {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

export function EntriesProvider({ children }) {
  const [entries, setEntries] = useState(initialEntries)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState(() => {
    // Default to last 30 days
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 30)
    return { from: formatDate(from), to: formatDate(to) }
  })

  // Fetch entries from API
  const fetchEntries = useCallback(async (from, to) => {
    try {
      setIsLoading(true)
      const data = await getEntries(from, to)
      setEntries(data)
      setDateRange({ from, to })
    } catch (err) {
      console.error('Failed to load entries from API, using mock data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load entries on mount
  useEffect(() => {
    fetchEntries(dateRange.from, dateRange.to)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Create a new entry
  const createEntry = async (entry) => {
    try {
      const newEntry = await apiCreateEntry(entry)
      setEntries(prev => [newEntry, ...prev])
      return newEntry
    } catch (err) {
      console.error('Failed to create entry:', err)
      throw err
    }
  }

  // Get entries for a specific date
  const getEntriesForDate = useCallback((dateStr) => {
    return entries.filter(entry => {
      const entryDate = formatDate(entry.occurred_at)
      return entryDate === dateStr
    })
  }, [entries])

  // Get entries within a date range
  const getEntriesInRange = useCallback((from, to) => {
    return entries.filter(entry => {
      const entryDate = formatDate(entry.occurred_at)
      return entryDate >= from && entryDate <= to
    })
  }, [entries])

  // Update local entry (optimistic update)
  const updateEntry = (entryId, updates) => {
    setEntries(prev =>
      prev.map(e => e.id === entryId ? { ...e, ...updates } : e)
    )
  }

  // Delete local entry (optimistic update)
  const deleteEntry = (entryId) => {
    setEntries(prev => prev.filter(e => e.id !== entryId))
  }

  // Refresh entries for current date range
  const refresh = () => {
    fetchEntries(dateRange.from, dateRange.to)
  }

  const value = {
    entries,
    setEntries,  // Direct setter for local updates
    isLoading,
    dateRange,
    fetchEntries,
    createEntry,
    getEntriesForDate,
    getEntriesInRange,
    updateEntry,
    deleteEntry,
    refresh,
  }

  return (
    <EntriesContext.Provider value={value}>
      {children}
    </EntriesContext.Provider>
  )
}

export function useEntries() {
  const context = useContext(EntriesContext)
  if (!context) {
    throw new Error('useEntries must be used within an EntriesProvider')
  }
  return context
}
