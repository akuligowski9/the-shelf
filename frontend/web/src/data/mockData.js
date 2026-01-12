// Mock data for development - mirrors expected API structure

export const mockHabits = [
  { id: 1, name: 'Software', active: true, target_minutes: 120, color: 'dusk' },
  { id: 2, name: 'Spanish', active: true, target_minutes: 30, color: 'coral' },
  { id: 3, name: 'Exercise', active: true, target_minutes: 60, color: 'forest' },
  { id: 4, name: 'Dog Training', active: true, target_minutes: 30, color: 'lavender' },
  { id: 5, name: 'Reading', active: false, target_minutes: 30, color: 'sienna' },
]

// Warm-up and cool-down templates per habit
export const mockWarmUpTemplates = [
  {
    id: 1,
    habit_id: 1,
    name: 'PM Assist Invocation',
    content: `## Permission Page — Authorship, Not Performance

I learned to survive by being careful with language.
That skill kept me safe once.
It does not need to run my life now.

This work is not a performance.
It is an expression.

I am allowed to:
- Be partial
- Be dated
- Know only a slice
- Stop at clarity, not completion

This artifact does not define my worth.
It defines a moment in my thinking.

---

## Orientation

For this session:
- My job is not to impress
- My job is to externalize one thought
- Stopping is allowed
- Being responsible enough is okay

{{last_session_note}}`,
    has_dynamic_elements: true,
    active: true,
  },
  {
    id: 2,
    habit_id: 1,
    name: 'Quick Focus',
    content: `What's the one thing I want to accomplish this session?

Time-box: How long am I committing to?

What does "done enough" look like?`,
    has_dynamic_elements: false,
    active: true,
  },
  {
    id: 3,
    habit_id: 3,
    name: 'Movement Check-in',
    content: `How is my body feeling right now?

What needs attention today?

Am I doing this for energy, recovery, or maintenance?`,
    has_dynamic_elements: false,
    active: true,
  },
]

export const mockCoolDownTemplates = [
  {
    id: 1,
    habit_id: 1,
    name: 'Session Closure',
    content: `## Freeze Point

What did I accomplish?

What's the next concrete step?

## Stopping Clean

- [ ] Code committed or stashed
- [ ] Notes captured
- [ ] Context saved for next time

Am I stopping because I'm done, or because it's time?`,
    has_dynamic_elements: false,
    active: true,
  },
  {
    id: 2,
    habit_id: 3,
    name: 'Movement Debrief',
    content: `How do I feel after?

Anything to note for recovery?

What worked well?`,
    has_dynamic_elements: false,
    active: true,
  },
]

// Helper to get warm-up templates for a habit
export function getWarmUpTemplatesForHabit(habitId) {
  return mockWarmUpTemplates.filter(t => t.habit_id === habitId && t.active)
}

// Helper to get cool-down templates for a habit
export function getCoolDownTemplatesForHabit(habitId) {
  return mockCoolDownTemplates.filter(t => t.habit_id === habitId && t.active)
}

export const mockPractices = [
  // Software
  { id: 1, habit_id: 1, name: 'Personal Project Development', active: true, details: null },
  { id: 2, habit_id: 1, name: 'Architecture Planning', active: true, details: null },
  { id: 3, habit_id: 1, name: 'Open Source', active: true, details: null },
  // Spanish
  { id: 4, habit_id: 2, name: 'Textbook Learning', active: true, details: null },
  { id: 5, habit_id: 2, name: 'Conversation', active: true, details: null },
  // Exercise
  { id: 6, habit_id: 3, name: 'Walking', active: true, details: null },
  { id: 7, habit_id: 3, name: 'Outdoor Walking', active: true, details: null },
  { id: 8, habit_id: 3, name: 'Gym', active: true, details: null },
  { id: 9, habit_id: 3, name: 'Corrective Exercises', active: true, details: null },
  { id: 15, habit_id: 3, name: 'Legs Workout', active: true, details: null },
  { id: 16, habit_id: 3, name: 'Upper Body', active: true, details: null },
  // Dog Training
  { id: 10, habit_id: 4, name: 'Walk Training', active: true, details: null },
  { id: 11, habit_id: 4, name: 'Loose-Leash Drills', active: true, details: null },
  { id: 12, habit_id: 4, name: 'Miscellaneous Care', active: true, details: null },
  // Reading
  { id: 13, habit_id: 5, name: 'Books', active: true, details: null },
  { id: 14, habit_id: 5, name: 'Articles', active: true, details: null },
]

