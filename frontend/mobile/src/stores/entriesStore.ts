import { create } from 'zustand'
import type { Entry, Preparation, Closure } from '@shared/types'
import * as api from '@shared/api'

interface EntriesState {
  // Data
  entries: Entry[]
  preparations: Preparation[]
  closures: Closure[]

  // Loading state
  isLoading: boolean
  dateRange: { from: string; to: string } | null

  // Actions
  loadEntriesForRange: (from: string, to: string) => Promise<void>
  loadPreparations: (periodType: string, from: string, to: string) => Promise<void>
  loadClosures: (scope: string, from: string, to: string) => Promise<void>

  // Entry actions
  createEntry: (entry: Partial<Entry>) => Promise<Entry | null>
  updateEntry: (id: number, updates: Partial<Entry>) => Promise<void>
  deleteEntry: (id: number) => Promise<void>

  // Preparation actions
  savePreparation: (preparation: Partial<Preparation>) => Promise<void>

  // Closure actions
  saveClosure: (closure: Partial<Closure>) => Promise<void>

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
      set((state) => ({ entries: [...state.entries, newEntry] }))
      return newEntry
    } catch (error) {
      console.error('Failed to create entry:', error)
      return null
    }
  },

  updateEntry: async (id, updates) => {
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }))
    try {
      await api.updateEntry(id, updates)
    } catch (error) {
      console.error('Failed to update entry:', error)
    }
  },

  deleteEntry: async (id) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }))
    try {
      await api.deleteEntry(id)
    } catch (error) {
      console.error('Failed to delete entry:', error)
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
      }))
    } catch (error) {
      console.error('Failed to save preparation:', error)
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
      }))
    } catch (error) {
      console.error('Failed to save closure:', error)
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
