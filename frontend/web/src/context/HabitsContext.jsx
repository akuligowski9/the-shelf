import { createContext, useContext, useState, useEffect } from 'react'
import {
  mockHabits as initialHabits,
  mockPractices as initialPractices,
  mockActions as initialActions,
  mockTargets as initialTargets,
  mockWarmUpTemplates as initialWarmUpTemplates,
  mockCoolDownTemplates as initialCoolDownTemplates,
} from '@/data/mockData'
import {
  loadInitialData,
  createHabit as apiCreateHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  createPractice as apiCreatePractice,
  updatePractice as apiUpdatePractice,
  deletePractice as apiDeletePractice,
  createAction as apiCreateAction,
  updateAction as apiUpdateAction,
  deleteAction as apiDeleteAction,
  createTarget as apiCreateTarget,
  updateTarget as apiUpdateTarget,
  deleteTarget as apiDeleteTarget,
  reorderTargets as apiReorderTargets,
} from '@/lib/api'

const HabitsContext = createContext(null)

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(initialHabits)
  const [practices, setPractices] = useState(initialPractices)
  const [actions, setActions] = useState(initialActions)
  const [targets, setTargets] = useState(initialTargets)
  const [warmUpTemplates, setWarmUpTemplates] = useState(initialWarmUpTemplates)
  const [coolDownTemplates, setCoolDownTemplates] = useState(initialCoolDownTemplates)
  const [isLoading, setIsLoading] = useState(true)

  // Transition window state
  const [inTransition, setInTransition] = useState(false)
  const [transitionStartedAt, setTransitionStartedAt] = useState(null)
  const [transitionChanges, setTransitionChanges] = useState([]) // { habitId, habitName, from: 'active'|'inactive', to: 'active'|'inactive' }
  const [cascadeChanges, setCascadeChanges] = useState({ targets: [], practices: [] }) // Track cascaded changes for revert
  const [habitTransitions, setHabitTransitions] = useState([]) // Completed transitions

  // Load data from API on mount
  useEffect(() => {
    loadInitialData()
      .then(data => {
        setHabits(data.habits)
        setPractices(data.practices)
        setActions(data.actions)
        if (data.targets.length > 0) {
          setTargets(data.targets)
        }
      })
      .catch(err => {
        console.error('Failed to load data from API, using mock data:', err)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Update a habit's color
  const updateHabitColor = async (habitId, colorKey) => {
    // Optimistic update
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, color: colorKey } : h)
    )
    try {
      await apiUpdateHabit(habitId, { color: colorKey })
    } catch (err) {
      console.error('Failed to update habit color:', err)
    }
  }

  // Toggle habit active status (tracks changes when in transition)
  const toggleHabitActive = async (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const fromState = habit.active ? 'active' : 'inactive'
    const toState = habit.active ? 'inactive' : 'active'
    const isDeactivating = habit.active
    const newActiveState = !habit.active

    // Track the change if we're in a transition window
    if (inTransition) {
      setTransitionChanges(prev => {
        // Check if this habit was already changed - if so, update or remove the entry
        const existingIndex = prev.findIndex(c => c.habitId === habitId)
        if (existingIndex >= 0) {
          const existing = prev[existingIndex]
          // If we're back to original state, remove the change
          if (existing.from === toState) {
            return prev.filter((_, i) => i !== existingIndex)
          }
          // Otherwise update the 'to' state
          return prev.map((c, i) => i === existingIndex ? { ...c, to: toState } : c)
        }
        // New change
        return [...prev, { habitId, habitName: habit.name, from: fromState, to: toState }]
      })
    }

    // Optimistic update - toggle the habit
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, active: newActiveState } : h)
    )

    // Call API
    try {
      await apiUpdateHabit(habitId, { active: newActiveState })
    } catch (err) {
      console.error('Failed to toggle habit active:', err)
    }

    // Cascade effects when deactivating
    if (isDeactivating) {
      // Track and move linked targets (active, planned) to parked
      const affectedTargets = targets.filter(
        t => t.habit_id === habitId && (t.status === 'active' || t.status === 'planned')
      )
      if (affectedTargets.length > 0) {
        setCascadeChanges(prev => ({
          ...prev,
          targets: [...prev.targets, ...affectedTargets.map(t => ({ id: t.id, originalStatus: t.status }))]
        }))
        setTargets(prev =>
          prev.map(t => {
            if (t.habit_id === habitId && (t.status === 'active' || t.status === 'planned')) {
              return { ...t, status: 'parked' }
            }
            return t
          })
        )
        // Update targets in API
        for (const t of affectedTargets) {
          apiUpdateTarget(t.id, { status: 'parked' }).catch(err =>
            console.error('Failed to update target status:', err)
          )
        }
      }

      // Track and deactivate practices under this habit
      const affectedPractices = practices.filter(p => p.habit_id === habitId && p.active)
      if (affectedPractices.length > 0) {
        setCascadeChanges(prev => ({
          ...prev,
          practices: [...prev.practices, ...affectedPractices.map(p => p.id)]
        }))
        setPractices(prev =>
          prev.map(p => {
            if (p.habit_id === habitId && p.active) {
              return { ...p, active: false }
            }
            return p
          })
        )
        // Update practices in API
        for (const p of affectedPractices) {
          apiUpdatePractice(p.id, { active: false }).catch(err =>
            console.error('Failed to update practice active:', err)
          )
        }
      }
    }
  }

  // Get habit by name (for entry lookups)
  const getHabitByName = (name) => {
    return habits.find(h => h.name === name)
  }

  // Get active habits
  const activeHabits = habits.filter(h => h.active)

  // ---- Practice management ----

  // Get all practices for a habit (active and inactive)
  const getPracticesForHabit = (habitId) => {
    return practices.filter(p => p.habit_id === habitId)
  }

  // Get only active practices for a habit
  const getActivePracticesForHabit = (habitId) => {
    return practices.filter(p => p.habit_id === habitId && p.active)
  }

  // Toggle practice active status
  const togglePracticeActive = async (practiceId) => {
    const practice = practices.find(p => p.id === practiceId)
    if (!practice) return

    const newActiveState = !practice.active
    setPractices(prev =>
      prev.map(p => p.id === practiceId ? { ...p, active: newActiveState } : p)
    )
    try {
      await apiUpdatePractice(practiceId, { active: newActiveState })
    } catch (err) {
      console.error('Failed to toggle practice active:', err)
    }
  }

  // Add a new practice to a habit
  const addPractice = async (habitId, name) => {
    try {
      const newPractice = await apiCreatePractice({
        habit_id: habitId,
        name,
        active: true,
      })
      setPractices(prev => [...prev, newPractice])
      return newPractice.id
    } catch (err) {
      console.error('Failed to create practice:', err)
      return null
    }
  }

  // Update practice name
  const updatePracticeName = async (practiceId, name) => {
    setPractices(prev =>
      prev.map(p => p.id === practiceId ? { ...p, name } : p)
    )
    try {
      await apiUpdatePractice(practiceId, { name })
    } catch (err) {
      console.error('Failed to update practice name:', err)
    }
  }

  // Update practice details (rich text content)
  const updatePracticeDetails = async (practiceId, details) => {
    setPractices(prev =>
      prev.map(p => p.id === practiceId ? { ...p, details } : p)
    )
    try {
      await apiUpdatePractice(practiceId, { details })
    } catch (err) {
      console.error('Failed to update practice details:', err)
    }
  }

  // Delete a practice
  const deletePractice = async (practiceId) => {
    setPractices(prev => prev.filter(p => p.id !== practiceId))
    try {
      await apiDeletePractice(practiceId)
    } catch (err) {
      console.error('Failed to delete practice:', err)
    }
  }

  // Get practice by id
  const getPracticeById = (practiceId) => {
    return practices.find(p => p.id === practiceId)
  }

  // ---- Action management ----

  // Get all actions for a practice (active and inactive)
  const getActionsForPractice = (practiceId) => {
    return actions.filter(a => a.practice_id === practiceId)
  }

  // Get only active actions for a practice
  const getActiveActionsForPractice = (practiceId) => {
    return actions.filter(a => a.practice_id === practiceId && a.active)
  }

  // Toggle action active status
  const toggleActionActive = async (actionId) => {
    const action = actions.find(a => a.id === actionId)
    if (!action) return

    const newActiveState = !action.active
    setActions(prev =>
      prev.map(a => a.id === actionId ? { ...a, active: newActiveState } : a)
    )
    try {
      await apiUpdateAction(actionId, { active: newActiveState })
    } catch (err) {
      console.error('Failed to toggle action active:', err)
    }
  }

  // Add a new action to a practice
  const addAction = async (practiceId, name) => {
    try {
      const newAction = await apiCreateAction({
        practice_id: practiceId,
        name,
        active: true,
      })
      setActions(prev => [...prev, newAction])
      return newAction.id
    } catch (err) {
      console.error('Failed to create action:', err)
      return null
    }
  }

  // Update action name
  const updateActionName = async (actionId, name) => {
    setActions(prev =>
      prev.map(a => a.id === actionId ? { ...a, name } : a)
    )
    try {
      await apiUpdateAction(actionId, { name })
    } catch (err) {
      console.error('Failed to update action name:', err)
    }
  }

  // Delete an action
  const deleteAction = async (actionId) => {
    setActions(prev => prev.filter(a => a.id !== actionId))
    try {
      await apiDeleteAction(actionId)
    } catch (err) {
      console.error('Failed to delete action:', err)
    }
  }

  // ---- Target management ----

  // Get targets by status (sorted by sort_order)
  const getTargetsByStatus = (status) => {
    return targets
      .filter(t => t.status === status)
      .sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity))
  }

  // Update target status
  const updateTargetStatus = async (targetId, newStatus) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, status: newStatus } : t)
    )
    try {
      await apiUpdateTarget(targetId, { status: newStatus })
    } catch (err) {
      console.error('Failed to update target status:', err)
    }
  }

  // Add a new target
  const addTarget = async (name, habitId = null, status = 'planned', type = 'project') => {
    try {
      const newTarget = await apiCreateTarget({
        name,
        habit_id: habitId,
        status,
        type,
      })
      setTargets(prev => [...prev, newTarget])
      return newTarget.id
    } catch (err) {
      console.error('Failed to create target:', err)
      return null
    }
  }

  // Update target name
  const updateTargetName = async (targetId, name) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, name } : t)
    )
    try {
      await apiUpdateTarget(targetId, { name })
    } catch (err) {
      console.error('Failed to update target name:', err)
    }
  }

  // Update target habit association
  const updateTargetHabit = async (targetId, habitId) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, habit_id: habitId } : t)
    )
    try {
      await apiUpdateTarget(targetId, { habit_id: habitId })
    } catch (err) {
      console.error('Failed to update target habit:', err)
    }
  }

  // Update target dates and duration
  const updateTargetDates = async (targetId, startDate, endDate, plannedDuration) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? {
        ...t,
        start_date: startDate,
        end_date: endDate,
        planned_duration: plannedDuration
      } : t)
    )
    try {
      await apiUpdateTarget(targetId, {
        start_date: startDate,
        end_date: endDate,
        planned_duration: plannedDuration,
      })
    } catch (err) {
      console.error('Failed to update target dates:', err)
    }
  }

  // Reorder targets (for drag-and-drop)
  const reorderTargets = async (orderedIds) => {
    // Optimistic update
    setTargets(prev =>
      prev.map(t => {
        const newOrder = orderedIds.indexOf(t.id)
        if (newOrder !== -1) {
          return { ...t, sort_order: newOrder }
        }
        return t
      })
    )
    // Persist to API
    try {
      await apiReorderTargets(orderedIds)
    } catch (err) {
      console.error('Failed to persist target order:', err)
    }
  }

  // Delete a target
  const deleteTarget = async (targetId) => {
    setTargets(prev => prev.filter(t => t.id !== targetId))
    try {
      await apiDeleteTarget(targetId)
    } catch (err) {
      console.error('Failed to delete target:', err)
    }
  }

  // ---- Habit management ----

  // Add a new habit
  const addHabit = async (name, targetMinutes = 30, color = 'sage') => {
    try {
      const newHabit = await apiCreateHabit({
        name,
        target_minutes: targetMinutes,
        color,
        active: true,
      })
      setHabits(prev => [...prev, newHabit])
      return newHabit.id
    } catch (err) {
      console.error('Failed to create habit:', err)
      return null
    }
  }

  // Update habit name
  const updateHabitName = async (habitId, name) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, name } : h)
    )
    try {
      await apiUpdateHabit(habitId, { name })
    } catch (err) {
      console.error('Failed to update habit name:', err)
    }
  }

  // Update habit target minutes
  const updateHabitTargetMinutes = async (habitId, targetMinutes) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, target_minutes: targetMinutes } : h)
    )
    try {
      await apiUpdateHabit(habitId, { target_minutes: targetMinutes })
    } catch (err) {
      console.error('Failed to update habit target minutes:', err)
    }
  }

  // Update habit track_actions flag
  const updateHabitTrackActions = async (habitId, trackActions) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, track_actions: trackActions } : h)
    )
    try {
      await apiUpdateHabit(habitId, { track_actions: trackActions })
    } catch (err) {
      console.error('Failed to update habit track_actions:', err)
    }
  }

  // Delete a habit
  const deleteHabit = async (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
    try {
      await apiDeleteHabit(habitId)
    } catch (err) {
      console.error('Failed to delete habit:', err)
    }
  }

  // ---- Template management ----

  // Get warm-up templates for a habit
  const getWarmUpTemplatesForHabit = (habitId) => {
    return warmUpTemplates.filter(t => t.habit_id === habitId)
  }

  // Get cool-down templates for a habit
  const getCoolDownTemplatesForHabit = (habitId) => {
    return coolDownTemplates.filter(t => t.habit_id === habitId)
  }

  // Add a warm-up template
  const addWarmUpTemplate = (habitId, name, content = '', hasDynamicElements = false) => {
    const newId = Math.max(...warmUpTemplates.map(t => t.id), 0) + 1
    setWarmUpTemplates(prev => [
      ...prev,
      { id: newId, habit_id: habitId, name, content, has_dynamic_elements: hasDynamicElements, active: true }
    ])
    return newId
  }

  // Add a cool-down template
  const addCoolDownTemplate = (habitId, name, content = '', hasDynamicElements = false) => {
    const newId = Math.max(...coolDownTemplates.map(t => t.id), 0) + 1
    setCoolDownTemplates(prev => [
      ...prev,
      { id: newId, habit_id: habitId, name, content, has_dynamic_elements: hasDynamicElements, active: true }
    ])
    return newId
  }

  // Update a warm-up template
  const updateWarmUpTemplate = (templateId, updates) => {
    setWarmUpTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, ...updates } : t)
    )
  }

  // Update a cool-down template
  const updateCoolDownTemplate = (templateId, updates) => {
    setCoolDownTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, ...updates } : t)
    )
  }

  // Delete a warm-up template
  const deleteWarmUpTemplate = (templateId) => {
    setWarmUpTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  // Delete a cool-down template
  const deleteCoolDownTemplate = (templateId) => {
    setCoolDownTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  // Toggle warm-up template active status
  const toggleWarmUpTemplateActive = (templateId) => {
    setWarmUpTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, active: !t.active } : t)
    )
  }

  // Toggle cool-down template active status
  const toggleCoolDownTemplateActive = (templateId) => {
    setCoolDownTemplates(prev =>
      prev.map(t => t.id === templateId ? { ...t, active: !t.active } : t)
    )
  }

  // ---- Transition Window Management ----

  // Start a transition window
  const startTransition = () => {
    setInTransition(true)
    setTransitionStartedAt(new Date().toISOString())
    setTransitionChanges([])
    setCascadeChanges({ targets: [], practices: [] })
  }

  // Complete and save a transition
  const completeTransition = (note = '') => {
    if (!inTransition) return null

    const transition = {
      id: Math.max(...habitTransitions.map(t => t.id), 0) + 1,
      started_at: transitionStartedAt,
      ended_at: new Date().toISOString(),
      note,
      changes: transitionChanges,
      cascades: cascadeChanges,
    }

    setHabitTransitions(prev => [...prev, transition])
    setInTransition(false)
    setTransitionStartedAt(null)
    setTransitionChanges([])
    setCascadeChanges({ targets: [], practices: [] })

    return transition
  }

  // Cancel a transition (revert all changes)
  const cancelTransition = () => {
    if (!inTransition) return

    // Revert all habit changes made during this transition
    transitionChanges.forEach(change => {
      setHabits(prev =>
        prev.map(h => {
          if (h.id === change.habitId) {
            return { ...h, active: change.from === 'active' }
          }
          return h
        })
      )
    })

    // Revert cascade changes - restore target statuses
    cascadeChanges.targets.forEach(({ id, originalStatus }) => {
      setTargets(prev =>
        prev.map(t => t.id === id ? { ...t, status: originalStatus } : t)
      )
    })

    // Revert cascade changes - reactivate practices
    cascadeChanges.practices.forEach(practiceId => {
      setPractices(prev =>
        prev.map(p => p.id === practiceId ? { ...p, active: true } : p)
      )
    })

    setInTransition(false)
    setTransitionStartedAt(null)
    setTransitionChanges([])
    setCascadeChanges({ targets: [], practices: [] })
  }

  const value = {
    // Loading state
    isLoading,
    // Habits
    habits,
    activeHabits,
    updateHabitColor,
    toggleHabitActive,
    getHabitByName,
    addHabit,
    updateHabitName,
    updateHabitTargetMinutes,
    updateHabitTrackActions,
    deleteHabit,
    // Practices
    practices,
    getPracticesForHabit,
    getActivePracticesForHabit,
    togglePracticeActive,
    addPractice,
    updatePracticeName,
    updatePracticeDetails,
    getPracticeById,
    deletePractice,
    // Actions
    actions,
    getActionsForPractice,
    getActiveActionsForPractice,
    toggleActionActive,
    addAction,
    updateActionName,
    deleteAction,
    // Targets
    targets,
    getTargetsByStatus,
    updateTargetStatus,
    addTarget,
    updateTargetName,
    updateTargetHabit,
    updateTargetDates,
    reorderTargets,
    deleteTarget,
    // Templates
    warmUpTemplates,
    coolDownTemplates,
    getWarmUpTemplatesForHabit,
    getCoolDownTemplatesForHabit,
    addWarmUpTemplate,
    addCoolDownTemplate,
    updateWarmUpTemplate,
    updateCoolDownTemplate,
    deleteWarmUpTemplate,
    deleteCoolDownTemplate,
    toggleWarmUpTemplateActive,
    toggleCoolDownTemplateActive,
    // Transitions
    inTransition,
    transitionChanges,
    cascadeChanges,
    habitTransitions,
    startTransition,
    completeTransition,
    cancelTransition,
  }

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  )
}

export function useHabits() {
  const context = useContext(HabitsContext)
  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider')
  }
  return context
}
