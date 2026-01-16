import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockPreparations } from '@/data/mockData'
import { useHabits } from '@/context/HabitsContext'
import { useEntries } from '@/context/EntriesContext'
import { getReflections, createReflection, deleteReflection } from '@/lib/api'
import { Star, Target, Lightbulb, Clock, Activity, AlertCircle, Coffee, Zap, PenLine, X, Trash2, Leaf } from 'lucide-react'
import RichTextEditor, { RichTextDisplay } from '@/components/ui/rich-text-editor'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import PeriodSelector, { getDateRange } from '@/components/shared/PeriodSelector'

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Calculate metrics for a date range
function calculatePeriodMetrics(entries, preparations, dateRange, activeHabits) {
  const periodEntries = entries.filter(entry => {
    const entryDate = new Date(entry.occurred_at)
    return entryDate >= dateRange.start && entryDate <= dateRange.end && !entry.archived_at
  })

  // Total minutes
  const totalMinutes = periodEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)

  // Habit breakdown
  const habitBreakdown = {}
  periodEntries.filter(e => e.type === 'habit').forEach(entry => {
    const habitName = entry.habit || 'Unknown'
    if (!habitBreakdown[habitName]) {
      habitBreakdown[habitName] = { minutes: 0, count: 0 }
    }
    habitBreakdown[habitName].minutes += entry.duration_minutes || 0
    habitBreakdown[habitName].count += 1
  })

  // Count by type
  const habitEntries = periodEntries.filter(e => e.type === 'habit').length
  const lifeEntries = periodEntries.filter(e => e.type === 'life').length
  const cautionEntries = periodEntries.filter(e => e.type === 'caution').length

  // Highlights
  const highlights = periodEntries.filter(e => e.is_highlight).length

  // Actions (count total actions logged across all entries)
  const totalActions = periodEntries.reduce((sum, e) => {
    return sum + (e.actions?.length || 0)
  }, 0)

  // Rest days (days with rest_day preparation)
  const restDays = Object.entries(preparations).filter(([dateKey, prep]) => {
    const prepDate = new Date(dateKey)
    return prepDate >= dateRange.start && prepDate <= dateRange.end && prep.rest_day
  }).length

  // Days with entries
  const daysWithEntries = new Set(
    periodEntries.map(e => e.occurred_at.split('T')[0])
  ).size

  // Total days in period
  const totalDays = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24)) + 1

  // Which active habits had no entries
  const habitsWithEntries = new Set(Object.keys(habitBreakdown))
  const missingHabits = activeHabits
    .filter(h => !habitsWithEntries.has(h.name))
    .map(h => h.name)

  // Dominant habit (if any is >50%)
  const habitMinutes = Object.values(habitBreakdown).reduce((sum, h) => sum + h.minutes, 0)
  let dominantHabit = null
  if (habitMinutes > 0) {
    const sorted = Object.entries(habitBreakdown).sort((a, b) => b[1].minutes - a[1].minutes)
    if (sorted.length > 0) {
      const topPercent = (sorted[0][1].minutes / habitMinutes) * 100
      if (topPercent >= 50) {
        dominantHabit = { name: sorted[0][0], percent: Math.round(topPercent) }
      }
    }
  }

  // Daily habit (logged every day)
  const dailyHabits = Object.entries(habitBreakdown)
    .filter(([name, data]) => data.count >= daysWithEntries && daysWithEntries >= 3)
    .map(([name]) => name)

  return {
    totalMinutes,
    totalHours: Math.round(totalMinutes / 60 * 10) / 10,
    habitBreakdown,
    habitEntries,
    lifeEntries,
    cautionEntries,
    highlights,
    totalActions,
    restDays,
    daysWithEntries,
    totalDays,
    missingHabits,
    dominantHabit,
    dailyHabits,
  }
}

