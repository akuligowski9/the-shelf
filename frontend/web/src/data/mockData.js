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

// Entries from multiple days (based on actual log data)
export const mockEntries = [
  // Jan 1
  {
    id: 101,
    type: 'habit',
    habit: 'Spanish',
    practice: 'Textbook Learning',
    occurred_at: '2026-01-01T10:00:00',
    duration_minutes: 30,
    note: 'Worked through a new chapter and reviewed key vocabulary.',
    is_highlight: false,
  },
  {
    id: 102,
    type: 'habit',
    habit: 'Software',
    practice: 'Architecture Planning',
    occurred_at: '2026-01-01T11:00:00',
    duration_minutes: 45,
    note: 'Sketched backend data relationships and clarified target states.',
    is_highlight: true,
  },
  {
    id: 103,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Outdoor Walking',
    occurred_at: '2026-01-01T15:30:00',
    duration_minutes: 60,
    note: 'Long walk focused on recovery and steady pacing.',
    is_highlight: false,
  },
  {
    id: 104,
    type: 'habit',
    habit: 'Dog Training',
    practice: 'Loose-Leash Drills',
    occurred_at: '2026-01-01T17:30:00',
    duration_minutes: 25,
    note: 'Practiced calm exits, leash tension awareness, and greetings.',
    is_highlight: false,
  },
  // Jan 2
  {
    id: 201,
    type: 'habit',
    habit: 'Spanish',
    practice: 'Textbook Learning',
    occurred_at: '2026-01-02T09:00:00',
    duration_minutes: 30,
    note: 'Made flashcards and completed 5 pages of the Spanish textbook.',
    is_highlight: false,
  },
  {
    id: 202,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Corrective Exercises',
    occurred_at: '2026-01-02T10:00:00',
    duration_minutes: 30,
    note: 'Focused on body imbalance correction exercises.',
    is_highlight: false,
  },
  {
    id: 203,
    type: 'habit',
    habit: 'Software',
    practice: 'Personal Project Development',
    occurred_at: '2026-01-02T11:00:00',
    duration_minutes: 120,
    note: 'Spent about 2 hours on development work for The Shelf.',
    is_highlight: true,
  },
  {
    id: 204,
    type: 'life',
    occurred_at: '2026-01-02T13:00:00',
    duration_minutes: 60,
    note: 'Family / Social: Spent time with Maite and her friends on a walk.',
    is_highlight: false,
  },
  {
    id: 205,
    type: 'life',
    occurred_at: '2026-01-02T14:00:00',
    duration_minutes: 120,
    note: 'Family / Social: Dinner with Andrea.',
    is_highlight: false,
  },
  {
    id: 206,
    type: 'caution',
    occurred_at: '2026-01-02T18:00:00',
    duration_minutes: null,
    note: 'Alcohol Consumption: Had alcohol today as a behavior to watch for.',
    is_highlight: false,
  },
  // Jan 3
  {
    id: 301,
    type: 'habit',
    habit: 'Dog Training',
    practice: 'Walk Training',
    occurred_at: '2026-01-03T09:00:00',
    duration_minutes: 60,
    note: 'Spent 60 minutes on dog training today.',
    is_highlight: false,
  },
  {
    id: 302,
    type: 'life',
    occurred_at: '2026-01-03T10:00:00',
    duration_minutes: 240,
    note: 'Household / Organization: Cleaned the apartment and prepared for moving back to Magdalena.',
    is_highlight: false,
  },
  {
    id: 303,
    type: 'life',
    occurred_at: '2026-01-03T14:00:00',
    duration_minutes: 60,
    note: 'Travel: Drove back to La Molina, about a 60-minute drive.',
    is_highlight: false,
  },
  {
    id: 304,
    type: 'caution',
    occurred_at: '2026-01-03T16:00:00',
    duration_minutes: 270,
    note: 'Rest for Hips: Noted hip pain after certain activities and took about 4-5 hours of rest.',
    is_highlight: false,
  },
  // Jan 4 - Moving day
  {
    id: 401,
    type: 'life',
    occurred_at: '2026-01-04T09:00:00',
    duration_minutes: 180,
    note: 'Household / Organization: Packing up in La Molina in preparation for the move back to San Isidro.',
    is_highlight: false,
  },
  {
    id: 402,
    type: 'life',
    occurred_at: '2026-01-04T12:00:00',
    duration_minutes: 60,
    note: 'Travel: Drive from La Molina to San Isidro.',
    is_highlight: false,
  },
  {
    id: 403,
    type: 'life',
    occurred_at: '2026-01-04T13:00:00',
    duration_minutes: 180,
    note: 'Household / Organization: Unpacking and organizing the apartment after the move.',
    is_highlight: false,
  },
  // Jan 5
  {
    id: 501,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Walking',
    occurred_at: '2026-01-05T09:00:00',
    duration_minutes: 60,
    note: 'Morning walk with the dogs.',
    is_highlight: false,
  },
  {
    id: 502,
    type: 'habit',
    habit: 'Software',
    practice: 'Architecture Planning',
    occurred_at: '2026-01-05T10:30:00',
    duration_minutes: 90,
    note: 'Architecture planning session for The Shelf project.',
    is_highlight: true,
  },
  {
    id: 503,
    type: 'life',
    occurred_at: '2026-01-05T14:00:00',
    duration_minutes: 120,
    note: 'Household / Organization: Groceries at Magdalena market.',
    is_highlight: false,
  },
  {
    id: 504,
    type: 'life',
    occurred_at: '2026-01-05T16:30:00',
    duration_minutes: 120,
    note: 'Household / Organization: Meal prep for the week.',
    is_highlight: false,
  },
  // Jan 6
  {
    id: 601,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Gym',
    occurred_at: '2026-01-06T09:00:00',
    duration_minutes: 60,
    note: null,
    is_highlight: false,
  },
  {
    id: 602,
    type: 'habit',
    habit: 'Reading',
    practice: null,
    occurred_at: '2026-01-06T10:00:00',
    duration_minutes: 30,
    note: null,
    is_highlight: false,
  },
  {
    id: 603,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Walking',
    occurred_at: '2026-01-06T10:30:00',
    duration_minutes: 45,
    note: 'With the dogs.',
    is_highlight: false,
  },
  {
    id: 604,
    type: 'habit',
    habit: 'Software',
    practice: null,
    occurred_at: '2026-01-06T11:15:00',
    duration_minutes: 120,
    note: 'More time dedicated to The Shelf and exploring AI.',
    is_highlight: true,
  },
  {
    id: 605,
    type: 'life',
    occurred_at: '2026-01-06T13:15:00',
    duration_minutes: 60,
    note: 'Ordering water and groceries.',
    is_highlight: false,
  },
  // Jan 7
  {
    id: 701,
    type: 'habit',
    habit: 'Software',
    practice: 'Personal Project Development',
    occurred_at: '2026-01-07T10:00:00',
    duration_minutes: 180,
    note: 'Frontend development for The Shelf.',
    is_highlight: true,
  },
  {
    id: 702,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Walking',
    occurred_at: '2026-01-07T14:00:00',
    duration_minutes: 45,
    note: 'Afternoon walk.',
    is_highlight: false,
  },
  // Jan 8
  {
    id: 801,
    type: 'habit',
    habit: 'Software',
    practice: 'Personal Project Development',
    occurred_at: '2026-01-08T09:00:00',
    duration_minutes: 240,
    note: 'Full day of coding on The Shelf frontend with Claude.',
    is_highlight: true,
  },
  {
    id: 802,
    type: 'habit',
    habit: 'Dog Training',
    practice: 'Walk Training',
    occurred_at: '2026-01-08T15:00:00',
    duration_minutes: 30,
    note: 'Quick training session.',
    is_highlight: false,
  },
  // Jan 9 (today in mock)
  {
    id: 901,
    type: 'habit',
    habit: 'Software',
    practice: 'Architecture Planning',
    occurred_at: '2026-01-09T10:00:00',
    duration_minutes: 90,
    note: 'Worked on The Shelf frontend planning.',
    is_highlight: true,
  },
  {
    id: 902,
    type: 'habit',
    habit: 'Exercise',
    practice: 'Walking',
    occurred_at: '2026-01-09T14:00:00',
    duration_minutes: 45,
    note: 'Afternoon walk with the dogs.',
    is_highlight: false,
  },
  {
    id: 903,
    type: 'life',
    occurred_at: '2026-01-09T16:00:00',
    duration_minutes: 60,
    note: 'Errands and groceries.',
    is_highlight: false,
  },
]

