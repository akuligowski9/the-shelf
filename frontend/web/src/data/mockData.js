// Mock data for development - mirrors expected API structure

export const mockHabits = [
  { id: 1, name: 'Software', active: true, target_minutes: 120 },
  { id: 2, name: 'Spanish', active: true, target_minutes: 30 },
  { id: 3, name: 'Exercise', active: true, target_minutes: 60 },
  { id: 4, name: 'Dog Training', active: true, target_minutes: 30 },
  { id: 5, name: 'Reading', active: false, target_minutes: 30 },
]

export const mockPractices = [
  // Software
  { id: 1, habit_id: 1, name: 'Personal Project Development', active: true },
  { id: 2, habit_id: 1, name: 'Architecture Planning', active: true },
  { id: 3, habit_id: 1, name: 'Open Source', active: true },
  // Spanish
  { id: 4, habit_id: 2, name: 'Textbook Learning', active: true },
  { id: 5, habit_id: 2, name: 'Conversation', active: true },
  // Exercise
  { id: 6, habit_id: 3, name: 'Walking', active: true },
  { id: 7, habit_id: 3, name: 'Outdoor Walking', active: true },
  { id: 8, habit_id: 3, name: 'Gym', active: true },
  { id: 9, habit_id: 3, name: 'Corrective Exercises', active: true },
  // Dog Training
  { id: 10, habit_id: 4, name: 'Walk Training', active: true },
  { id: 11, habit_id: 4, name: 'Loose-Leash Drills', active: true },
  { id: 12, habit_id: 4, name: 'Miscellaneous Care', active: true },
  // Reading
  { id: 13, habit_id: 5, name: 'Books', active: true },
  { id: 14, habit_id: 5, name: 'Articles', active: true },
]

export const mockTargets = [
  { id: 1, name: 'The Shelf', status: 'active', habit_id: 1 },
  { id: 2, name: 'Spanish B1 Certification', status: 'planned', habit_id: 2 },
  { id: 3, name: 'Home Renovation Ideas', status: 'parked', habit_id: null },
]

// Helper to get practices for a specific habit
export function getPracticesForHabit(habitId) {
  return mockPractices.filter(p => p.habit_id === habitId && p.active)
}

// Helper to get active habits
export function getActiveHabits() {
  return mockHabits.filter(h => h.active)
}
