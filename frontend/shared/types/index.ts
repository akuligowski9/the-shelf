// Types for The Shelf

export interface Habit {
  id: number
  name: string
  color: string
  active: boolean
  type?: 'habit' | 'caution'
  target_minutes?: number
  track_actions?: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Practice {
  id: number
  habit_id: number
  name: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Action {
  id: number
  practice_id: number
  name: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Target {
  id: number
  name: string
  description: string | null
  status: 'active' | 'planned' | 'parked' | 'completed' | 'archived'
  habit_id?: number | null
  start_date?: string | null
  end_date?: string | null
  planned_duration?: string | null
  notes?: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Entry {
  id: number
  date: string
  type: 'habit' | 'life' | 'caution'
  habit_id: number | null
  habit?: Habit
  habit_name?: string
  practice_id: number | null
  practice?: Practice
  practice_name?: string
  duration_minutes: number | null
  note: string | null
  target_id: number | null
  target?: Target
  actions: number[] | null
  is_highlight?: boolean
  occurred_at?: string
  archived_at?: string | null
  created_at: string
  updated_at: string
}

export interface HabitTransition {
  id: number
  habit_id: number
  from: string
  to: string
  started_at: string
  ended_at: string
  habit?: Habit
}

export interface Preparation {
  id: number
  period_type: 'day' | 'week' | 'month'
  period_start: string
  occurred_at: string
  note: string | null
  rest_day: boolean
  created_at: string
  updated_at: string
}

export interface Closure {
  id: number
  scope: 'day' | 'week' | 'month'
  date: string
  occurred_at: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface Reflection {
  id: number
  reflection_type: 'day' | 'weekly' | 'monthly' | 'habit' | 'entry' | 'target' | 'adhoc'
  period_start: string | null
  period_end: string | null
  habit_id: number | null
  target_id: number | null
  entry_id: number | null
  note: string | null
  trigger_label: string | null
  trigger_value: string | null
  created_at: string
  updated_at: string
}

export interface Setting {
  key: string
  value: any
}

export interface Prompt {
  id: number
  habit_id: number
  type: 'warmup' | 'cooldown'
  content: string
  sort_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CautionBehavior {
  id: number
  name: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface DayStats {
  totalMinutes: number
  habitMinutes: number
  lifeMinutes: number
  cautionCount: number
  entriesCount: number
}

export interface WeeklyMetrics {
  habitMinutes: number
  lifeMinutes: number
  cautionCount: number
  restDays: number
  transitionsCount: number
}