// Scheduled practices - links practices to specific dates
export const mockScheduledPractices = [
  // Example: { id: 1, practice_id: 15, date: '2026-01-13' }
]

// Behaviors/actions per practice (checkboxes for what you did)
export const mockBehaviors = [
  // Software - Personal Project Development
  { id: 1, practice_id: 1, name: 'Feature implementation', active: true },
  { id: 2, practice_id: 1, name: 'Bug fixes', active: true },
  { id: 3, practice_id: 1, name: 'Code review', active: true },
  { id: 4, practice_id: 1, name: 'Testing', active: true },
  // Software - Architecture Planning
  { id: 5, practice_id: 2, name: 'System design', active: true },
  { id: 6, practice_id: 2, name: 'Documentation', active: true },
  { id: 7, practice_id: 2, name: 'Tech spec writing', active: true },
  // Spanish - Textbook Learning
  { id: 8, practice_id: 4, name: 'Vocabulary', active: true },
  { id: 9, practice_id: 4, name: 'Grammar exercises', active: true },
  { id: 10, practice_id: 4, name: 'Reading practice', active: true },
  { id: 11, practice_id: 4, name: 'Flashcards', active: true },
  // Spanish - Conversation
  { id: 12, practice_id: 5, name: 'Speaking practice', active: true },
  { id: 13, practice_id: 5, name: 'Listening practice', active: true },
  // Exercise - Legs Workout
  { id: 14, practice_id: 15, name: 'Squats', active: true },
  { id: 15, practice_id: 15, name: 'Lunges', active: true },
  { id: 16, practice_id: 15, name: 'Leg Press', active: true },
  { id: 17, practice_id: 15, name: 'Calf Raises', active: true },
  { id: 18, practice_id: 15, name: 'Leg Curls', active: true },
  // Exercise - Upper Body
  { id: 19, practice_id: 16, name: 'Bench Press', active: true },
  { id: 20, practice_id: 16, name: 'Shoulder Press', active: true },
  { id: 21, practice_id: 16, name: 'Pull-ups', active: true },
  { id: 22, practice_id: 16, name: 'Rows', active: true },
  { id: 23, practice_id: 16, name: 'Bicep Curls', active: true },
  // Exercise - Corrective Exercises
  { id: 24, practice_id: 9, name: 'Hip stretches', active: true },
  { id: 25, practice_id: 9, name: 'Mobility work', active: true },
  { id: 26, practice_id: 9, name: 'Foam rolling', active: true },
  // Dog Training - Loose-Leash Drills
  { id: 27, practice_id: 11, name: 'Calm exits', active: true },
  { id: 28, practice_id: 11, name: 'Leash tension awareness', active: true },
  { id: 29, practice_id: 11, name: 'Greetings practice', active: true },
  { id: 30, practice_id: 11, name: 'Direction changes', active: true },
]

// Helper to get behaviors for a specific practice
export function getBehaviorsForPractice(practiceId) {
  return mockBehaviors.filter(b => b.practice_id === practiceId && b.active)
}

export const mockTargets = [
  // Active
  { id: 1, name: 'The Shelf', status: 'active', habit_id: 1 },
  { id: 4, name: 'Daily Walking Habit', status: 'active', habit_id: 3 },
  // Planned
  { id: 2, name: 'Spanish B1 Certification', status: 'planned', habit_id: 2 },
  { id: 5, name: 'Read 12 Books in 2026', status: 'planned', habit_id: 5 },
  { id: 6, name: 'Marathon Training', status: 'planned', habit_id: 3 },
  // Parked
  { id: 3, name: 'Home Renovation Ideas', status: 'parked', habit_id: null },
  { id: 7, name: 'Learn Guitar', status: 'parked', habit_id: null },
  // Completed
  { id: 8, name: 'Set Up Dev Environment', status: 'completed', habit_id: 1, done_at: '2026-01-03' },
  { id: 9, name: '30-Day Spanish Streak', status: 'completed', habit_id: 2, done_at: '2025-12-15' },
  { id: 10, name: 'ShelfView MVP', status: 'completed', habit_id: 1, done_at: '2026-01-08' },
  { id: 11, name: 'Gym 3x This Week', status: 'completed', habit_id: 3, done_at: '2026-01-10' },
]

