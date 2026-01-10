import { createContext, useContext, useState } from 'react'
import { mockHabits as initialHabits } from '@/data/mockData'

const HabitsContext = createContext(null)

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState(initialHabits)

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

  const value = {
    habits,
    activeHabits,
    updateHabitColor,
    toggleHabitActive,
    getHabitByName,
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
