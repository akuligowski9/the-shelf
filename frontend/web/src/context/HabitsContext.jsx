import { createContext, useContext, useState } from 'react'
import {
  mockHabits as initialHabits,
  mockPractices as initialPractices,
  mockBehaviors as initialBehaviors,
} from '@/data/mockData'

const HabitsContext = createContext(null)

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(initialHabits)
  const [practices, setPractices] = useState(initialPractices)
  const [behaviors, setBehaviors] = useState(initialBehaviors)

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

  const value = {
    habits,
    activeHabits,
    updateHabitColor,
    toggleHabitActive,
    getHabitByName,
    // Practices
    practices,
    getPracticesForHabit,
    getActivePracticesForHabit,
    togglePracticeActive,
    addPractice,
    updatePracticeName,
    // Behaviors
    behaviors,
    getBehaviorsForPractice,
    getActiveBehaviorsForPractice,
    toggleBehaviorActive,
    addBehavior,
    updateBehaviorName,
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