// Generate reflection prompts based on period data
function generateReflectionPrompts(currentMetrics, previousMetrics, periodLabel) {
  const prompts = []

  // Dominant habit prompt
  if (currentMetrics.dominantHabit) {
    prompts.push({
      id: 'dominant',
      text: `${currentMetrics.dominantHabit.name} was ${currentMetrics.dominantHabit.percent}% of your time — how did that balance feel?`,
      type: 'balance',
    })
  }

  // Missing habits prompt
  if (currentMetrics.missingHabits.length === 1) {
    prompts.push({
      id: 'missing',
      text: `No ${currentMetrics.missingHabits[0]} this period — intentional rest?`,
      type: 'absence',
    })
  } else if (currentMetrics.missingHabits.length > 1) {
    prompts.push({
      id: 'missing',
      text: `${currentMetrics.missingHabits.join(' and ')} had no entries — was that intentional?`,
      type: 'absence',
    })
  }

  // Highlights prompt
  if (currentMetrics.highlights > 0) {
    prompts.push({
      id: 'highlights',
      text: currentMetrics.highlights === 1
        ? `You marked 1 highlight — what made it stand out?`
        : `You marked ${currentMetrics.highlights} highlights — what made them stand out?`,
      type: 'highlights',
    })
  }

  // Rest days prompt
  if (currentMetrics.restDays > 0) {
    prompts.push({
      id: 'rest',
      text: currentMetrics.restDays === 1
        ? `You took 1 rest day — how did it feel?`
        : `You took ${currentMetrics.restDays} rest days — how did they feel?`,
      type: 'rest',
    })
  }

  // Daily habit prompt
  if (currentMetrics.dailyHabits.length > 0) {
    const habitList = currentMetrics.dailyHabits.join(', ')
    prompts.push({
      id: 'daily',
      text: currentMetrics.dailyHabits.length === 1
        ? `You practiced ${habitList} consistently — what kept you going?`
        : `${habitList} showed up consistently — what kept you going?`,
      type: 'consistency',
    })
  }

  // Comparison prompt (if we have previous data)
  if (previousMetrics && previousMetrics.totalMinutes > 0) {
    const diff = currentMetrics.totalMinutes - previousMetrics.totalMinutes
    const percentChange = Math.abs(Math.round((diff / previousMetrics.totalMinutes) * 100))

    if (percentChange >= 25) {
      if (diff > 0) {
        prompts.push({
          id: 'comparison',
          text: `This was a fuller period than last (${currentMetrics.totalHours}hrs vs ${previousMetrics.totalHours}hrs) — what changed?`,
          type: 'comparison',
        })
      } else {
        prompts.push({
          id: 'comparison',
          text: `This was lighter than last period (${currentMetrics.totalHours}hrs vs ${previousMetrics.totalHours}hrs) — what changed?`,
          type: 'comparison',
        })
      }
    }
  }

  // Caution entries prompt
  if (currentMetrics.cautionEntries > 0) {
    prompts.push({
      id: 'caution',
      text: currentMetrics.cautionEntries === 1
        ? `You logged 1 caution — anything to learn from it?`
        : `You logged ${currentMetrics.cautionEntries} cautions — any patterns to notice?`,
      type: 'caution',
    })
  }

  // Limit to 3-4 most relevant prompts
  return prompts.slice(0, 4)
}

// Get previous period range for comparison
function getPreviousPeriodRange(timeRange, periodOffset) {
  return getDateRange(timeRange, periodOffset - 1)
}

