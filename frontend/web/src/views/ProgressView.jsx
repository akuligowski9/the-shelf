import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useHabits } from '@/context/HabitsContext'
import { getPreparationsInRange, getClosuresInRange, getReflections, getMetricsForRange } from '@/lib/api'
import { colorPalette } from '@/lib/colors'

// Info tooltip helper component
function InfoTip({ text }) {
  return (
    <TooltipUI>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help inline ml-1" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{text}</p>
      </TooltipContent>
    </TooltipUI>
  )
}

// Custom chart tooltip component for bar charts (shows all items)
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  // Check if this is year view (has dateRange)
  const dateRange = payload[0]?.payload?.dateRange

  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 shadow-lg">
      <p className="text-card-foreground font-medium mb-1">
        {dateRange || label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {entry.value} hrs
        </p>
      ))}
    </div>
  )
}

// Custom tooltip for line charts (shows only hovered line)
function LineTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  // Find the entry being hovered (first one with value > 0, or just first)
  const entry = payload[0]
  const dateRange = entry?.payload?.dateRange

  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 shadow-lg">
      <p className="text-card-foreground font-medium mb-1">
        {dateRange || label}
      </p>
      <p style={{ color: entry.color }} className="text-sm">
        {entry.name}: {entry.value} hrs
      </p>
    </div>
  )
}

// Convert HSL CSS variable format to actual HSL string for Recharts
// CSS vars are in format "h s% l%" without the hsl() wrapper
function getChartColor(colorKey) {
  const colorMap = {
    // Map color keys to actual HSL values (from index.css light mode)
    sage: 'hsl(110, 25%, 45%)',
    forest: 'hsl(145, 35%, 32%)',
    teal: 'hsl(175, 40%, 38%)',
    ocean: 'hsl(200, 45%, 40%)',
    sky: 'hsl(210, 35%, 52%)',
    dusk: 'hsl(235, 30%, 45%)',
    lavender: 'hsl(270, 30%, 52%)',
    plum: 'hsl(295, 30%, 42%)',
    orchid: 'hsl(330, 35%, 50%)',
    berry: 'hsl(345, 40%, 45%)',
    rose: 'hsl(355, 35%, 52%)',
    coral: 'hsl(12, 50%, 55%)',
    sienna: 'hsl(18, 45%, 42%)',
    copper: 'hsl(30, 50%, 45%)',
    marigold: 'hsl(45, 55%, 48%)',
  }
  return colorMap[colorKey] || 'hsl(200, 45%, 48%)'
}

// Fixed colors for non-habit entries
const lifeColor = 'hsl(200, 45%, 48%)'
const cautionColor = 'hsl(20, 50%, 48%)'

// Get week key for a date (for weekly aggregation)
function getWeekKey(dateStr) {
  const date = new Date(dateStr + 'T12:00:00')
  const jan1 = new Date(date.getFullYear(), 0, 1)
  const weekNum = Math.ceil((((date - jan1) / 86400000) + jan1.getDay() + 1) / 7)
  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
}

