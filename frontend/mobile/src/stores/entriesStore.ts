import { create } from 'zustand'
import type { Entry, Preparation, Closure } from '@shared/types'
import * as api from '../api/offlineApi'
import { getUserFriendlyErrorMessage, NetworkError } from '../utils/errors'

interface EntriesState {
  // Data
  entries: Entry[]
  preparations: Preparation[]
  closures: Closure[]

  // Loading state
  isLoading: boolean
  dateRange: { from: string; to: string } | null

  // Error state
  lastError: string | null
  clearError: () => void

  // Actions
  loadEntriesForRange: (from: string, to: string) => Promise<void>
  loadPreparations: (periodType: string, from: string, to: string) => Promise<void>
  loadClosures: (scope: string, from: string, to: string) => Promise<void>

  // Entry actions
  createEntry: (entry: Partial<Entry>) => Promise<{ success: boolean; entry?: Entry; error?: string }>
  updateEntry: (id: number, updates: Partial<Entry>) => Promise<{ success: boolean; error?: string }>
  deleteEntry: (id: number) => Promise<{ success: boolean; error?: string }>

  // Preparation actions
  savePreparation: (preparation: Partial<Preparation>) => Promise<{ success: boolean; error?: string }>

  // Closure actions
  saveClosure: (closure: Partial<Closure>) => Promise<{ success: boolean; error?: string }>

  // Computed
  getEntriesForDate: (date: string) => Entry[]
  getDayStats: (date: string) => {
    totalMinutes: number
    habitMinutes: number
    lifeMinutes: number
    cautionCount: number
    entriesCount: number
  }
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
  // Initial state
  entries: [],
  preparations: [],
  closures: [],
  isLoading: false,
  dateRange: null,
  lastError: null,

  // Clear error
  clearError: () => set({ lastError: null }),

  // Load entries for date range
  loadEntriesForRange: async (from, to) => {
    set({ isLoading: true })
    try {
      const entries = await api.getEntries(from, to)
      set({ entries, dateRange: { from, to }, isLoading: false })
    } catch (error) {
      console.error('Failed to load entries:', error)
      set({ isLoading: false })
    }
  },

  // Load preparations
  loadPreparations: async (periodType, from, to) => {
    try {
      const preparations = await api.getPreparationsInRange(periodType, from, to)
      set({ preparations })
    } catch (error) {
      console.error('Failed to load preparations:', error)
    }
  },

  // Load closures
  loadClosures: async (scope, from, to) => {
    try {
      const closures = await api.getClosuresInRange(scope, from, to)
      set({ closures })
    } catch (error) {
      console.error('Failed to load closures:', error)
    }
  },

  // Entry actions
  createEntry: async (entry) => {
    try {
      const newEntry = await api.createEntry(entry)
      set((state) => ({ entries: [...state.entries, newEntry], lastError: null }))
      return { success: true, entry: newEntry }
    } catch (error) {
      console.error('Failed to create entry:', error)
      const errorMessage = getUserFriendlyErrorMessage(error)

      // If it's a network error, optimistically add entry (will sync later)
      if (error instanceof NetworkError && entry.date) {
        const optimisticEntry = {
          ...entry,
          id: Date.now(), // Temporary ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Entry
        set((state) => ({ entries: [...state.entries, optimisticEntry], lastError: errorMessage }))
        return { success: true, entry: optimisticEntry }
      }

      set({ lastError: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  updateEntry: async (id, updates) => {
    // Optimistic update
    const previousEntries = get().entries
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }))

    try {
      await api.updateEntry(id, updates)
      set({ lastError: null })
      return { success: true }
    } catch (error) {
      console.error('Failed to update entry:', error)
      const errorMessage = getUserFriendlyErrorMessage(error)

      // If network error, keep optimistic update (will sync later)
      if (error instanceof NetworkError) {
        set({ lastError: errorMessage })
        return { success: true }
      }

      // Revert on other errors
      set({ entries: previousEntries, lastError: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  deleteEntry: async (id) => {
    // Optimistic delete
    const previousEntries = get().entries
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }))

    try {
      await api.deleteEntry(id)
      set({ lastError: null })
      return { success: true }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      const errorMessage = getUserFriendlyErrorMessage(error)

      // If network error, keep optimistic delete (will sync later)
      if (error instanceof NetworkError) {
        set({ lastError: errorMessage })
        return { success: true }
      }

      // Revert on other errors
      set({ entries: previousEntries, lastError: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Preparation actions
  savePreparation: async (preparation) => {
    try {
      const saved = await api.savePreparation(preparation)
      set((state) => ({
        preparations: state.preparations.some(
          (p) =>
            p.period_type === saved.period_type &&
            p.period_start === saved.period_start
        )
          ? state.preparations.map((p) =>
              p.period_type === saved.period_type &&
              p.period_start === saved.period_start
                ? saved
                : p
            )
          : [...state.preparations, saved],
        lastError: null,
      }))
      return { success: true }
    } catch (error) {
      console.error('Failed to save preparation:', error)
      const errorMessage = getUserFriendlyErrorMessage(error)
      set({ lastError: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Closure actions
  saveClosure: async (closure) => {
    try {
      const saved = await api.saveClosure(closure)
      set((state) => ({
        closures: state.closures.some(
          (c) => c.scope === saved.scope && c.date === saved.date
        )
          ? state.closures.map((c) =>
              c.scope === saved.scope && c.date === saved.date ? saved : c
            )
          : [...state.closures, saved],
        lastError: null,
      }))
      return { success: true }
    } catch (error) {
      console.error('Failed to save closure:', error)
      const errorMessage = getUserFriendlyErrorMessage(error)
      set({ lastError: errorMessage })
      return { success: false, error: errorMessage }
    }
  },

  // Computed
  getEntriesForDate: (date) => {
    return get().entries.filter((e) => e.date === date)
  },

  getDayStats: (date) => {
    const entries = get().getEntriesForDate(date)
    return {
      totalMinutes: entries.reduce(
        (sum, e) => sum + (e.duration_minutes || 0),
        0
      ),
      habitMinutes: entries
        .filter((e) => e.type === 'habit')
        .reduce((sum, e) => sum + (e.duration_minutes || 0), 0),
      lifeMinutes: entries
        .filter((e) => e.type === 'life')
        .reduce((sum, e) => sum + (e.duration_minutes || 0), 0),
      cautionCount: entries.filter((e) => e.type === 'caution').length,
      entriesCount: entries.length,
    }
  },
}))