// Get period label for reflections
function getPeriodLabel(timeRange, periodOffset) {
  const today = new Date()

  if (timeRange === 'month') {
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
    return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (timeRange === 'year') {
    return (today.getFullYear() + periodOffset).toString()
  }

  // Week view
  const dateRange = getDateRange(timeRange, periodOffset)
  const formatOpts = { month: 'short', day: 'numeric' }
  const year = dateRange.end.getFullYear()
  return `${dateRange.start.toLocaleDateString('en-US', formatOpts)} - ${dateRange.end.toLocaleDateString('en-US', formatOpts)}, ${year}`
}

export default function ReviewView() {
  const { targets, habits } = useHabits()
  const { entries: allEntries } = useEntries()
  const [timeRange, setTimeRange] = useState('week') // 'week' | 'month'
  const [periodOffset, setPeriodOffset] = useState(0)
  const [highlightFilter, setHighlightFilter] = useState('all')
  const [reflectionText, setReflectionText] = useState('')
  const [reflections, setReflections] = useState([])
  const [isLoadingReflections, setIsLoadingReflections] = useState(true)
  const [selectedTrigger, setSelectedTrigger] = useState(null)
  const [showAllReflections, setShowAllReflections] = useState(false)
  const reflectionFormRef = useRef(null)
  // selectedTrigger shape: { type: 'prompt'|'accomplishment'|'metric', id, label, value }

  // Start a reflection from a trigger (prompt, accomplishment, or metric)
  const startReflection = (trigger) => {
    setSelectedTrigger(trigger)
    // Scroll to the form
    setTimeout(() => {
      reflectionFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const dateRange = useMemo(() => getDateRange(timeRange, periodOffset), [timeRange, periodOffset])

  // Fetch reflections from API
  const fetchReflections = useCallback(async () => {
    try {
      setIsLoadingReflections(true)
      const data = await getReflections()
      setReflections(data)
    } catch (err) {
      console.error('Failed to fetch reflections:', err)
    } finally {
      setIsLoadingReflections(false)
    }
  }, [])

  useEffect(() => {
    fetchReflections()
  }, [fetchReflections])
  const previousDateRange = useMemo(() => getPreviousPeriodRange(timeRange, periodOffset), [timeRange, periodOffset])
  const periodLabel = useMemo(() => getPeriodLabel(timeRange, periodOffset), [timeRange, periodOffset])

  // Get active habits for missing habit detection
  const activeHabits = useMemo(() => habits.filter(h => h.active), [habits])

  // Calculate metrics for current and previous periods
  const currentMetrics = useMemo(() => {
    return calculatePeriodMetrics(allEntries, mockPreparations, dateRange, activeHabits)
  }, [dateRange, activeHabits])

  const previousMetrics = useMemo(() => {
    if (!previousDateRange) return null
    return calculatePeriodMetrics(allEntries, mockPreparations, previousDateRange, activeHabits)
  }, [previousDateRange, activeHabits])

  // Generate reflection prompts
  const reflectionPrompts = useMemo(() => {
    return generateReflectionPrompts(currentMetrics, previousMetrics, periodLabel)
  }, [currentMetrics, previousMetrics, periodLabel])

  // Get highlighted entries within the date range, filtered by type
  const highlights = useMemo(() => {
    return allEntries
      .filter(entry => {
        if (!entry.is_highlight) return false
        const entryDate = new Date(entry.occurred_at)
        const inRange = entryDate >= dateRange.start && entryDate <= dateRange.end
        if (!inRange) return false

        // Apply type filter
        if (highlightFilter === 'all') return true
        return entry.type === highlightFilter
      })
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
  }, [dateRange, highlightFilter])

  // Get completed targets (done status, not archived) within the date range
  const completedTargets = useMemo(() => {
    return targets.filter(t => {
      if (t.status !== 'done') return false
      // If target has a done_at date, filter by period
      if (t.done_at) {
        const doneDate = new Date(t.done_at)
        return doneDate >= dateRange.start && doneDate <= dateRange.end
      }
      // If no done_at, include it (legacy data)
      return true
    })
  }, [targets, dateRange])

  // Filter reflections within the date range
  const pastReflections = useMemo(() => {
    return reflections
      .filter(r => {
        const refDate = new Date(r.created_at)
        return refDate >= dateRange.start && refDate <= dateRange.end
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [reflections, dateRange])

  // Get habit name for an entry
  const getHabitName = (entry) => {
    if (entry.type === 'life') return 'Life Event'
    if (entry.type === 'caution') return 'Caution Behavior'
    if (entry.habit) return entry.habit
    const habit = habits.find(h => h.id === entry.habit_id)
    return habit?.name || 'Unknown'
  }

  // Helper to format date as YYYY-MM-DD
  const formatDateKey = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Save a new reflection
  const handleSaveReflection = async () => {
    if (!reflectionText.trim()) return

    // Extract entry_id or target_id from trigger
    let entry_id = null
    let target_id = null
    let trigger_label = null
    let trigger_value = null
    let reflectionType = timeRange === 'week' ? 'weekly' : 'monthly'

    if (selectedTrigger) {
      // Always save the trigger label and value for display
      trigger_label = selectedTrigger.label
      trigger_value = selectedTrigger.value

      // Only set foreign key IDs for highlights/targets if they exist in our data
      if (selectedTrigger.id?.startsWith('highlight-')) {
        const entryIdNum = parseInt(selectedTrigger.id.replace('highlight-', ''), 10)
        // Verify the entry exists before setting foreign key
        const entryExists = allEntries.some(e => e.id === entryIdNum)
        if (entryExists) {
          entry_id = entryIdNum
          reflectionType = 'entry'
        }
      } else if (selectedTrigger.id?.startsWith('target-')) {
        const targetIdNum = parseInt(selectedTrigger.id.replace('target-', ''), 10)
        // Verify the target exists before setting foreign key
        const targetExists = targets.some(t => t.id === targetIdNum)
        if (targetExists) {
          target_id = targetIdNum
          reflectionType = 'target'
        }
      }
    }

    try {
      const saved = await createReflection({
        type: reflectionType,
        period_start: formatDateKey(dateRange.start),
        period_end: formatDateKey(dateRange.end),
        note: reflectionText.trim(),
        entry_id,
        target_id,
        trigger_label,
        trigger_value,
      })
      setReflections(prev => [saved, ...prev])
      setReflectionText('')
      setSelectedTrigger(null)
    } catch (err) {
      console.error('Failed to save reflection:', err)
    }
  }

  // Delete a reflection
  const handleDeleteReflection = async (id) => {
    try {
      await deleteReflection(id)
      setReflections(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete reflection:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review</h1>
        <p className="text-muted-foreground">Reflect on what happened</p>
      </div>

      {/* Period Selector */}
      <PeriodSelector
        timeRange={timeRange}
        periodOffset={periodOffset}
        onTimeRangeChange={setTimeRange}
        onPeriodOffsetChange={setPeriodOffset}
      />

      {/* Contextual Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Period Summary</CardTitle>
          <p className="text-sm text-muted-foreground">
            What happened during {periodLabel}
          </p>
        </CardHeader>
        <CardContent>
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-md bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{currentMetrics.totalHours}h</p>
                <p className="text-xs text-muted-foreground">Total time</p>
              </div>
              <button
                onClick={() => startReflection({
                  type: 'metric',
                  id: 'metric-total-time',
                  label: 'Total Time',
                  value: `${currentMetrics.totalHours} hours this period`,
                })}
                className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reflect on this"
              >
                <PenLine className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{currentMetrics.habitEntries}</p>
                <p className="text-xs text-muted-foreground">Habit sessions</p>
              </div>
              <button
                onClick={() => startReflection({
                  type: 'metric',
                  id: 'metric-habit-sessions',
                  label: 'Habit Sessions',
                  value: `${currentMetrics.habitEntries} habit sessions this period`,
                })}
                className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reflect on this"
              >
                <PenLine className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-md bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{currentMetrics.cautionEntries}</p>
                <p className="text-xs text-muted-foreground">Cautions</p>
              </div>
              <button
                onClick={() => startReflection({
                  type: 'metric',
                  id: 'metric-cautions',
                  label: 'Cautions',
                  value: `${currentMetrics.cautionEntries} caution${currentMetrics.cautionEntries !== 1 ? 's' : ''} logged this period`,
                })}
                className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reflect on this"
              >
                <PenLine className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-md bg-violet-500/10">
                <Zap className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{currentMetrics.totalActions}</p>
                <p className="text-xs text-muted-foreground">Actions</p>
              </div>
              <button
                onClick={() => startReflection({
                  type: 'metric',
                  id: 'metric-actions',
                  label: 'Actions',
                  value: `${currentMetrics.totalActions} action${currentMetrics.totalActions !== 1 ? 's' : ''} completed this period`,
                })}
                className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reflect on this"
              >
                <PenLine className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="p-2 rounded-md bg-muted">
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">{currentMetrics.restDays}</p>
                <p className="text-xs text-muted-foreground">Rest days</p>
              </div>
              <button
                onClick={() => startReflection({
                  type: 'metric',
                  id: 'metric-rest-days',
                  label: 'Rest Days',
                  value: `${currentMetrics.restDays} rest day${currentMetrics.restDays !== 1 ? 's' : ''} this period`,
                })}
                className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Reflect on this"
              >
                <PenLine className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Habit Breakdown */}
          {Object.keys(currentMetrics.habitBreakdown).length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium mb-3">Time by Habit</h4>
                <div className="space-y-2">
                  {Object.entries(currentMetrics.habitBreakdown)
                    .sort((a, b) => b[1].minutes - a[1].minutes)
                    .slice(0, 5)
                    .map(([habitName, data]) => {
                      const habit = habits.find(h => h.name === habitName)
                      const percent = Math.round((data.minutes / currentMetrics.totalMinutes) * 100)
                      const hours = Math.floor(data.minutes / 60)
                      const mins = data.minutes % 60
                      const timeStr = hours > 0
                        ? mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
                        : `${mins}m`

                      return (
                        <div key={habitName} className="flex items-center gap-3 group">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{habitName}</span>
                              <span className="text-xs text-muted-foreground">
                                {timeStr} · {data.count} {data.count === 1 ? 'session' : 'sessions'}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/60 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">
                            {percent}%
                          </span>
                          <button
                            onClick={() => startReflection({
                              type: 'metric',
                              id: `habit-${habitName}`,
                              label: 'Habit Time',
                              value: `${habitName}: ${timeStr} (${percent}%)`,
                            })}
                            className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Reflect on this"
                          >
                            <PenLine className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                </div>
              </div>
            </>
          )}

          {/* Comparison to Previous Period */}
          {previousMetrics && previousMetrics.totalMinutes > 0 && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm group">
                <span className="text-muted-foreground">vs. previous period</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const diff = currentMetrics.totalMinutes - previousMetrics.totalMinutes
                    const percentChange = Math.round((diff / previousMetrics.totalMinutes) * 100)
                    const isUp = diff > 0

                    return (
                      <>
                        <span className={isUp ? 'text-green-600' : 'text-amber-600'}>
                          {isUp ? '+' : ''}{percentChange}% ({isUp ? '+' : ''}{Math.round(diff / 60)}h)
                        </span>
                        <button
                          onClick={() => startReflection({
                            type: 'metric',
                            id: 'metric-comparison',
                            label: 'Period Comparison',
                            value: `${isUp ? '+' : ''}${percentChange}% vs. previous (${currentMetrics.totalHours}h vs ${previousMetrics.totalHours}h)`,
                          })}
                          className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Reflect on this"
                        >
                          <PenLine className="h-4 w-4" />
                        </button>
                      </>
                    )
                  })()}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Accomplishments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accomplishments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Highlighted moments and completed targets
          </p>
          <div className="pt-2">
            <ToggleGroup
              type="single"
              value={highlightFilter}
              onValueChange={(value) => value && setHighlightFilter(value)}
              className="justify-start"
            >
              <ToggleGroupItem value="all" size="sm" className="text-xs px-3">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="habit" size="sm" className="text-xs px-3">
                Habits
              </ToggleGroupItem>
              <ToggleGroupItem value="life" size="sm" className="text-xs px-3">
                Life
              </ToggleGroupItem>
              <ToggleGroupItem value="caution" size="sm" className="text-xs px-3">
                Caution
              </ToggleGroupItem>
              <ToggleGroupItem value="target" size="sm" className="text-xs px-3">
                Targets
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const showTargets = highlightFilter === 'all' || highlightFilter === 'target'
            const showHighlights = highlightFilter !== 'target'
            const hasContent = (showHighlights && highlights.length > 0) || (showTargets && completedTargets.length > 0)

            if (!hasContent) {
              return (
                <p className="text-sm text-muted-foreground py-2">
                  {highlightFilter === 'all'
                    ? 'No highlights or completed targets for this period.'
                    : highlightFilter === 'target'
                    ? 'No completed targets for this period.'
                    : `No ${highlightFilter} highlights for this period.`}
                </p>
              )
            }

            return (
            <>
              {/* Highlighted entries */}
              {showHighlights && highlights.map(entry => {
                const habitName = getHabitName(entry)
                // Get icon and color based on entry type
                const getTypeIcon = () => {
                  switch (entry.type) {
                    case 'habit':
                      return <Activity className="h-4 w-4 text-blue-500" />
                    case 'life':
                      return <Leaf className="h-4 w-4 text-emerald-500" />
                    case 'caution':
                      return <AlertCircle className="h-4 w-4 text-orange-500" />
                    default:
                      return <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  }
                }
                return (
                  <div key={entry.id} className="flex items-start gap-3 py-2 group">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTypeIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {habitName}
                        </Badge>
                        {entry.practice && (
                          <span className="text-xs text-muted-foreground">
                            {entry.practice}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{entry.note || 'No note'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(entry.occurred_at)}
                        {entry.duration_minutes && ` · ${entry.duration_minutes}min`}
                      </p>
                    </div>
                    <button
                      onClick={() => startReflection({
                        type: 'accomplishment',
                        id: `highlight-${entry.id}`,
                        label: 'Highlight',
                        value: entry.practice ? `${habitName} · ${entry.practice}` : habitName,
                      })}
                      className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Reflect on this"
                    >
                      <PenLine className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}

              {/* Completed targets */}
              {showTargets && completedTargets.map(target => (
                <div key={target.id} className="flex items-start gap-3 py-2 group">
                  <div className="flex-shrink-0 mt-0.5">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Target Completed
                      </Badge>
                    </div>
                    <p className="text-sm">{target.name}</p>
                  </div>
                  <button
                    onClick={() => startReflection({
                      type: 'accomplishment',
                      id: `target-${target.id}`,
                      label: 'Target Completed',
                      value: target.name,
                    })}
                    className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Reflect on this"
                  >
                    <PenLine className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </>
            )
          })()}
        </CardContent>
      </Card>

      {/* Reflection Prompts */}
      {reflectionPrompts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Things to think about
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on what happened this period
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {reflectionPrompts.map(prompt => (
              <div
                key={prompt.id}
                className="flex items-start justify-between gap-3 py-2 px-3 rounded-md bg-muted/50 group"
              >
                <span className="text-sm text-foreground">{prompt.text}</span>
                <button
                  onClick={() => startReflection({
                    type: 'prompt',
                    id: `prompt-${prompt.id}`,
                    label: 'Prompt',
                    value: prompt.text,
                  })}
                  className="text-muted-foreground hover:text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Reflect on this"
                >
                  <PenLine className="h-4 w-4" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* New Reflection */}
      <Card ref={reflectionFormRef} className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Write a Reflection</CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedTrigger
              ? 'Reflecting on something specific'
              : 'What patterns do you notice? What does this period mean to you?'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show selected trigger if any */}
          {selectedTrigger && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-muted border border-border">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-muted-foreground">{selectedTrigger.label}</span>
                <p className="text-sm font-medium mt-0.5">{selectedTrigger.value}</p>
              </div>
              <button
                onClick={() => setSelectedTrigger(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <RichTextEditor
            value={reflectionText}
            onChange={setReflectionText}
            placeholder={selectedTrigger
              ? 'What do you think about this?'
              : 'Take a moment to reflect on what happened during this period...'}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              For: {periodLabel}
            </span>
            <Button
              size="sm"
              onClick={handleSaveReflection}
              disabled={!reflectionText.trim()}
            >
              Save Reflection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Past Reflections */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Past Reflections</CardTitle>
          {pastReflections.length > 5 && (
            <button
              onClick={() => setShowAllReflections(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              View all ({pastReflections.length})
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {pastReflections.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No reflections for this period yet.
            </p>
          ) : (
            pastReflections.slice(0, 5).map(reflection => {
              // Use saved trigger fields first, fall back to derived values for legacy data
              const triggerLabel = reflection.trigger_label || (
                reflection.entry_id ? 'Highlight' :
                reflection.habit_id ? 'Habit' :
                reflection.target_id ? 'Target' : null
              )
              const triggerValue = reflection.trigger_value || (
                reflection.entry_habit_name ?
                  `${reflection.entry_habit_name}${reflection.entry_note ? ` · ${reflection.entry_note}` : ''}` :
                  reflection.habit_name || reflection.target_name || null
              )

              // Generate period label - avoid redundant "Jan 2 - Jan 2"
              let reflectionPeriod
              if (reflection.period_start && reflection.period_end) {
                const startStr = formatDate(reflection.period_start)
                const endStr = formatDate(reflection.period_end)
                reflectionPeriod = startStr === endStr ? startStr : `${startStr} – ${endStr}`
              } else {
                reflectionPeriod = formatDate(reflection.created_at)
              }

              return (
                <div
                  key={reflection.id}
                  className="group p-4 rounded-xl bg-muted dark:bg-muted/40"
                >
                  {/* Date and delete */}
                  <div className="flex items-center justify-between mb-3">
                    <time className="text-xs font-semibold text-foreground/60">{reflectionPeriod}</time>
                    <button
                      onClick={() => handleDeleteReflection(reflection.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete reflection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Trigger - accent left border style */}
                  {(triggerLabel || triggerValue) && (
                    <div className="mb-4 pl-3 border-l-2 border-primary/50">
                      {triggerLabel && (
                        <div className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-0.5">{triggerLabel}</div>
                      )}
                      {triggerValue && (
                        <div className="text-sm text-foreground/80">{triggerValue}</div>
                      )}
                    </div>
                  )}

                  {/* Reflection content */}
                  <RichTextDisplay
                    content={reflection.note}
                    className="text-[15px] leading-relaxed"
                  />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* All Reflections Modal */}
      <Dialog open={showAllReflections} onOpenChange={setShowAllReflections}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>All Reflections ({pastReflections.length})</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {pastReflections.map(reflection => {
              const triggerLabel = reflection.trigger_label || (
                reflection.entry_id ? 'Highlight' :
                reflection.habit_id ? 'Habit' :
                reflection.target_id ? 'Target' : null
              )
              const triggerValue = reflection.trigger_value || (
                reflection.entry_habit_name ?
                  `${reflection.entry_habit_name}${reflection.entry_note ? ` · ${reflection.entry_note}` : ''}` :
                  reflection.habit_name || reflection.target_name || null
              )

              let reflectionPeriod
              if (reflection.period_start && reflection.period_end) {
                const startStr = formatDate(reflection.period_start)
                const endStr = formatDate(reflection.period_end)
                reflectionPeriod = startStr === endStr ? startStr : `${startStr} – ${endStr}`
              } else {
                reflectionPeriod = formatDate(reflection.created_at)
              }

              return (
                <div
                  key={reflection.id}
                  className="group p-4 rounded-xl bg-muted dark:bg-muted/40"
                >
                  <div className="flex items-center justify-between mb-3">
                    <time className="text-xs font-semibold text-foreground/60">{reflectionPeriod}</time>
                    <button
                      onClick={() => handleDeleteReflection(reflection.id)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete reflection"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {(triggerLabel || triggerValue) && (
                    <div className="mb-4 pl-3 border-l-2 border-primary/50">
                      {triggerLabel && (
                        <div className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-0.5">{triggerLabel}</div>
                      )}
                      {triggerValue && (
                        <div className="text-sm text-foreground/80">{triggerValue}</div>
                      )}
                    </div>
                  )}

                  <RichTextDisplay
                    content={reflection.note}
                    className="text-[15px] leading-relaxed"
                  />
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