export default function ProgressView() {
  const { habits, targets } = useHabits()
  const [viewMode, setViewMode] = useState('balance') // 'balance' | 'patterns'
  const [timeRange, setTimeRange] = useState('week') // 'week' | 'month' | 'year'
  const [periodOffset, setPeriodOffset] = useState(0) // 0 = current, -1 = previous, etc.
  const [enabledFilters, setEnabledFilters] = useState(
    () => new Set([...habits.map(h => h.name), 'Life'])
  )
  const [selectedHabit, setSelectedHabit] = useState(habits[0]?.name || null)

  // API data
  const [preparations, setPreparations] = useState([])
  const [closures, setClosures] = useState([])
  const [reflections, setReflections] = useState([])
  const [serverMetrics, setServerMetrics] = useState(null)
  const [metricsLoading, setMetricsLoading] = useState(false)

  // Fetch preparations, closures, and reflections from API (one-time)
  useEffect(() => {
    const from = '2020-01-01'
    const to = new Date().toISOString().split('T')[0]

    getPreparationsInRange('day', from, to)
      .then(preps => setPreparations(preps))
      .catch(() => setPreparations([]))

    getClosuresInRange('day', from, to)
      .then(cls => setClosures(cls))
      .catch(() => setClosures([]))

    getReflections()
      .then(refs => setReflections(refs))
      .catch(() => setReflections([]))
  }, [])

  // Reset offset when changing time range
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange)
    setPeriodOffset(0)
  }

  // Helper to format date as YYYY-MM-DD without timezone issues
  const formatDate = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get date range based on selection and offset
  const dateRange = useMemo(() => {
    const today = new Date()
    const dates = []

    if (timeRange === 'week') {
      // Calendar week: Sunday through Saturday
      // Find the Sunday of the current week
      const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay + (periodOffset * 7))

      // Generate 7 days starting from Sunday
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i)
        dates.push(formatDate(date))
      }
    } else if (timeRange === 'month') {
      // Calendar month (1st to last day)
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
      const year = targetMonth.getFullYear()
      const month = targetMonth.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()

      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month, day)
        dates.push(formatDate(date))
      }
    } else {
      // Calendar year (Jan 1 to Dec 31)
      const targetYear = today.getFullYear() + periodOffset

      for (let month = 0; month < 12; month++) {
        const lastDay = new Date(targetYear, month + 1, 0).getDate()
        for (let day = 1; day <= lastDay; day++) {
          dates.push(formatDate(new Date(targetYear, month, day)))
        }
      }
    }
    return dates
  }, [timeRange, periodOffset])

  // Get period label for display
  const periodLabel = useMemo(() => {
    const today = new Date()

    if (timeRange === 'month') {
      // Show month and year (e.g., "January 2026")
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
      return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    if (timeRange === 'year') {
      // Show actual year (e.g., "2026", "2025")
      return (today.getFullYear() + periodOffset).toString()
    }

    // Week view - always show date range with year
    const startDate = new Date(dateRange[0] + 'T12:00:00')
    const endDate = new Date(dateRange[dateRange.length - 1] + 'T12:00:00')
    const formatOpts = { month: 'short', day: 'numeric' }
    const year = endDate.getFullYear()
    return `${startDate.toLocaleDateString('en-US', formatOpts)} - ${endDate.toLocaleDateString('en-US', formatOpts)}, ${year}`
  }, [timeRange, periodOffset, dateRange])

  // Fetch server metrics when date range changes
  useEffect(() => {
    if (dateRange.length === 0) return

    const startDate = dateRange[0]
    // End date needs to be exclusive (day after last day in range)
    const lastDate = new Date(dateRange[dateRange.length - 1] + 'T12:00:00')
    lastDate.setDate(lastDate.getDate() + 1)
    const endDate = formatDate(lastDate)

    setMetricsLoading(true)
    getMetricsForRange(startDate, endDate)
      .then(metrics => {
        setServerMetrics(metrics)
      })
      .catch(err => {
        console.error('Failed to load metrics:', err)
        setServerMetrics(null)
      })
      .finally(() => {
        setMetricsLoading(false)
      })
  }, [dateRange])

  // Process server metrics into chart data
  const chartData = useMemo(() => {
    if (!serverMetrics || !serverMetrics.daily) return []

    // Build habit ID to name map from server response
    const habitIdToName = new Map(serverMetrics.habits.map(h => [h.id, h.name]))

    // For year view, aggregate by week instead of by day
    if (timeRange === 'year') {
      const dataByWeek = {}
      const weekDates = {}

      // Initialize weeks from dateRange
      dateRange.forEach(date => {
        const weekKey = getWeekKey(date)
        if (!dataByWeek[weekKey]) {
          dataByWeek[weekKey] = { date: weekKey, life: 0, caution: 0 }
          weekDates[weekKey] = []
          habits.forEach(habit => {
            dataByWeek[weekKey][habit.name] = 0
          })
        }
        weekDates[weekKey].push(date)
      })

      // Add week labels
      Object.keys(dataByWeek).forEach((weekKey, index) => {
        const dates = weekDates[weekKey].sort()
        const startDate = new Date(dates[0] + 'T12:00:00')
        const endDate = new Date(dates[dates.length - 1] + 'T12:00:00')
        const formatOpts = { month: 'short', day: 'numeric' }
        dataByWeek[weekKey].dateLabel = (index + 1).toString()
        dataByWeek[weekKey].dateRange = `${startDate.toLocaleDateString('en-US', formatOpts)} - ${endDate.toLocaleDateString('en-US', formatOpts)}`
      })

      // Aggregate server daily data into weeks
      serverMetrics.daily.forEach(day => {
        const weekKey = getWeekKey(day.date)
        if (!dataByWeek[weekKey]) return

        // Add habit minutes
        if (day.habits) {
          Object.entries(day.habits).forEach(([habitId, data]) => {
            const habitName = habitIdToName.get(Number(habitId))
            if (habitName && dataByWeek[weekKey][habitName] !== undefined) {
              dataByWeek[weekKey][habitName] += data.minutes || 0
            }
          })
        }
        // Life entries - use actual minutes from server
        dataByWeek[weekKey].life += day.life || 0
        dataByWeek[weekKey].caution += day.caution || 0
      })

      // Convert minutes to hours
      return Object.values(dataByWeek).map(week => {
        const converted = { date: week.date, dateLabel: week.dateLabel, dateRange: week.dateRange, caution: week.caution }
        habits.forEach(habit => {
          converted[habit.name] = Math.round((week[habit.name] || 0) / 60 * 10) / 10
        })
        converted.life = Math.round((week.life || 0) / 60 * 10) / 10
        return converted
      })
    }

    // For week/month view, keep daily granularity
    const dataByDate = {}

    // Initialize all dates with zeros
    dateRange.forEach(date => {
      dataByDate[date] = { date, dateLabel: formatDateLabel(date, timeRange), life: 0, caution: 0 }
      habits.forEach(habit => {
        dataByDate[date][habit.name] = 0
      })
    })

    // Fill in data from server metrics
    serverMetrics.daily.forEach(day => {
      if (!dataByDate[day.date]) return

      // Add habit minutes
      if (day.habits) {
        Object.entries(day.habits).forEach(([habitId, data]) => {
          const habitName = habitIdToName.get(Number(habitId))
          if (habitName && dataByDate[day.date][habitName] !== undefined) {
            dataByDate[day.date][habitName] = data.minutes || 0
          }
        })
      }
      // Life entries - use actual minutes from server
      dataByDate[day.date].life = day.life || 0
      dataByDate[day.date].caution = day.caution || 0
    })

    // Convert minutes to hours
    return Object.values(dataByDate).map(day => {
      const converted = { date: day.date, dateLabel: day.dateLabel, caution: day.caution }
      habits.forEach(habit => {
        converted[habit.name] = Math.round((day[habit.name] || 0) / 60 * 10) / 10
      })
      converted.life = Math.round((day.life || 0) / 60 * 10) / 10
      return converted
    })
  }, [dateRange, habits, timeRange, serverMetrics])

  // Calculate summary stats (filtered by enabledFilters)
  const stats = useMemo(() => {
    // Get enabled habits (filter out Life, that's handled separately)
    const enabledHabitNames = new Set(
      [...enabledFilters].filter(f => f !== 'Life')
    )
    const includeLife = enabledFilters.has('Life')

    // Use server metrics for totals when available
    const totals = serverMetrics?.totals || {}
    const serverHabits = serverMetrics?.habits || []

    // Calculate filtered totals from server data
    const enabledHabitIds = new Set(
      serverHabits.filter(h => enabledHabitNames.has(h.name)).map(h => h.id)
    )

    // Habit entries from enabled habits only
    const habitEntries = serverHabits
      .filter(h => enabledHabitIds.has(h.id))
      .reduce((sum, h) => sum + (h.sessions || 0), 0)

    const lifeEntries = includeLife ? (totals.life_entries || 0) : 0
    const cautionEntries = totals.caution_entries || 0
    const totalEntries = habitEntries + lifeEntries + cautionEntries

    // Days with entries - count unique days in daily data
    const daysWithEntries = serverMetrics?.daily?.filter(d =>
      Object.keys(d.habits || {}).some(hid => enabledHabitIds.has(Number(hid))) ||
      (includeLife && d.life > 0)
    ).length || 0

    // Rest days from server
    const restDays = totals.rest_days || 0

    // Total hours based on enabled filters only (from chartData which is already processed)
    const totalHours = chartData.reduce((acc, day) => {
      const dayHours = habits
        .filter(h => enabledHabitNames.has(h.name))
        .reduce((sum, h) => sum + (day[h.name] || 0), 0) + (includeLife ? day.life : 0)
      return acc + dayHours
    }, 0)

    // Balance metrics
    const avgEntriesPerDay = daysWithEntries > 0 ? (totalEntries / daysWithEntries).toFixed(1) : 0
    const avgHoursPerDay = daysWithEntries > 0 ? (totalHours / daysWithEntries).toFixed(1) : 0

    // Count unique enabled habits per day from server data
    const habitsByDay = {}
    serverMetrics?.daily?.forEach(d => {
      if (d.habits) {
        const enabledHabitsOnDay = Object.keys(d.habits).filter(hid => enabledHabitIds.has(Number(hid)))
        if (enabledHabitsOnDay.length > 0) {
          habitsByDay[d.date] = enabledHabitsOnDay.length
        }
      }
    })
    const daysWithHabits = Object.keys(habitsByDay).length
    const totalUniqueHabitsPerDay = Object.values(habitsByDay).reduce((acc, count) => acc + count, 0)
    const avgHabitsPerDay = daysWithHabits > 0 ? (totalUniqueHabitsPerDay / daysWithHabits).toFixed(1) : 0

    // Patterns metrics
    const datesInRange = new Set(dateRange)
    const totalDaysInRange = dateRange.length
    const prepsInRange = preparations.filter(p => datesInRange.has(p.period_start)).length
    const closuresInRange = closures.filter(c => datesInRange.has(c.occurred_at?.split('T')[0])).length
    const prepRate = totalDaysInRange > 0 ? Math.round((prepsInRange / totalDaysInRange) * 100) : 0
    const closureRate = totalDaysInRange > 0 ? Math.round((closuresInRange / totalDaysInRange) * 100) : 0

    // Session rituals - not available from server metrics, would need entries
    const warmUpRate = 0
    const coolDownRate = 0

    // Highlights from server
    const highlights = totals.highlights?.total || 0

    // Completed targets in range
    const completedTargetsInRange = targets.filter(t => {
      if (t.status !== 'completed' || !t.done_at) return false
      return dateRange.includes(t.done_at)
    }).length

    // Total completed targets (all time)
    const totalCompletedTargets = targets.filter(t => t.status === 'completed').length

    // Reflections in range
    const reflectionsInRange = reflections.filter(r => {
      const reflectionDate = r.created_at?.split('T')[0]
      return reflectionDate && dateRange.includes(reflectionDate)
    }).length

    // Habit coverage from server data
    const habitCoverage = serverHabits
      .filter(h => enabledHabitNames.has(h.name))
      .map(habit => {
        const coveragePercent = daysWithEntries > 0 ? Math.round((habit.days_touched / daysWithEntries) * 100) : 0
        return { name: habit.name, color: habit.color, coverage: coveragePercent }
      })

    // Previous period comparison - simplified (would need separate API call for full comparison)
    const currentHours = totalHours
    const periodOverPeriodChange = 0 // Would need separate API call for previous period

    // Day of Week distribution from server daily data
    const dayOfWeekDist = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    serverMetrics?.daily?.forEach(d => {
      const dayOfWeek = new Date(d.date + 'T12:00:00').getDay()
      // Sum minutes from enabled habits
      if (d.habits) {
        Object.entries(d.habits).forEach(([habitId, data]) => {
          if (enabledHabitIds.has(Number(habitId))) {
            dayOfWeekDist[dayOfWeek] += (data.minutes || 0) / 60
          }
        })
      }
      // Add life time if included (use actual minutes from server)
      if (includeLife && d.life) {
        dayOfWeekDist[dayOfWeek] += (d.life || 0) / 60
      }
    })
    const dayOfWeekData = dayNames.map((name, i) => ({
      day: name,
      hours: Math.round(dayOfWeekDist[i] * 10) / 10,
    }))

    // Balance: Life vs Habit time split (filtered)
    const habitHours = chartData.reduce((acc, day) => {
      return acc + habits
        .filter(h => enabledHabitNames.has(h.name))
        .reduce((sum, h) => sum + (day[h.name] || 0), 0)
    }, 0)
    const lifeHours = includeLife ? chartData.reduce((acc, day) => acc + (day.life || 0), 0) : 0
    const habitPercent = totalHours > 0 ? Math.round((habitHours / totalHours) * 100) : 0
    const lifePercent = totalHours > 0 ? Math.round((lifeHours / totalHours) * 100) : 0

    // Balance: Most and least logged habits (filtered)
    const habitTotals = habits
      .filter(h => enabledHabitNames.has(h.name))
      .map(habit => {
        const hours = chartData.reduce((acc, day) => acc + (day[habit.name] || 0), 0)
        return { name: habit.name, color: habit.color, hours: Math.round(hours * 10) / 10 }
      })
    const sortedByHours = [...habitTotals].sort((a, b) => b.hours - a.hours)
    const mostLoggedHabit = sortedByHours[0] || null
    const habitsWithTime = sortedByHours.filter(h => h.hours > 0)
    const leastLoggedHabit = habitsWithTime.length > 1 ? habitsWithTime[habitsWithTime.length - 1] : null

    // Balance: Active days percentage
    const activeDaysPercent = totalDaysInRange > 0 ? Math.round((daysWithEntries / totalDaysInRange) * 100) : 0

    // Balance: Neglected habits (enabled habits with 0 time this period)
    const neglectedHabits = habitTotals.filter(h => h.hours === 0)

    // Balance: Trend vs previous period (simplified - no previous period data without separate API call)
    const balanceTrend = habits
      .filter(h => enabledHabitNames.has(h.name))
      .map(habit => {
        const currentPercent = totalHours > 0 ? (habitTotals.find(h => h.name === habit.name)?.hours || 0) / totalHours * 100 : 0
        return { name: habit.name, color: habit.color, currentPercent: Math.round(currentPercent), change: 0 }
      }).filter(h => h.currentPercent > 0)

    const lifeTrend = includeLife ? {
      name: 'Life',
      currentPercent: lifePercent,
      change: 0
    } : null

    // Transition metrics (transitions table was removed, using local state from context if available)
    const transitionsInRange = 0
    const daysSinceLastTransition = null

    return {
      // Shared
      totalEntries,
      restDays,
      totalHours,
      daysWithEntries,
      totalDaysInRange,
      // Balance
      habitEntries,
      lifeEntries,
      cautionEntries,
      avgEntriesPerDay,
      avgHoursPerDay,
      avgHabitsPerDay,
      habitPercent,
      lifePercent,
      mostLoggedHabit,
      leastLoggedHabit,
      activeDaysPercent,
      neglectedHabits,
      balanceTrend,
      lifeTrend,
      transitionsInRange,
      daysSinceLastTransition,
      // Patterns
      prepRate,
      closureRate,
      warmUpRate,
      coolDownRate,
      highlights,
      habitCoverage,
      periodOverPeriodChange,
      dayOfWeekData,
      // Accomplishments
      completedTargetsInRange,
      totalCompletedTargets,
      reflectionsInRange,
    }
  }, [chartData, dateRange, habits, timeRange, periodOffset, enabledFilters, preparations, closures, reflections, targets, serverMetrics])

  // Habit-specific patterns from server metrics
  const habitPatterns = useMemo(() => {
    if (!selectedHabit || !serverMetrics) return null

    // Find the habit in server metrics
    const habitData = serverMetrics.habits?.find(h => h.name === selectedHabit)
    if (!habitData) return null

    // Sessions and hours in current range from server data
    const sessionsInRange = habitData.sessions || 0
    const hoursInRange = (habitData.minutes || 0) / 60

    // Average session length
    const avgSessionLength = sessionsInRange > 0 ? Math.round(habitData.minutes / sessionsInRange) : 0

    // Days since last session and other historical data not available without individual entries
    // These would need additional API support
    const daysSinceLast = null
    const longestGap = null
    const totalSessions = sessionsInRange // Only have current range data

    return {
      avgSessionLength,
      daysSinceLast,
      longestGap,
      totalSessions,
      sessionsInRange,
      hoursInRange: Math.round(hoursInRange * 10) / 10,
    }
  }, [selectedHabit, serverMetrics])

  // Toggle a filter
  const toggleFilter = (filterName) => {
    setEnabledFilters(prev => {
      const next = new Set(prev)
      if (next.has(filterName)) {
        next.delete(filterName)
      } else {
        next.add(filterName)
      }
      return next
    })
  }

  // Filter data for patterns view (chartData is already in hours)
  const patternsData = useMemo(() => {
    return chartData.map(day => {
      const result = { date: day.date, dateLabel: day.dateLabel }
      habits.forEach(habit => {
        if (enabledFilters.has(habit.name)) {
          result[habit.name] = day[habit.name] || 0
        }
      })
      // Include Life in patterns
      if (enabledFilters.has('Life')) {
        result['Life'] = day.life || 0
      }
      return result
    })
  }, [chartData, habits, enabledFilters])

  return (
    <TooltipProvider>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Progress</h1>
        <p className="text-muted-foreground">See where your attention went</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'balance' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('balance')}
        >
          Balance
        </Button>
        <Button
          variant={viewMode === 'patterns' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('patterns')}
        >
          Patterns
        </Button>
      </div>

      {/* Time Range */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            {/* Period navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPeriodOffset(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                {periodLabel}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPeriodOffset(prev => Math.min(prev + 1, 0))}
                disabled={periodOffset === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* Time range selector */}
            <div className="flex gap-1">
              <Button
                variant={timeRange === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTimeRangeChange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTimeRangeChange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'year' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTimeRangeChange('year')}
              >
                Year
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {viewMode === 'balance' ? (
              <>
                Balance
                <InfoTip text="Are you giving attention to what matters? See if you're nurturing all the areas you set intention for." />
              </>
            ) : (
              <>
                Patterns
                <InfoTip text="Are you showing up consistently? See your rhythm and engagement over time." />
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            {viewMode === 'balance' ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    interval={timeRange === 'year' ? 3 : 0}
                    label={{ value: timeRange === 'year' ? 'Week' : 'Day', position: 'insideBottom', offset: -10, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    label={{ value: 'Duration (hrs)', angle: -90, position: 'insideLeft', fontSize: 12, offset: 10 }}
                  />
                  <RechartsTooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                  />
                  {habits
                    .filter(h => enabledFilters.has(h.name))
                    .map(habit => (
                      <Bar
                        key={habit.id}
                        dataKey={habit.name}
                        stackId="a"
                        fill={getChartColor(habit.color)}
                      />
                    ))}
                  {enabledFilters.has('Life') && (
                    <Bar dataKey="life" stackId="a" fill={lifeColor} name="Life" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={patternsData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="dateLabel"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    interval={timeRange === 'year' ? 3 : timeRange === 'month' ? 2 : 0}
                    label={{ value: timeRange === 'year' ? 'Week' : 'Day', position: 'insideBottom', offset: -10, fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    label={{ value: 'Duration (hrs)', angle: -90, position: 'insideLeft', fontSize: 12, offset: 10 }}
                  />
                  <RechartsTooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  />
                  {habits
                    .filter(h => enabledFilters.has(h.name))
                    .map(habit => (
                      <Line
                        key={habit.id}
                        type="monotone"
                        dataKey={habit.name}
                        stroke={getChartColor(habit.color)}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 2 }}
                        connectNulls
                      />
                    ))}
                  {enabledFilters.has('Life') && (
                    <Line
                      key="life"
                      type="monotone"
                      dataKey="Life"
                      stroke={lifeColor}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2 }}
                      connectNulls
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {habits.map(habit => {
              const isEnabled = enabledFilters.has(habit.name)
              const colors = colorPalette[habit.color]
              return (
                <Badge
                  key={habit.id}
                  variant={isEnabled ? 'default' : 'outline'}
                  className={`cursor-pointer transition-opacity ${
                    isEnabled
                      ? `${colors?.bg || ''} ${colors?.text || ''} ${colors?.border || ''}`
                      : 'opacity-50'
                  }`}
                  onClick={() => toggleFilter(habit.name)}
                >
                  {habit.name}
                </Badge>
              )
            })}
            <Badge
              variant={enabledFilters.has('Life') ? 'default' : 'outline'}
              className={`cursor-pointer transition-opacity ${
                enabledFilters.has('Life')
                  ? 'bg-[hsl(200,35%,91%)] text-[hsl(200,45%,48%)] border-[hsl(200,45%,48%)]'
                  : 'opacity-50'
              }`}
              onClick={() => toggleFilter('Life')}
            >
              Life
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats - Different for Balance vs Patterns */}
      {viewMode === 'balance' ? (
        <>
          {/* Balance: Time Split - Visual overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Split
                <InfoTip text="How your logged time divides between habits and life activities." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Stacked bar showing all categories */}
              <div className="h-4 bg-muted rounded-full overflow-hidden flex">
                {habits
                  .filter(h => enabledFilters.has(h.name))
                  .map(habit => {
                    const habitHours = chartData.reduce((acc, day) => acc + (day[habit.name] || 0), 0)
                    const percent = stats.totalHours > 0 ? (habitHours / stats.totalHours) * 100 : 0
                    if (percent === 0) return null
                    return (
                      <div
                        key={habit.id}
                        className="h-full"
                        style={{ width: `${percent}%`, backgroundColor: getChartColor(habit.color) }}
                      />
                    )
                  })}
                {enabledFilters.has('Life') && stats.lifePercent > 0 && (
                  <div
                    className="h-full"
                    style={{ width: `${stats.lifePercent}%`, backgroundColor: 'hsl(200, 45%, 48%)' }}
                  />
                )}
              </div>
              {/* Legend with percentages */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                {habits
                  .filter(h => enabledFilters.has(h.name))
                  .map(habit => {
                    const habitHours = chartData.reduce((acc, day) => acc + (day[habit.name] || 0), 0)
                    const percent = stats.totalHours > 0 ? Math.round((habitHours / stats.totalHours) * 100) : 0
                    if (percent === 0) return null
                    return (
                      <div key={habit.id} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getChartColor(habit.color) }}
                        />
                        <span>{habit.name}</span>
                        <span className="text-muted-foreground">{percent}%</span>
                      </div>
                    )
                  })}
                {enabledFilters.has('Life') && stats.lifePercent > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'hsl(200, 45%, 48%)' }}
                    />
                    <span>Life</span>
                    <span className="text-muted-foreground">{stats.lifePercent}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Balance: Balance Shift - How proportions are changing */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Balance Shift
                <InfoTip text="How your time split changed vs the previous period. Positive means more share, negative means less." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {stats.balanceTrend.map(habit => (
                  <div key={habit.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getChartColor(habit.color) }}
                    />
                    <span>{habit.name}</span>
                    {habit.change !== 0 && (
                      <span className={habit.change > 0 ? 'text-green-500' : 'text-orange-500'}>
                        {habit.change > 0 ? '+' : ''}{habit.change}%
                      </span>
                    )}
                    {habit.change === 0 && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                ))}
                {stats.lifeTrend && (stats.lifeTrend.currentPercent > 0 || stats.lifeTrend.change !== 0) && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: 'hsl(200, 45%, 48%)' }}
                    />
                    <span>Life</span>
                    {stats.lifeTrend.change !== 0 && (
                      <span className={stats.lifeTrend.change > 0 ? 'text-green-500' : 'text-orange-500'}>
                        {stats.lifeTrend.change > 0 ? '+' : ''}{stats.lifeTrend.change}%
                      </span>
                    )}
                    {stats.lifeTrend.change === 0 && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Balance: Stewardship - Entry types, rest, and transitions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stewardship
                <InfoTip text="Are you honoring your intentions? Track habits, life events, cautions to avoid, rest, and structural changes." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold">{stats.habitEntries}</div>
                  <div className="text-xs text-muted-foreground">Habit</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.lifeEntries}</div>
                  <div className="text-xs text-muted-foreground">Life</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.cautionEntries}</div>
                  <div className="text-xs text-muted-foreground">Caution</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.restDays}</div>
                  <div className="text-xs text-muted-foreground">Rest Days</div>
                </div>
                <div>
                  <div className="text-xl font-semibold">{stats.transitionsInRange}</div>
                  <div className="text-xs text-muted-foreground">Transitions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance: Averages + Transitions */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-semibold">{stats.avgHoursPerDay}</div>
                <div className="text-sm text-muted-foreground">Hrs/Day</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-semibold">{stats.avgHabitsPerDay}</div>
                <div className="text-sm text-muted-foreground">
                  Habits/Day
                  <InfoTip text="Average unique habits touched per active day." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-semibold">
                  {stats.daysSinceLastTransition !== null ? `${stats.daysSinceLastTransition}d` : '—'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Last Transition
                  <InfoTip text="Days since you last made structural changes to your habits. Stability is good." />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Balance: Focus Areas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Focus Areas
                <InfoTip text="Where most and least attention went this period." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.mostLoggedHabit && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Most Time</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getChartColor(stats.mostLoggedHabit.color) }}
                      />
                      <span className="font-medium">{stats.mostLoggedHabit.name}</span>
                      <span className="text-muted-foreground text-sm">{stats.mostLoggedHabit.hours}h</span>
                    </div>
                  </div>
                )}
                {stats.leastLoggedHabit && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Least Time</div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getChartColor(stats.leastLoggedHabit.color) }}
                      />
                      <span className="font-medium">{stats.leastLoggedHabit.name}</span>
                      <span className="text-muted-foreground text-sm">{stats.leastLoggedHabit.hours}h</span>
                    </div>
                  </div>
                )}
              </div>
              {stats.neglectedHabits.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-xs text-muted-foreground mb-1">No Activity</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {stats.neglectedHabits.map(habit => (
                      <div key={habit.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getChartColor(habit.color) }}
                        />
                        <span className="font-medium">{habit.name}</span>
                        <span className="text-muted-foreground text-sm">0h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Patterns: Habit Consistency - Core consistency metric (most important) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Habit Consistency
                <InfoTip text="Percentage of active days where each habit was logged. Shows consistency, not intensity." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.habitCoverage.map(habit => {
                  const colors = colorPalette[habit.color]
                  return (
                    <div key={habit.name} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${colors?.dot || 'bg-muted'}`} />
                      <span className="text-sm">{habit.name}</span>
                      <span className="text-sm font-medium">{habit.coverage}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Patterns: Habit Deep Dive - Drill into specific habit */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Habit Deep Dive
                <InfoTip text="Patterns specific to a single habit. Select one to see its unique trends." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Habit Selector */}
              <div className="flex flex-wrap gap-2 mb-4">
                {habits.map(habit => {
                  const isSelected = selectedHabit === habit.name
                  const colors = colorPalette[habit.color]
                  return (
                    <Badge
                      key={habit.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer ${
                        isSelected
                          ? `${colors?.bg || ''} ${colors?.text || ''} ${colors?.border || ''}`
                          : ''
                      }`}
                      onClick={() => setSelectedHabit(habit.name)}
                    >
                      {habit.name}
                    </Badge>
                  )
                })}
              </div>

              {/* Habit Stats - Rhythm focused */}
              {habitPatterns && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.sessionsInRange}</div>
                    <div className="text-xs text-muted-foreground">
                      Entries ({timeRange})
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.avgSessionLength}m</div>
                    <div className="text-xs text-muted-foreground">
                      Avg Entry
                      <InfoTip text="Average duration per entry, all time." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.daysSinceLast}d</div>
                    <div className="text-xs text-muted-foreground">
                      Since Last
                      <InfoTip text="Days since your last entry. Not a streak counter." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.longestGap}d</div>
                    <div className="text-xs text-muted-foreground">
                      Longest Gap
                      <InfoTip text="Longest break between entries." />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patterns: Activity - Showing up */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activity
                <InfoTip text="How often you're showing up and logging entries." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold">{stats.activeDaysPercent}%</div>
                  <div className="text-xs text-muted-foreground">Active Days</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.totalEntries}</div>
                  <div className="text-xs text-muted-foreground">Entries</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.avgEntriesPerDay}</div>
                  <div className="text-xs text-muted-foreground">Entries/Day</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patterns: Accomplishments - Highlights, Targets, Reflections */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accomplishments
                <InfoTip text="Track meaningful moments, completed targets, and how often you're reflecting on your progress." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-semibold">{stats.highlights}</div>
                  <div className="text-xs text-muted-foreground">
                    Highlights
                    <InfoTip text="Entries you marked as noteworthy this period." />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.completedTargetsInRange}</div>
                  <div className="text-xs text-muted-foreground">
                    Targets Done
                    <InfoTip text={`Targets completed this period. Total completed all time: ${stats.totalCompletedTargets}.`} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.reflectionsInRange}</div>
                  <div className="text-xs text-muted-foreground">
                    Reflections
                    <InfoTip text="How often you're reviewing and reflecting on your progress." />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patterns: Rituals and Sessions side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Daily Rituals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Rituals
                  <InfoTip text="Daily rituals: how often you set intentions at start of day and close out at end of day." />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold">{stats.prepRate}%</div>
                    <div className="text-xs text-muted-foreground">Prep</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{stats.closureRate}%</div>
                    <div className="text-xs text-muted-foreground">Closure</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Rituals */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sessions
                  <InfoTip text="Entry-level rituals: how often you warm up before and cool down after habit entries." />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold">{stats.warmUpRate}%</div>
                    <div className="text-xs text-muted-foreground">Warm-up</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{stats.coolDownRate}%</div>
                    <div className="text-xs text-muted-foreground">Cool-down</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
    </TooltipProvider>
  )
}

// Format date label based on time range
function formatDateLabel(dateStr, timeRange) {
  const date = new Date(dateStr + 'T12:00:00') // Noon to avoid timezone issues
  if (timeRange === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else if (timeRange === 'month') {
    // Just show day number (1, 2, 3...) - month is shown in the period label
    return date.getDate().toString()
  } else {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }
}
