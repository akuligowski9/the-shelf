import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, X, Plus, Calendar } from 'lucide-react'
import { getHabitColorHsl, colorPalette } from '@/lib/colors'
import { RichTextDisplay } from '@/components/ui/rich-text-editor'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Status colors matching ShelfView
const STATUS_COLORS = {
  active: 'bg-[hsl(140,25%,35%)]',    // Forest green
  planned: 'bg-[hsl(210,60%,50%)]',   // Sky blue
}

export default function AttentionCalendar({
  targets = [],
  entries = [],
  habits = [],
  practices = [],
  scheduledPractices = [],
  onSchedulePractice,
  onUnschedulePractice,
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('schedule') // 'targets', 'habits', or 'schedule'
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedPracticeId, setSelectedPracticeId] = useState('')

  const { year, month, daysInMonth, startDay, today } = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const firstDay = new Date(y, m, 1)
    const lastDay = new Date(y, m + 1, 0)
    const now = new Date()

    return {
      year: y,
      month: m,
      daysInMonth: lastDay.getDate(),
      startDay: firstDay.getDay(),
      today: now.getFullYear() === y && now.getMonth() === m ? now.getDate() : null,
    }
  }, [currentDate])

  // Get targets grouped by day and status
  const targetsByDay = useMemo(() => {
    const days = new Map()

    // For now, active targets span all days, planned targets too
    // In future, use start_date/end_date
    const activeTargets = targets.filter(t => t.status === 'active')
    const plannedTargets = targets.filter(t => t.status === 'planned')

    for (let d = 1; d <= daysInMonth; d++) {
      days.set(d, {
        active: activeTargets,
        planned: plannedTargets,
      })
    }

    return days
  }, [targets, daysInMonth])

  // Get entries grouped by day for habits view
  const entriesByDay = useMemo(() => {
    const days = new Map()

    entries.forEach(entry => {
      if (entry.type !== 'habit' || !entry.occurred_at) return

      const entryDate = new Date(entry.occurred_at)
      if (entryDate.getFullYear() !== year || entryDate.getMonth() !== month) return

      const day = entryDate.getDate()
      if (!days.has(day)) days.set(day, [])
      days.get(day).push(entry)
    })

    return days
  }, [entries, year, month])

  // Get scheduled practices grouped by day
  const scheduledByDay = useMemo(() => {
    const days = new Map()

    scheduledPractices.forEach(sp => {
      const [spYear, spMonth, spDay] = sp.date.split('-').map(Number)
      if (spYear !== year || spMonth - 1 !== month) return

      if (!days.has(spDay)) days.set(spDay, [])
      const practice = practices.find(p => p.id === sp.practice_id)
      if (practice) {
        const habit = habits.find(h => h.id === practice.habit_id)
        days.get(spDay).push({
          ...sp,
          practice,
          habit,
        })
      }
    })

    return days
  }, [scheduledPractices, practices, habits, year, month])

  // Format date as YYYY-MM-DD
  const formatDateStr = (day) => {
    const m = String(month + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${year}-${m}-${d}`
  }

  // Handle scheduling a practice
  const handleSchedule = () => {
    if (selectedDay && selectedPracticeId && onSchedulePractice) {
      onSchedulePractice(Number(selectedPracticeId), [formatDateStr(selectedDay)])
      setSelectedPracticeId('')
    }
  }

  // Handle removing a scheduled practice
  const handleUnschedule = (scheduledId) => {
    if (onUnschedulePractice) {
      onUnschedulePractice(scheduledId)
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Build calendar grid
  const weeks = useMemo(() => {
    const result = []
    let week = []

    for (let i = 0; i < startDay; i++) {
      week.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day)
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null)
      }
      result.push(week)
    }

    return result
  }, [startDay, daysInMonth])

  // Render small corner dots for a day cell in targets view
  const renderTargetDots = (day) => {
    const dayTargets = targetsByDay.get(day)
    if (!dayTargets) return null

    const { active, planned } = dayTargets
    const hasActive = active.length > 0
    const hasPlanned = planned.length > 0

    if (!hasActive && !hasPlanned) return null

    return (
      <div className="absolute top-1 right-1 flex flex-col gap-0.5">
        {hasActive && (
          <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.active}`} />
        )}
        {hasPlanned && (
          <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.planned}`} />
        )}
      </div>
    )
  }

  // Render mini pie chart for a day cell in habits view
  const renderHabitsPie = (day) => {
    const dayEntries = entriesByDay.get(day)
    if (!dayEntries || dayEntries.length === 0) return null

    // Calculate total time per habit
    const habitTimes = {}
    let totalMinutes = 0

    dayEntries.forEach(entry => {
      const minutes = entry.duration_minutes || 0
      if (minutes > 0 && entry.habit_id) {
        habitTimes[entry.habit_id] = (habitTimes[entry.habit_id] || 0) + minutes
        totalMinutes += minutes
      }
    })

    if (totalMinutes === 0) return null

    // Build pie segments as a conic gradient
    const segments = []
    let currentAngle = 0

    // Build habit breakdown for tooltip
    const habitBreakdown = []

    Object.entries(habitTimes).forEach(([habitId, minutes]) => {
      const habit = habits.find(h => h.id === parseInt(habitId))
      const colorKey = habit?.color || 'sage'
      const hslValue = getHabitColorHsl(colorKey)
      const percentage = (minutes / totalMinutes) * 100
      const nextAngle = currentAngle + (percentage * 3.6) // 360deg / 100%

      segments.push(`hsl(${hslValue}) ${currentAngle}deg ${nextAngle}deg`)
      currentAngle = nextAngle

      // Add to breakdown
      habitBreakdown.push({
        name: habit?.name || 'Unknown',
        minutes,
        hslValue,
      })
    })

    const gradient = `conic-gradient(${segments.join(', ')})`

    // Format time for tooltip
    const formatTime = (mins) => {
      if (mins < 60) return `${mins}m`
      const hours = Math.floor(mins / 60)
      const remainingMins = mins % 60
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
    }

    return {
      gradient,
      totalMinutes,
      habitBreakdown,
      formatTime,
    }
  }

  // Render day cell content for habits view
  const renderHabitsDayContent = (day) => {
    const pieData = renderHabitsPie(day)
    if (!pieData) return null

    const { gradient, totalMinutes, habitBreakdown, formatTime } = pieData

    return (
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 group z-20">
        <div
          className="w-6 h-6 rounded-sm cursor-pointer"
          style={{ background: gradient }}
        />
        {/* CSS tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-popover text-popover-foreground border border-border rounded-md shadow-md p-2 whitespace-nowrap">
            <div className="font-medium text-xs border-b border-border pb-1 mb-1">
              {formatTime(totalMinutes)} total
            </div>
            {habitBreakdown.map(({ name, minutes, hslValue }) => (
              <div key={name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-sm flex-shrink-0"
                  style={{ background: `hsl(${hslValue})` }}
                />
                <span>{name}</span>
                <span className="text-muted-foreground ml-auto pl-2">{formatTime(minutes)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Calendar</CardTitle>
            {/* View toggle */}
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                onClick={() => { setViewMode('schedule'); setSelectedDay(null) }}
                className={`px-2 py-0.5 text-xs transition-colors ${
                  viewMode === 'schedule'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => { setViewMode('targets'); setSelectedDay(null) }}
                className={`px-2 py-0.5 text-xs transition-colors ${
                  viewMode === 'targets'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Targets
              </button>
              <button
                onClick={() => { setViewMode('habits'); setSelectedDay(null) }}
                className={`px-2 py-0.5 text-xs transition-colors ${
                  viewMode === 'habits'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Habits
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={goToToday}
              className="text-sm font-medium px-2 hover:text-primary"
            >
              {MONTHS[month]} {year}
            </button>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px">
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const isToday = day === today
              const isSelected = day === selectedDay
              const dayTargets = day ? targetsByDay.get(day) : null
              const hasActive = dayTargets?.active?.length > 0
              const hasPlanned = dayTargets?.planned?.length > 0
              const dayScheduled = day ? scheduledByDay.get(day) : null
              const hasScheduled = dayScheduled?.length > 0

              // Determine day number color based on view
              const getDayColor = () => {
                if (viewMode === 'targets') {
                  if (hasActive) return 'text-[hsl(140,25%,35%)] font-semibold'
                  if (hasPlanned) return 'text-[hsl(210,60%,50%)] font-medium'
                }
                if (viewMode === 'schedule' && hasScheduled) {
                  // Use the color of the first scheduled practice's habit
                  const firstHabit = dayScheduled[0]?.habit
                  if (firstHabit?.color) {
                    const color = colorPalette[firstHabit.color]
                    if (color) return `${color.text} font-semibold`
                  }
                  return 'text-primary font-semibold'
                }
                return ''
              }

              const handleDayClick = () => {
                if (!day) return
                if (viewMode === 'targets' && (hasActive || hasPlanned)) {
                  setSelectedDay(selectedDay === day ? null : day)
                }
                if (viewMode === 'schedule') {
                  setSelectedDay(selectedDay === day ? null : day)
                  setSelectedPracticeId('')
                }
              }

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  onClick={handleDayClick}
                  className={`
                    aspect-square flex items-center justify-center text-sm relative
                    ${day ? 'hover:bg-muted/50 cursor-pointer rounded' : ''}
                    ${isToday ? 'bg-primary/10 rounded' : ''}
                    ${isSelected ? 'ring-2 ring-primary/50 rounded' : ''}
                    ${day && !isToday ? 'text-muted-foreground' : ''}
                  `}
                >
                  {day && (
                    <>
                      <span className={`relative z-10 ${getDayColor()} ${isToday ? 'text-primary font-medium' : ''}`}>
                        {day}
                      </span>
                      {viewMode === 'habits' && renderHabitsDayContent(day)}
                    </>
                  )}
                </div>
              )
            })
          ))}
        </div>

        {/* Selected day details - Targets view */}
        {viewMode === 'targets' && selectedDay && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {MONTHS[month]} {selectedDay}
              </span>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {targetsByDay.get(selectedDay)?.active?.map(target => (
                <div key={target.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.active}`} />
                  <span>{target.name}</span>
                </div>
              ))}
              {targetsByDay.get(selectedDay)?.planned?.map(target => (
                <div key={target.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS.planned}`} />
                  <span className="text-muted-foreground">{target.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected day details - Schedule view */}
        {viewMode === 'schedule' && selectedDay && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {MONTHS[month]} {selectedDay}
              </span>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scheduled practices for this day */}
            {scheduledByDay.get(selectedDay)?.length > 0 && (
              <div className="space-y-2 mb-4">
                {scheduledByDay.get(selectedDay).map(({ id, practice, habit }) => {
                  const habitColor = habit?.color ? colorPalette[habit.color] : null
                  return (
                    <div key={id} className="border border-border rounded-md p-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {habitColor && (
                            <div className={`w-2 h-2 rounded-full ${habitColor.dot}`} />
                          )}
                          <span className="text-sm font-medium">{practice.name}</span>
                        </div>
                        <button
                          onClick={() => handleUnschedule(id)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                      {habit && (
                        <span className="text-xs text-muted-foreground">{habit.name}</span>
                      )}
                      {practice.details && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <RichTextDisplay content={practice.details} className="text-sm" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add practice to this day */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Add practice to this day</label>
              <div className="flex gap-2">
                <Select value={selectedPracticeId} onValueChange={setSelectedPracticeId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a practice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {habits.filter(h => h.active).map(habit => {
                      const habitPractices = practices.filter(p => p.habit_id === habit.id && p.active)
                      if (habitPractices.length === 0) return null
                      return (
                        <div key={habit.id}>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                            {habit.name}
                          </div>
                          {habitPractices.map(practice => (
                            <SelectItem key={practice.id} value={practice.id.toString()}>
                              {practice.name}
                            </SelectItem>
                          ))}
                        </div>
                      )
                    })}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleSchedule}
                  disabled={!selectedPracticeId}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule view hint when no day selected */}
        {viewMode === 'schedule' && !selectedDay && (
          <div className="text-center mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Click a day to schedule practices
            </span>
          </div>
        )}

        {/* Legend */}
        {viewMode === 'targets' && !selectedDay && (
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[hsl(140,25%,35%)] font-semibold">12</span>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[hsl(210,60%,50%)] font-medium">12</span>
              <span className="text-xs text-muted-foreground">Planned</span>
            </div>
          </div>
        )}

        {viewMode === 'habits' && entries.length === 0 && (
          <div className="text-center mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Pie charts will show time distribution when entries exist
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