// Entries from multiple days (based on actual log data)
// habit_id: 1=Software, 2=Spanish, 3=Exercise, 4=Dog Training, 5=Reading
export const mockEntries = [
  // Jan 1
  {
    id: 101,
    type: 'habit',
    habit: 'Spanish',
    habit_id: 2,
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
    habit_id: 1,
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
    habit_id: 3,
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
    habit_id: 4,
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
    habit_id: 2,
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
    habit_id: 3,
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
    habit_id: 1,
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
    habit_id: 4,
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
    habit_id: 3,
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
    habit_id: 1,
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
    habit_id: 3,
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
    habit_id: 5,
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
    habit_id: 3,
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
    habit_id: 1,
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
    habit_id: 1,
    practice: 'Personal Project Development',
    occurred_at: '2026-01-07T10:00:00',
    duration_minutes: 180,
    note: 'Frontend development for The Shelf.',
    is_highlight: true,
    warm_up_template_id: 2,
    warm_up_note: 'Goal: Finish the basic layout for ShelfView.',
    cool_down_note: 'Layout done. Tomorrow: add interactivity and data binding.',
  },
  {
    id: 702,
    type: 'habit',
    habit: 'Exercise',
    habit_id: 3,
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
    habit_id: 1,
    practice: 'Personal Project Development',
    occurred_at: '2026-01-08T09:00:00',
    duration_minutes: 240,
    note: 'Full day of coding on The Shelf frontend with Claude.',
    is_highlight: true,
    warm_up_template_id: 1,
    warm_up_note: 'Big session today. Focus on TodayView and entry forms.',
    cool_down_note: 'Great progress. Entry forms working. Next: warm-up/cool-down dialogs.',
  },
  {
    id: 802,
    type: 'habit',
    habit: 'Dog Training',
    habit_id: 4,
    practice: 'Walk Training',
    occurred_at: '2026-01-08T15:00:00',
    duration_minutes: 30,
    note: 'Quick training session.',
    is_highlight: false,
  },
  // Jan 9
  {
    id: 901,
    type: 'habit',
    habit: 'Software',
    habit_id: 1,
    practice: 'Architecture Planning',
    occurred_at: '2026-01-09T10:00:00',
    duration_minutes: 90,
    note: 'Worked on The Shelf frontend planning.',
    is_highlight: true,
    warm_up_template_id: 1,
    warm_up_note: 'Focus on the warm-up/cool-down feature redesign. Time-box to 90 minutes.',
    cool_down_note: 'Got the spec updated. Next: update the React components.',
  },
  {
    id: 902,
    type: 'habit',
    habit: 'Exercise',
    habit_id: 3,
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
  // Jan 10
  {
    id: 1001,
    type: 'habit',
    habit: 'Spanish',
    habit_id: 2,
    practice: 'Textbook Learning',
    occurred_at: '2026-01-10T09:00:00',
    duration_minutes: 45,
    note: 'Grammar review and new vocabulary.',
    is_highlight: false,
  },
  {
    id: 1002,
    type: 'habit',
    habit: 'Software',
    habit_id: 1,
    practice: 'Personal Project Development',
    occurred_at: '2026-01-10T10:00:00',
    duration_minutes: 150,
    note: 'Building the calendar component for AttentionView.',
    is_highlight: true,
    warm_up_template_id: 2,
    warm_up_note: 'Focus on AttentionView calendar. Time-box to 2.5 hours.',
    cool_down_note: 'Calendar working. Need to add target timeline bars next.',
  },
  {
    id: 1003,
    type: 'habit',
    habit: 'Exercise',
    habit_id: 3,
    practice: 'Gym',
    occurred_at: '2026-01-10T14:00:00',
    duration_minutes: 75,
    note: 'Upper body workout.',
    is_highlight: false,
    warm_up_template_id: 3,
    warm_up_note: 'Focus on shoulders and back today. Take it easy on wrists.',
    cool_down_note: 'Good session. Increased weight on rows. Stretch tomorrow.',
  },
  {
    id: 1004,
    type: 'habit',
    habit: 'Dog Training',
    habit_id: 4,
    practice: 'Loose-Leash Drills',
    occurred_at: '2026-01-10T16:00:00',
    duration_minutes: 30,
    note: 'Evening walk practice.',
    is_highlight: false,
  },
  // Jan 11 (today)
  {
    id: 1101,
    type: 'habit',
    habit: 'Software',
    habit_id: 1,
    practice: 'Personal Project Development',
    occurred_at: '2026-01-11T09:00:00',
    duration_minutes: 180,
    note: 'Working on AttentionView calendar improvements.',
    is_highlight: true,
    warm_up_template_id: 1,
    warm_up_note: 'Continue calendar work. Add target bars and activity dots.',
  },
  {
    id: 1102,
    type: 'habit',
    habit: 'Exercise',
    habit_id: 3,
    practice: 'Walking',
    occurred_at: '2026-01-11T12:30:00',
    duration_minutes: 45,
    note: 'Midday walk break.',
    is_highlight: false,
  },
  {
    id: 1103,
    type: 'habit',
    habit: 'Spanish',
    habit_id: 2,
    practice: 'Conversation',
    occurred_at: '2026-01-11T14:00:00',
    duration_minutes: 30,
    note: 'Speaking practice with language partner.',
    is_highlight: false,
  },
]

// Mock day preparations by date (day-level framing only)
export const mockPreparations = {
  '2026-01-02': {
    id: 1,
    occurred_at: '2026-01-02T08:00:00',
    note: 'Focus on balance today - some habit work, some social time.',
    rest_day: false,
  },
  '2026-01-04': {
    id: 2,
    occurred_at: '2026-01-04T09:00:00',
    note: 'Moving day - no habit work expected.',
    rest_day: true,
  },
  '2026-01-05': {
    id: 9,
    occurred_at: '2026-01-05T08:30:00',
    note: 'Sunday reset. Light day - walk, some software planning, groceries.',
    rest_day: false,
  },
  '2026-01-06': {
    id: 3,
    occurred_at: '2026-01-06T07:30:00',
    note: 'Back to routine. Gym, reading, software work.',
    rest_day: false,
  },
  '2026-01-07': {
    id: 4,
    occurred_at: '2026-01-07T08:00:00',
    note: 'Deep work day. Focus on The Shelf frontend.',
    rest_day: false,
  },
  '2026-01-08': {
    id: 5,
    occurred_at: '2026-01-08T07:30:00',
    note: 'Full coding day planned. Maybe squeeze in dog training.',
    rest_day: false,
  },
  '2026-01-09': {
    id: 6,
    occurred_at: '2026-01-09T08:00:00',
    note: 'Architecture planning session. Keep it focused.',
    rest_day: false,
  },
  '2026-01-10': {
    id: 7,
    occurred_at: '2026-01-10T07:45:00',
    note: 'Balance day - Spanish, software, gym, dog training.',
    rest_day: false,
  },
  '2026-01-11': {
    id: 8,
    occurred_at: '2026-01-11T08:00:00',
    note: 'Continue calendar work. Spanish conversation today.',
    rest_day: false,
  },
}

// Mock reflections for Review page
export const mockReflections = [
  {
    id: 1,
    type: 'weekly',
    period_start: '2026-01-01',
    period_end: '2026-01-07',
    period_label: 'Jan 1-7, 2026',
    note: 'Good balance this week. Started The Shelf project with intention. Moving day disrupted the routine but I accepted it and got back on track.',
    created_at: '2026-01-07T20:00:00',
  },
  {
    id: 2,
    type: 'habit',
    habit_id: 1,
    period_start: '2026-01-05',
    period_end: '2026-01-11',
    period_label: 'Software - Week of Jan 5',
    note: 'Great momentum on The Shelf. ShelfView MVP done, now working on AttentionView. The warm-up rituals are helping me focus.',
    created_at: '2026-01-10T21:00:00',
  },
  {
    id: 3,
    type: 'monthly',
    period_start: '2025-12-01',
    period_end: '2025-12-31',
    period_label: 'December 2025',
    note: 'December was about finishing up the year well. Spanish streak completed. Looking forward to diving into The Shelf in January.',
    created_at: '2025-12-31T20:00:00',
  },
]

// Mock day closures by date (day-level ending only)
export const mockClosures = {
  '2026-01-02': {
    id: 1,
    occurred_at: '2026-01-02T22:00:00',
    note: 'Solid balance of productivity and social time.',
  },
  '2026-01-04': {
    id: 2,
    occurred_at: '2026-01-04T21:00:00',
    note: 'Moving done. Exhausted but settled.',
  },
  '2026-01-05': {
    id: 7,
    occurred_at: '2026-01-05T20:00:00',
    note: 'Quiet Sunday. Good planning session.',
  },
  '2026-01-06': {
    id: 8,
    occurred_at: '2026-01-06T21:00:00',
    note: 'Back in the groove. All habits touched.',
  },
  '2026-01-07': {
    id: 3,
    occurred_at: '2026-01-07T21:30:00',
    note: 'Good deep work session. ShelfView layout is coming together.',
  },
  '2026-01-08': {
    id: 4,
    occurred_at: '2026-01-08T22:00:00',
    note: 'Marathon coding day. Entry forms are functional now.',
  },
  '2026-01-09': {
    id: 5,
    occurred_at: '2026-01-09T20:30:00',
    note: 'Shorter day but productive. Spec is updated.',
  },
  '2026-01-10': {
    id: 6,
    occurred_at: '2026-01-10T21:00:00',
    note: 'Great balance day. Hit all four habits plus gym.',
  },
}

// Transitions - structural changes to habits (entering/exiting transition windows)
export const mockTransitions = [
  {
    id: 1,
    started_at: '2025-11-15T10:00:00',
    ended_at: '2025-11-15T10:30:00',
    note: 'Added Reading habit, set initial target to 30 min/day',
  },
  {
    id: 2,
    started_at: '2025-12-20T14:00:00',
    ended_at: '2025-12-20T14:15:00',
    note: 'Paused Reading habit for holidays, will resume in January',
  },
  {
    id: 3,
    started_at: '2026-01-05T09:00:00',
    ended_at: '2026-01-05T09:20:00',
    note: 'Added Dog Training habit after getting new puppy',
  },
]

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

// Helper to format date as YYYY-MM-DD in EST timezone
export function formatDateKey(date) {
  const estDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const year = estDate.getFullYear()
  const month = String(estDate.getMonth() + 1).padStart(2, '0')
  const day = String(estDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to get current hour in EST (for time-based features)
export function getESTHour() {
  const estDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }))
  return estDate.getHours()
}

// Helper to get last session for a habit (for dynamic warm-up elements)
export function getLastSessionForHabit(habitName, beforeDate = null) {
  const entries = mockEntries
    .filter(e => e.type === 'habit' && e.habit === habitName && !e.archived_at)
    .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))

  if (beforeDate) {
    return entries.find(e => new Date(e.occurred_at) < new Date(beforeDate))
  }
  return entries[0] || null
}

// Helper to render warm-up template with dynamic elements
export function renderWarmUpTemplate(template, habitName, currentDate) {
  if (!template.has_dynamic_elements) {
    return template.content
  }

  let content = template.content
  const lastSession = getLastSessionForHabit(habitName, currentDate)

  if (lastSession) {
    const lastSessionInfo = `**Last session:** ${lastSession.note || 'No notes'}${lastSession.cool_down_note ? `\n\n**Next steps from last time:** ${lastSession.cool_down_note}` : ''}`
    content = content.replace('{{last_session_note}}', lastSessionInfo)
  } else {
    content = content.replace('{{last_session_note}}', '*No previous sessions found.*')
  }

  return content
}
