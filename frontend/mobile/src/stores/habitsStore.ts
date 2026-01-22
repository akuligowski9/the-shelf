import { create } from 'zustand'
import type { Habit, Practice, Action, Target, Prompt, HabitTransition } from '@shared/types'
import * as api from '../api/offlineApi'
import { getUserFriendlyErrorMessage, NetworkError } from '../utils/errors'

interface TransitionChange {
  habitId: number
  habitName: string
  from: 'active' | 'inactive'
  to: 'active' | 'inactive'
}

interface CascadeChanges {
  targets: Array<{ id: number; originalStatus: string }>
  practices: number[]
}

interface HabitsState {
  // Data
  habits: Habit[]
  practices: Practice[]
  actions: Action[]
  targets: Target[]
  prompts: Prompt[]
  habitTransitions: HabitTransition[]

  // Loading state
  isLoading: boolean

  // Error state
  lastError: string | null
  clearError: () => void

  // Transition window state
  inTransition: boolean
  transitionStartedAt: string | null
  transitionChanges: TransitionChange[]
  cascadeChanges: CascadeChanges

  // Actions
  loadInitialData: () => Promise<void>

  // Habit actions
  updateHabitColor: (habitId: number, colorKey: string) => Promise<void>
  toggleHabitActive: (habitId: number) => Promise<void>
  addHabit: (name: string, targetMinutes?: number, color?: string) => Promise<number | null>
  updateHabit: (habitId: number, updates: Partial<Habit>) => Promise<void>
  updateHabitName: (habitId: number, name: string) => Promise<void>
  updateHabitTargetMinutes: (habitId: number, targetMinutes: number) => Promise<void>
  deleteHabit: (habitId: number) => Promise<void>

  // Practice actions
  getPracticesForHabit: (habitId: number) => Practice[]
  getActivePracticesForHabit: (habitId: number) => Practice[]
  togglePracticeActive: (practiceId: number) => Promise<void>
  addPractice: (habitId: number, name: string) => Promise<number | null>
  updatePractice: (practiceId: number, updates: Partial<Practice>) => Promise<void>
  updatePracticeName: (practiceId: number, name: string) => Promise<void>
  deletePractice: (practiceId: number) => Promise<void>

  // Action actions
  getActionsForPractice: (practiceId: number) => Action[]
  getActiveActionsForPractice: (practiceId: number) => Action[]
  toggleActionActive: (actionId: number) => Promise<void>
  addAction: (practiceId: number, name: string) => Promise<number | null>
  updateAction: (actionId: number, updates: Partial<Action>) => Promise<void>
  updateActionName: (actionId: number, name: string) => Promise<void>
  deleteAction: (actionId: number) => Promise<void>

  // Target actions
  getTargetsByStatus: (status: string) => Target[]
  updateTargetStatus: (targetId: number, newStatus: string) => Promise<void>
  addTarget: (name: string, habitId?: number | null, status?: string) => Promise<number | null>
  updateTarget: (targetId: number, updates: Partial<Target>) => Promise<void>
  updateTargetName: (targetId: number, name: string) => Promise<void>
  updateTargetHabit: (targetId: number, habitId: number | null) => Promise<void>
  reorderTargets: (orderedIds: number[]) => Promise<void>
  deleteTarget: (targetId: number) => Promise<void>

  // Prompt actions
  getWarmUpPromptsForHabit: (habitId: number) => Prompt[]
  getCoolDownPromptsForHabit: (habitId: number) => Prompt[]

  // Transition actions
  startTransition: () => void
  completeTransition: (note?: string) => Promise<void>
  cancelTransition: () => void

  // Computed
  getActiveHabits: () => Habit[]
  getHabitById: (id: number) => Habit | undefined
  getPracticeById: (id: number) => Practice | undefined
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  // Initial state
  habits: [],
  practices: [],
  actions: [],
  targets: [],
  prompts: [],
  habitTransitions: [],
  isLoading: true,
  lastError: null,
  inTransition: false,
  transitionStartedAt: null,
  transitionChanges: [],
  cascadeChanges: { targets: [], practices: [] },

  // Clear error
  clearError: () => set({ lastError: null }),

