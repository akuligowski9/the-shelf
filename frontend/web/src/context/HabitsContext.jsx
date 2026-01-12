import { createContext, useContext, useState } from 'react'
import {
  mockHabits as initialHabits,
  mockPractices as initialPractices,
  mockBehaviors as initialBehaviors,
  mockTargets as initialTargets,
  mockScheduledPractices as initialScheduledPractices,
  mockWarmUpTemplates as initialWarmUpTemplates,
  mockCoolDownTemplates as initialCoolDownTemplates,
} from '@/data/mockData'

const HabitsContext = createContext(null)

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(initialHabits)
  const [practices, setPractices] = useState(initialPractices)
  const [behaviors, setBehaviors] = useState(initialBehaviors)
  const [targets, setTargets] = useState(initialTargets)
  const [scheduledPractices, setScheduledPractices] = useState(initialScheduledPractices)
  const [warmUpTemplates, setWarmUpTemplates] = useState(initialWarmUpTemplates)
  const [coolDownTemplates, setCoolDownTemplates] = useState(initialCoolDownTemplates)

  // Update a habit's color
  const updateHabitColor = (habitId, colorKey) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, color: colorKey } : h)
    )
  }

  // Toggle habit active status
  const toggleHabitActive = (habitId) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, active: !h.active } : h)
    )
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
  const togglePracticeActive = (practiceId) => {
    setPractices(prev =>
      prev.map(p => p.id === practiceId ? { ...p, active: !p.active } : p)
    )
  }

  // Add a new practice to a habit
  const addPractice = (habitId, name) => {
    const newId = Math.max(...practices.map(p => p.id), 0) + 1
    setPractices(prev => [
      ...prev,
      { id: newId, habit_id: habitId, name, active: true }
    ])
    return newId
  }

  // Update practice name
  const updatePracticeName = (practiceId, name) => {
    setPractices(prev =>
      prev.map(p => p.id === practiceId ? { ...p, name } : p)
    )
  }

  // Update practice details (rich text content)
  const updatePracticeDetails = (practiceId, details) => {
    setPractices(prev =>
      prev.map(p => p.id === practiceId ? { ...p, details } : p)
    )
  }

  // Get practice by id
  const getPracticeById = (practiceId) => {
    return practices.find(p => p.id === practiceId)
  }

  // ---- Scheduled Practices management ----

  // Get scheduled practices for a specific date
  const getScheduledPracticesForDate = (dateStr) => {
    return scheduledPractices
      .filter(sp => sp.date === dateStr)
      .map(sp => ({
        ...sp,
        practice: practices.find(p => p.id === sp.practice_id)
      }))
  }

  // Schedule a practice on specific dates
  const schedulePractice = (practiceId, dates) => {
    const newScheduled = dates.map((date, idx) => ({
      id: Math.max(...scheduledPractices.map(sp => sp.id), 0) + idx + 1,
      practice_id: practiceId,
      date,
    }))
    setScheduledPractices(prev => [...prev, ...newScheduled])
  }

  // Remove a scheduled practice
  const removeScheduledPractice = (scheduledId) => {
    setScheduledPractices(prev => prev.filter(sp => sp.id !== scheduledId))
  }

  // Remove all scheduled practices for a practice on a specific date
  const unschedulePracticeFromDate = (practiceId, dateStr) => {
    setScheduledPractices(prev =>
      prev.filter(sp => !(sp.practice_id === practiceId && sp.date === dateStr))
    )
  }

  // ---- Behavior management ----

  // Get all behaviors for a practice (active and inactive)
  const getBehaviorsForPractice = (practiceId) => {
    return behaviors.filter(b => b.practice_id === practiceId)
  }

  // Get only active behaviors for a practice
  const getActiveBehaviorsForPractice = (practiceId) => {
    return behaviors.filter(b => b.practice_id === practiceId && b.active)
  }

  // Toggle behavior active status
  const toggleBehaviorActive = (behaviorId) => {
    setBehaviors(prev =>
      prev.map(b => b.id === behaviorId ? { ...b, active: !b.active } : b)
    )
  }

  // Add a new behavior to a practice
  const addBehavior = (practiceId, name) => {
    const newId = Math.max(...behaviors.map(b => b.id), 0) + 1
    setBehaviors(prev => [
      ...prev,
      { id: newId, practice_id: practiceId, name, active: true }
    ])
    return newId
  }

  // Update behavior name
  const updateBehaviorName = (behaviorId, name) => {
    setBehaviors(prev =>
      prev.map(b => b.id === behaviorId ? { ...b, name } : b)
    )
  }

  // ---- Target management ----

  // Get targets by status
  const getTargetsByStatus = (status) => {
    return targets.filter(t => t.status === status)
  }

  // Update target status
  const updateTargetStatus = (targetId, newStatus) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, status: newStatus } : t)
    )
  }

  // Add a new target
  const addTarget = (name, habitId = null, status = 'planned') => {
    const newId = Math.max(...targets.map(t => t.id), 0) + 1
    setTargets(prev => [
      ...prev,
      { id: newId, name, habit_id: habitId, status }
    ])
    return newId
  }

  // Update target name
  const updateTargetName = (targetId, name) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, name } : t)
    )
  }

  // Update target habit association
  const updateTargetHabit = (targetId, habitId) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, habit_id: habitId } : t)
    )
  }

  // Update target dates
  const updateTargetDates = (targetId, startDate, endDate) => {
    setTargets(prev =>
      prev.map(t => t.id === targetId ? { ...t, start_date: startDate, end_date: endDate } : t)
    )
  }

  // ---- Habit management ----

  // Add a new habit
  const addHabit = (name, targetMinutes = 30, color = 'sage') => {
    const newId = Math.max(...habits.map(h => h.id), 0) + 1
    setHabits(prev => [
      ...prev,
      { id: newId, name, active: true, target_minutes: targetMinutes, color }
    ])
    return newId
  }

  // Update habit name
  const updateHabitName = (habitId, name) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, name } : h)
    )
  }

  // Update habit target minutes
  const updateHabitTargetMinutes = (habitId, targetMinutes) => {
    setHabits(prev =>
      prev.map(h => h.id === habitId ? { ...h, target_minutes: targetMinutes } : h)
    )
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

  const value = {
    // Habits
    habits,
    activeHabits,
    updateHabitColor,
    toggleHabitActive,
    getHabitByName,
    addHabit,
    updateHabitName,
    updateHabitTargetMinutes,
    // Practices
    practices,
    getPracticesForHabit,
    getActivePracticesForHabit,
    togglePracticeActive,
    addPractice,
    updatePracticeName,
    updatePracticeDetails,
    getPracticeById,
    // Scheduled Practices
    scheduledPractices,
    getScheduledPracticesForDate,
    schedulePractice,
    removeScheduledPractice,
    unschedulePracticeFromDate,
    // Behaviors
    behaviors,
    getBehaviorsForPractice,
    getActiveBehaviorsForPractice,
    toggleBehaviorActive,
    addBehavior,
    updateBehaviorName,
    // Targets
    targets,
    getTargetsByStatus,
    updateTargetStatus,
    addTarget,
    updateTargetName,
    updateTargetHabit,
    updateTargetDates,
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