// Mock preparations by date
export const mockPreparations = {
  '2026-01-02': {
    id: 1,
    period_type: 'day',
    period_start: '2026-01-02',
    note: 'Focus on balance today - some habit work, some social time.',
    rest_day: false,
  },
  '2026-01-04': {
    id: 2,
    period_type: 'day',
    period_start: '2026-01-04',
    note: 'Moving day - no habit work expected.',
    rest_day: true,
  },
  '2026-01-06': {
    id: 3,
    period_type: 'day',
    period_start: '2026-01-06',
    note: 'Back to routine. Gym, reading, software work.',
    rest_day: false,
  },
}

// Mock closures by date
export const mockClosures = {
  '2026-01-02': {
    id: 1,
    scope: 'day',
    occurred_at: '2026-01-02T22:00:00',
    note: 'Solid balance of productivity and social time.',
  },
  '2026-01-04': {
    id: 2,
    scope: 'day',
    occurred_at: '2026-01-04T21:00:00',
    note: 'Moving done. Exhausted but settled.',
  },
}

// Helper to get practices for a specific habit
export function getPracticesForHabit(habitId) {
  return mockPractices.filter(p => p.habit_id === habitId && p.active)
}

// Helper to get active habits
export function getActiveHabits() {
  return mockHabits.filter(h => h.active)
}

// Helper to get entries for a specific date
export function getEntriesForDate(dateStr) {
  return mockEntries.filter(entry => {
    const entryDate = entry.occurred_at.split('T')[0]
    return entryDate === dateStr
  })
}

// Helper to format date as YYYY-MM-DD
export function formatDateKey(date) {
  return date.toISOString().split('T')[0]
}