  // Load initial data
  loadInitialData: async () => {
    try {
      const [data, transitions] = await Promise.all([
        api.loadInitialData(),
        api.getHabitTransitions(50).catch(() => []),
      ])
      set({
        habits: data.habits,
        practices: data.practices,
        actions: data.actions,
        targets: data.targets,
        prompts: data.prompts,
        habitTransitions: transitions,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load data from API:', error)
      set({ isLoading: false })
    }
  },

  // Habit actions
  updateHabitColor: async (habitId, colorKey) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, color: colorKey } : h
      ),
    }))
    try {
      await api.updateHabit(habitId, { color: colorKey })
    } catch (error) {
      console.error('Failed to update habit color:', error)
    }
  },

  toggleHabitActive: async (habitId) => {
    const { habits, targets, practices, inTransition } = get()
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    const fromState = habit.active ? 'active' : 'inactive'
    const toState = habit.active ? 'inactive' : 'active'
    const isDeactivating = habit.active
    const newActiveState = !habit.active

    // Track change if in transition
    if (inTransition) {
      set((state) => {
        const existingIndex = state.transitionChanges.findIndex(
          (c) => c.habitId === habitId
        )
        if (existingIndex >= 0) {
          const existing = state.transitionChanges[existingIndex]
          if (existing.from === toState) {
            return {
              transitionChanges: state.transitionChanges.filter(
                (_, i) => i !== existingIndex
              ),
            }
          }
          return {
            transitionChanges: state.transitionChanges.map((c, i) =>
              i === existingIndex ? { ...c, to: toState } : c
            ),
          }
        }
        return {
          transitionChanges: [
            ...state.transitionChanges,
            { habitId, habitName: habit.name, from: fromState, to: toState },
          ],
        }
      })
    }

    // Update habit
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, active: newActiveState } : h
      ),
    }))

    try {
      await api.updateHabit(habitId, { active: newActiveState })
    } catch (error) {
      console.error('Failed to toggle habit active:', error)
    }

    // Cascade effects when deactivating
    if (isDeactivating) {
      const affectedTargets = targets.filter(
        (t) =>
          (t as any).habit_id === habitId &&
          (t.status === 'active' || t.status === 'planned')
      )
      if (affectedTargets.length > 0) {
        set((state) => ({
          cascadeChanges: {
            ...state.cascadeChanges,
            targets: [
              ...state.cascadeChanges.targets,
              ...affectedTargets.map((t) => ({ id: t.id, originalStatus: t.status })),
            ],
          },
          targets: state.targets.map((t) =>
            (t as any).habit_id === habitId &&
            (t.status === 'active' || t.status === 'planned')
              ? { ...t, status: 'parked' as const }
              : t
          ),
        }))
        for (const t of affectedTargets) {
          api.updateTarget(t.id, { status: 'parked' }).catch(console.error)
        }
      }

      const affectedPractices = practices.filter(
        (p) => p.habit_id === habitId && p.active
      )
      if (affectedPractices.length > 0) {
        set((state) => ({
          cascadeChanges: {
            ...state.cascadeChanges,
            practices: [
              ...state.cascadeChanges.practices,
              ...affectedPractices.map((p) => p.id),
            ],
          },
          practices: state.practices.map((p) =>
            p.habit_id === habitId && p.active ? { ...p, active: false } : p
          ),
        }))
        for (const p of affectedPractices) {
          api.updatePractice(p.id, { active: false }).catch(console.error)
        }
      }
    }
  },

  addHabit: async (name, targetMinutes = 30, color = 'sage') => {
    try {
      const newHabit = await api.createHabit({
        name,
        target_minutes: targetMinutes,
        color,
        active: true,
      } as any)
      set((state) => ({ habits: [...state.habits, newHabit], lastError: null }))
      return newHabit.id
    } catch (error) {
      console.error('Failed to create habit:', error)
      const errorMessage = getUserFriendlyErrorMessage(error)
      set({ lastError: errorMessage })
      return null
    }
  },

  updateHabit: async (habitId, updates) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, ...updates } : h
      ),
    }))
    try {
      await api.updateHabit(habitId, updates as any)
    } catch (error) {
      console.error('Failed to update habit:', error)
    }
  },

  updateHabitName: async (habitId, name) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, name } : h
      ),
    }))
    try {
      await api.updateHabit(habitId, { name })
    } catch (error) {
      console.error('Failed to update habit name:', error)
    }
  },

  updateHabitTargetMinutes: async (habitId, targetMinutes) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === habitId ? { ...h, target_minutes: targetMinutes } : h
      ),
    }))
    try {
      await api.updateHabit(habitId, { target_minutes: targetMinutes } as any)
    } catch (error) {
      console.error('Failed to update habit target minutes:', error)
    }
  },

  deleteHabit: async (habitId) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== habitId),
    }))
    try {
      await api.deleteHabit(habitId)
    } catch (error) {
      console.error('Failed to delete habit:', error)
    }
  },

  // Practice actions
  getPracticesForHabit: (habitId) => {
    return get().practices.filter((p) => p.habit_id === habitId)
  },

  getActivePracticesForHabit: (habitId) => {
    return get().practices.filter((p) => p.habit_id === habitId && p.active)
  },

  togglePracticeActive: async (practiceId) => {
    const practice = get().practices.find((p) => p.id === practiceId)
    if (!practice) return

    const newActiveState = !practice.active
    set((state) => ({
      practices: state.practices.map((p) =>
        p.id === practiceId ? { ...p, active: newActiveState } : p
      ),
    }))
    try {
      await api.updatePractice(practiceId, { active: newActiveState })
    } catch (error) {
      console.error('Failed to toggle practice active:', error)
    }
  },

  addPractice: async (habitId, name) => {
    try {
      const newPractice = await api.createPractice({
        habit_id: habitId,
        name,
        active: true,
      })
      set((state) => ({ practices: [...state.practices, newPractice] }))
      return newPractice.id
    } catch (error) {
      console.error('Failed to create practice:', error)
      return null
    }
  },

  updatePractice: async (practiceId, updates) => {
    set((state) => ({
      practices: state.practices.map((p) =>
        p.id === practiceId ? { ...p, ...updates } : p
      ),
    }))
    try {
      await api.updatePractice(practiceId, updates as any)
    } catch (error) {
      console.error('Failed to update practice:', error)
    }
  },

  updatePracticeName: async (practiceId, name) => {
    set((state) => ({
      practices: state.practices.map((p) =>
        p.id === practiceId ? { ...p, name } : p
      ),
    }))
    try {
      await api.updatePractice(practiceId, { name })
    } catch (error) {
      console.error('Failed to update practice name:', error)
    }
  },

  deletePractice: async (practiceId) => {
    set((state) => ({
      practices: state.practices.filter((p) => p.id !== practiceId),
    }))
    try {
      await api.deletePractice(practiceId)
    } catch (error) {
      console.error('Failed to delete practice:', error)
    }
  },

  // Action actions
  getActionsForPractice: (practiceId) => {
    return get().actions.filter((a) => a.practice_id === practiceId)
  },

  getActiveActionsForPractice: (practiceId) => {
    return get().actions.filter((a) => a.practice_id === practiceId && a.active)
  },

  toggleActionActive: async (actionId) => {
    const action = get().actions.find((a) => a.id === actionId)
    if (!action) return

    const newActiveState = !action.active
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === actionId ? { ...a, active: newActiveState } : a
      ),
    }))
    try {
      await api.updateAction(actionId, { active: newActiveState })
    } catch (error) {
      console.error('Failed to toggle action active:', error)
    }
  },

  addAction: async (practiceId, name) => {
    try {
      const newAction = await api.createAction({
        practice_id: practiceId,
        name,
        active: true,
      })
      set((state) => ({ actions: [...state.actions, newAction] }))
      return newAction.id
    } catch (error) {
      console.error('Failed to create action:', error)
      return null
    }
  },

  updateAction: async (actionId, updates) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a
      ),
    }))
    try {
      await api.updateAction(actionId, updates as any)
    } catch (error) {
      console.error('Failed to update action:', error)
    }
  },

  updateActionName: async (actionId, name) => {
    set((state) => ({
      actions: state.actions.map((a) =>
        a.id === actionId ? { ...a, name } : a
      ),
    }))
    try {
      await api.updateAction(actionId, { name })
    } catch (error) {
      console.error('Failed to update action name:', error)
    }
  },

  deleteAction: async (actionId) => {
    set((state) => ({
      actions: state.actions.filter((a) => a.id !== actionId),
    }))
    try {
      await api.deleteAction(actionId)
    } catch (error) {
      console.error('Failed to delete action:', error)
    }
  },

  // Target actions
  getTargetsByStatus: (status) => {
    return get()
      .targets.filter((t) => t.status === status)
      .sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity))
  },

  updateTargetStatus: async (targetId, newStatus) => {
    set((state) => ({
      targets: state.targets.map((t) =>
        t.id === targetId ? { ...t, status: newStatus as any } : t
      ),
    }))
    try {
      await api.updateTarget(targetId, { status: newStatus as any })
    } catch (error) {
      console.error('Failed to update target status:', error)
    }
  },

  addTarget: async (name, habitId = null, status = 'planned') => {
    try {
      const newTarget = await api.createTarget({
        name,
        habit_id: habitId,
        status,
      } as any)
      set((state) => ({ targets: [...state.targets, newTarget] }))
      return newTarget.id
    } catch (error) {
      console.error('Failed to create target:', error)
      return null
    }
  },

  updateTarget: async (targetId, updates) => {
    set((state) => ({
      targets: state.targets.map((t) =>
        t.id === targetId ? { ...t, ...updates } : t
      ),
    }))
    try {
      await api.updateTarget(targetId, updates as any)
    } catch (error) {
      console.error('Failed to update target:', error)
    }
  },

  updateTargetName: async (targetId, name) => {
    set((state) => ({
      targets: state.targets.map((t) =>
        t.id === targetId ? { ...t, name } : t
      ),
    }))
    try {
      await api.updateTarget(targetId, { name })
    } catch (error) {
      console.error('Failed to update target name:', error)
    }
  },

  updateTargetHabit: async (targetId, habitId) => {
    set((state) => ({
      targets: state.targets.map((t) =>
        t.id === targetId ? { ...t, habit_id: habitId } : t
      ),
    }))
    try {
      await api.updateTarget(targetId, { habit_id: habitId } as any)
    } catch (error) {
      console.error('Failed to update target habit:', error)
    }
  },

  reorderTargets: async (orderedIds) => {
    set((state) => ({
      targets: state.targets.map((t) => {
        const newOrder = orderedIds.indexOf(t.id)
        if (newOrder !== -1) {
          return { ...t, sort_order: newOrder }
        }
        return t
      }),
    }))
    try {
      await api.reorderTargets(orderedIds)
    } catch (error) {
      console.error('Failed to persist target order:', error)
    }
  },

  deleteTarget: async (targetId) => {
    set((state) => ({
      targets: state.targets.filter((t) => t.id !== targetId),
    }))
    try {
      await api.deleteTarget(targetId)
    } catch (error) {
      console.error('Failed to delete target:', error)
    }
  },

  // Prompt actions
  getWarmUpPromptsForHabit: (habitId) => {
    return get().prompts.filter(
      (p) => p.habit_id === habitId && p.type === 'warmup'
    )
  },

  getCoolDownPromptsForHabit: (habitId) => {
    return get().prompts.filter(
      (p) => p.habit_id === habitId && p.type === 'cooldown'
    )
  },

  // Transition actions
  startTransition: () => {
    set({
      inTransition: true,
      transitionStartedAt: new Date().toISOString(),
      transitionChanges: [],
      cascadeChanges: { targets: [], practices: [] },
    })
  },

  completeTransition: async (note = '') => {
    const { inTransition, transitionStartedAt, transitionChanges, cascadeChanges } =
      get()
    if (!inTransition) return

    const transitionData = {
      started_at: transitionStartedAt,
      ended_at: new Date().toISOString(),
      note: note || null,
      changes: transitionChanges,
      cascades: cascadeChanges,
    }

    try {
      const savedTransition = await api.createHabitTransition(transitionData as any)
      set((state) => ({
        habitTransitions: [savedTransition, ...state.habitTransitions],
      }))
    } catch (error) {
      console.error('Failed to save transition:', error)
    }

    set({
      inTransition: false,
      transitionStartedAt: null,
      transitionChanges: [],
      cascadeChanges: { targets: [], practices: [] },
    })
  },

  cancelTransition: () => {
    const { transitionChanges, cascadeChanges } = get()

    // Revert habit changes
    set((state) => ({
      habits: state.habits.map((h) => {
        const change = transitionChanges.find((c) => c.habitId === h.id)
        if (change) {
          return { ...h, active: change.from === 'active' }
        }
        return h
      }),
      // Revert target statuses
      targets: state.targets.map((t) => {
        const cascaded = cascadeChanges.targets.find((ct) => ct.id === t.id)
        if (cascaded) {
          return { ...t, status: cascaded.originalStatus as any }
        }
        return t
      }),
      // Reactivate practices
      practices: state.practices.map((p) => {
        if (cascadeChanges.practices.includes(p.id)) {
          return { ...p, active: true }
        }
        return p
      }),
      inTransition: false,
      transitionStartedAt: null,
      transitionChanges: [],
      cascadeChanges: { targets: [], practices: [] },
    }))
  },

  // Computed
  getActiveHabits: () => {
    return get().habits.filter((h) => h.active && (h as any).type !== 'caution')
  },

  getHabitById: (id) => {
    return get().habits.find((h) => h.id === id)
  },

  getPracticeById: (id) => {
    return get().practices.find((p) => p.id === id)
  },
}))
