import { useState, useMemo } from 'react'
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
import { mockEntries, mockPreparations, mockClosures, mockTransitions } from '@/data/mockData'
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
  const { habits } = useHabits()
  const [viewMode, setViewMode] = useState('balance') // 'balance' | 'patterns'
  const [timeRange, setTimeRange] = useState('week') // 'week' | 'month' | 'year'
  const [periodOffset, setPeriodOffset] = useState(0) // 0 = current, -1 = previous, etc.
  const [enabledFilters, setEnabledFilters] = useState(
    () => new Set([...habits.map(h => h.name), 'Life'])
  )
  const [selectedHabit, setSelectedHabit] = useState(habits[0]?.name || null)

  // Reset offset when changing time range
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange)
    setPeriodOffset(0)
  }

  // Get date range based on selection and offset
  const dateRange = useMemo(() => {
    const today = new Date()
    const dates = []

    if (timeRange === 'week') {
      // Calendar week starting Sunday
      const dayOfWeek = today.getDay() // 0 = Sunday
      const sunday = new Date(today)
      sunday.setDate(today.getDate() - dayOfWeek + (periodOffset * 7))

      for (let i = 0; i < 7; i++) {
        const date = new Date(sunday)
        date.setDate(sunday.getDate() + i)
        dates.push(date.toISOString().split('T')[0])
      }
    } else if (timeRange === 'month') {
      // Calendar month (1st to last day)
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
      const year = targetMonth.getFullYear()
      const month = targetMonth.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()

      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month, day)
        dates.push(date.toISOString().split('T')[0])
      }
    } else {
      // Calendar year (Jan 1 to Dec 31)
      const targetYear = today.getFullYear() + periodOffset
      const startDate = new Date(targetYear, 0, 1) // Jan 1
      const endDate = new Date(targetYear, 11, 31) // Dec 31

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dates.push(date.toISOString().split('T')[0])
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


  // Process entries into chart data
  const chartData = useMemo(() => {
    // For year view, aggregate by week instead of by day
    if (timeRange === 'year') {
      const dataByWeek = {}
      const weekDates = {} // Track dates in each week for range display

      // Initialize weeks
      dateRange.forEach(date => {
        const weekKey = getWeekKey(date)
        if (!dataByWeek[weekKey]) {
          dataByWeek[weekKey] = {
            date: weekKey,
            life: 0,
            caution: 0,
          }
          weekDates[weekKey] = []
          habits.forEach(habit => {
            dataByWeek[weekKey][habit.name] = 0
          })
        }
        weekDates[weekKey].push(date)
      })

      // Add week number and date range to each week
      Object.keys(dataByWeek).forEach((weekKey, index) => {
        const dates = weekDates[weekKey].sort()
        const startDate = new Date(dates[0] + 'T12:00:00')
        const endDate = new Date(dates[dates.length - 1] + 'T12:00:00')
        const formatOpts = { month: 'short', day: 'numeric' }

        dataByWeek[weekKey].dateLabel = (index + 1).toString() // Week number: 1, 2, 3...
        dataByWeek[weekKey].dateRange = `${startDate.toLocaleDateString('en-US', formatOpts)} - ${endDate.toLocaleDateString('en-US', formatOpts)}`
      })

      // Aggregate entries by week
      mockEntries.forEach(entry => {
        const entryDate = entry.occurred_at.split('T')[0]
        if (!dateRange.includes(entryDate)) return

        const weekKey = getWeekKey(entryDate)
        if (!dataByWeek[weekKey]) return

        const minutes = entry.duration_minutes || 0

        if (entry.type === 'habit' && entry.habit) {
          dataByWeek[weekKey][entry.habit] =
            (dataByWeek[weekKey][entry.habit] || 0) + minutes
        } else if (entry.type === 'life') {
          dataByWeek[weekKey].life += minutes
        } else if (entry.type === 'caution') {
          dataByWeek[weekKey].caution += 1
        }
      })

      // Convert minutes to hours
      return Object.values(dataByWeek).map(day => {
        const converted = {
          date: day.date,
          dateLabel: day.dateLabel,
          dateRange: day.dateRange,
          caution: day.caution
        }
        habits.forEach(habit => {
          converted[habit.name] = Math.round((day[habit.name] || 0) / 60 * 10) / 10
        })
        converted.life = Math.round((day.life || 0) / 60 * 10) / 10
        return converted
      })
    }

    // For week/month view, keep daily granularity
    const dataByDate = {}

    // Initialize all dates with zeros
    dateRange.forEach(date => {
      dataByDate[date] = {
        date,
        dateLabel: formatDateLabel(date, timeRange),
        life: 0,
        caution: 0,
      }
      habits.forEach(habit => {
        dataByDate[date][habit.name] = 0
      })
    })

    // Aggregate entries by date and type
    mockEntries.forEach(entry => {
      const entryDate = entry.occurred_at.split('T')[0]
      if (!dataByDate[entryDate]) return

      const minutes = entry.duration_minutes || 0

      if (entry.type === 'habit' && entry.habit) {
        dataByDate[entryDate][entry.habit] =
          (dataByDate[entryDate][entry.habit] || 0) + minutes
      } else if (entry.type === 'life') {
        dataByDate[entryDate].life += minutes
      } else if (entry.type === 'caution') {
        dataByDate[entryDate].caution += 1 // Count occurrences, not minutes
      }
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
  }, [dateRange, habits, timeRange])

  // Calculate summary stats (filtered by enabledFilters)
  const stats = useMemo(() => {
    // Get enabled habits (filter out Life, that's handled separately)
    const enabledHabitNames = new Set(
      [...enabledFilters].filter(f => f !== 'Life')
    )
    const includeLife = enabledFilters.has('Life')

    // Filter entries by date range AND enabled filters
    const allEntriesInRange = mockEntries.filter(e => {
      const entryDate = e.occurred_at.split('T')[0]
      return dateRange.includes(entryDate)
    })

    const entriesInRange = allEntriesInRange.filter(e => {
      if (e.type === 'habit') return enabledHabitNames.has(e.habit)
      if (e.type === 'life') return includeLife
      return true // caution always included
    })

    const totalEntries = entriesInRange.length
    const habitEntries = entriesInRange.filter(e => e.type === 'habit').length
    const lifeEntries = entriesInRange.filter(e => e.type === 'life').length
    const cautionEntries = entriesInRange.filter(e => e.type === 'caution').length

    const daysWithEntries = new Set(entriesInRange.map(e => e.occurred_at.split('T')[0])).size

    // Rest days based on enabled filters only
    const restDays = chartData.filter(day => {
      const hasHours = habits.some(h => enabledHabitNames.has(h.name) && day[h.name] > 0)
      const hasLifeHours = includeLife && day.life > 0
      return !hasHours && !hasLifeHours
    }).length

    // Total hours based on enabled filters only
    const totalHours = chartData.reduce((acc, day) => {
      const dayHours = habits
        .filter(h => enabledHabitNames.has(h.name))
        .reduce((sum, h) => sum + (day[h.name] || 0), 0) + (includeLife ? day.life : 0)
      return acc + dayHours
    }, 0)

    // Balance metrics
    const avgEntriesPerDay = daysWithEntries > 0 ? (totalEntries / daysWithEntries).toFixed(1) : 0
    const avgHoursPerDay = daysWithEntries > 0 ? (totalHours / daysWithEntries).toFixed(1) : 0

    // Count unique enabled habits per day, then average
    const habitsByDay = {}
    entriesInRange.filter(e => e.type === 'habit').forEach(e => {
      const day = e.occurred_at.split('T')[0]
      if (!habitsByDay[day]) habitsByDay[day] = new Set()
      habitsByDay[day].add(e.habit)
    })
    const daysWithHabits = Object.keys(habitsByDay).length
    const totalUniqueHabitsPerDay = Object.values(habitsByDay).reduce((acc, set) => acc + set.size, 0)
    const avgHabitsPerDay = daysWithHabits > 0 ? (totalUniqueHabitsPerDay / daysWithHabits).toFixed(1) : 0

    // Patterns metrics
    const datesInRange = new Set(dateRange)
    const prepsInRange = Object.keys(mockPreparations).filter(d => datesInRange.has(d)).length
    const closuresInRange = Object.keys(mockClosures).filter(d => datesInRange.has(d)).length
    const prepRate = daysWithEntries > 0 ? Math.round((prepsInRange / daysWithEntries) * 100) : 0
    const closureRate = daysWithEntries > 0 ? Math.round((closuresInRange / daysWithEntries) * 100) : 0

    const highlights = entriesInRange.filter(e => e.is_highlight).length

    // Habit coverage for enabled habits only
    const habitCoverage = habits
      .filter(h => enabledHabitNames.has(h.name))
      .map(habit => {
        const habitEntriesForHabit = entriesInRange.filter(e => e.type === 'habit' && e.habit === habit.name)
        const daysLogged = new Set(habitEntriesForHabit.map(e => e.occurred_at.split('T')[0])).size
        const coveragePercent = daysWithEntries > 0 ? Math.round((daysLogged / daysWithEntries) * 100) : 0
        return { name: habit.name, color: habit.color, coverage: coveragePercent }
      })

    // Previous period comparison (based on viewed period, not today)
    const today = new Date()
    const previousRangeDates = []

    if (timeRange === 'week') {
      // Previous 7 days before the current viewed week
      const firstDay = new Date(dateRange[0] + 'T12:00:00')
      for (let i = 7; i >= 1; i--) {
        const date = new Date(firstDay)
        date.setDate(date.getDate() - i)
        previousRangeDates.push(date.toISOString().split('T')[0])
      }
    } else if (timeRange === 'month') {
      // Previous calendar month
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset - 1, 1)
      const year = targetMonth.getFullYear()
      const month = targetMonth.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month, day)
        previousRangeDates.push(date.toISOString().split('T')[0])
      }
    } else {
      // Previous calendar year
      const targetYear = today.getFullYear() + periodOffset - 1
      const startDate = new Date(targetYear, 0, 1)
      const endDate = new Date(targetYear, 11, 31)
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        previousRangeDates.push(date.toISOString().split('T')[0])
      }
    }

    // Filter previous entries by enabled filters too
    const allPreviousEntries = mockEntries.filter(e => {
      const entryDate = e.occurred_at.split('T')[0]
      return previousRangeDates.includes(entryDate)
    })
    const previousEntries = allPreviousEntries.filter(e => {
      if (e.type === 'habit') return enabledHabitNames.has(e.habit)
      if (e.type === 'life') return includeLife
      return true
    })
    const previousHours = previousEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / 60
    const currentHours = entriesInRange.reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / 60
    const periodOverPeriodChange = previousHours > 0
      ? Math.round(((currentHours - previousHours) / previousHours) * 100)
      : (currentHours > 0 ? 100 : 0)

    // Day of Week distribution (filtered)
    const dayOfWeekDist = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    entriesInRange.forEach(e => {
      const date = new Date(e.occurred_at)
      dayOfWeekDist[date.getDay()] += (e.duration_minutes || 0) / 60
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
    const totalDaysInRange = dateRange.length
    const activeDaysPercent = totalDaysInRange > 0 ? Math.round((daysWithEntries / totalDaysInRange) * 100) : 0

    // Balance: Neglected habits (enabled habits with 0 time this period)
    const neglectedHabits = habitTotals.filter(h => h.hours === 0)

    // Balance: Trend vs previous period (filtered)
    const previousHabitHours = {}
    habits.filter(h => enabledHabitNames.has(h.name)).forEach(habit => {
      const hours = previousEntries
        .filter(e => e.type === 'habit' && e.habit === habit.name)
        .reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / 60
      previousHabitHours[habit.name] = hours
    })
    const previousLifeHours = previousEntries
      .filter(e => e.type === 'life')
      .reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / 60
    const previousTotalHours = previousHours

    const balanceTrend = habits
      .filter(h => enabledHabitNames.has(h.name))
      .map(habit => {
        const currentPercent = totalHours > 0 ? (habitTotals.find(h => h.name === habit.name)?.hours || 0) / totalHours * 100 : 0
        const prevPercent = previousTotalHours > 0 ? (previousHabitHours[habit.name] || 0) / previousTotalHours * 100 : 0
        const change = Math.round(currentPercent - prevPercent)
        return { name: habit.name, color: habit.color, currentPercent: Math.round(currentPercent), change }
      }).filter(h => h.currentPercent > 0 || h.change !== 0)

    const lifeTrend = includeLife ? {
      name: 'Life',
      currentPercent: lifePercent,
      change: previousTotalHours > 0
        ? Math.round(lifePercent - (previousLifeHours / previousTotalHours * 100))
        : 0
    } : null

    // Transition metrics
    const transitionsInRange = mockTransitions.filter(t => {
      const transitionDate = t.started_at.split('T')[0]
      return dateRange.includes(transitionDate)
    }).length

    const sortedTransitions = [...mockTransitions].sort(
      (a, b) => new Date(b.started_at) - new Date(a.started_at)
    )
    const lastTransition = sortedTransitions[0]
    const daysSinceLastTransition = lastTransition
      ? Math.floor((today - new Date(lastTransition.started_at)) / (1000 * 60 * 60 * 24))
      : null

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
      highlights,
      habitCoverage,
      periodOverPeriodChange,
      dayOfWeekData,
    }
  }, [chartData, dateRange, habits, timeRange, periodOffset, enabledFilters])

  // Habit-specific patterns
  const habitPatterns = useMemo(() => {
    if (!selectedHabit) return null

    const habitEntries = mockEntries
      .filter(e => e.type === 'habit' && e.habit === selectedHabit)
      .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))

    if (habitEntries.length === 0) return null

    // Average session length
    const totalMinutes = habitEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0)
    const avgSessionLength = Math.round(totalMinutes / habitEntries.length)

    // Last session
    const lastSession = habitEntries[habitEntries.length - 1]
    const lastSessionDate = lastSession.occurred_at.split('T')[0]

    // Days since last session
    const today = new Date()
    const lastDate = new Date(lastSessionDate + 'T12:00:00')
    const daysSinceLast = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))

    // Longest gap
    let longestGap = 0
    for (let i = 1; i < habitEntries.length; i++) {
      const prev = new Date(habitEntries[i - 1].occurred_at.split('T')[0])
      const curr = new Date(habitEntries[i].occurred_at.split('T')[0])
      const gap = Math.floor((curr - prev) / (1000 * 60 * 60 * 24))
      if (gap > longestGap) longestGap = gap
    }

    // Total sessions all time
    const totalSessions = habitEntries.length

    // Sessions in current range
    const datesInRange = new Set(dateRange)
    const sessionsInRange = habitEntries.filter(e => datesInRange.has(e.occurred_at.split('T')[0])).length

    // Hours in current range
    const hoursInRange = habitEntries
      .filter(e => datesInRange.has(e.occurred_at.split('T')[0]))
      .reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / 60

    return {
      avgSessionLength,
      daysSinceLast,
      longestGap,
      totalSessions,
      sessionsInRange,
      hoursInRange: Math.round(hoursInRange * 10) / 10,
    }
  }, [selectedHabit, dateRange])

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
          <div className="h-64">
            {viewMode === 'balance' ? (
              <ResponsiveContainer width="100%" height="100%">
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
              <ResponsiveContainer width="100%" height="100%">
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
                {habits.map(habit => {
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
                {stats.lifePercent > 0 && (
                  <div
                    className="h-full"
                    style={{ width: `${stats.lifePercent}%`, backgroundColor: 'hsl(200, 45%, 48%)' }}
                  />
                )}
              </div>
              {/* Legend with percentages */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                {habits.map(habit => {
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
                {stats.lifePercent > 0 && (
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
          {/* Patterns: Habit Coverage - Core consistency metric (most important) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Habit Coverage
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

          {/* Patterns: Activity - Showing up */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activity
                <InfoTip text="How often you're showing up and logging sessions." />
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
                  <div className="text-xs text-muted-foreground">Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{stats.avgEntriesPerDay}</div>
                  <div className="text-xs text-muted-foreground">Sessions/Day</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patterns: Ritual metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-semibold">{stats.prepRate}%</div>
                <div className="text-sm text-muted-foreground">
                  Prep Rate
                  <InfoTip text="How often you set intentions before starting. Tracks intentionality." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-semibold">{stats.closureRate}%</div>
                <div className="text-sm text-muted-foreground">
                  Closure Rate
                  <InfoTip text="How often you explicitly ended your day. Tracks completion habits." />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <div className="text-2xl font-semibold">{stats.highlights}</div>
                <div className="text-sm text-muted-foreground">
                  Highlights
                  <InfoTip text="Entries you marked as noteworthy. Track meaningful moments." />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patterns: Habit Deep Dive - Detailed exploration (interactive, so last) */}
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
                      Sessions ({timeRange})
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.avgSessionLength}m</div>
                    <div className="text-xs text-muted-foreground">
                      Avg Session
                      <InfoTip text="Average duration per session, all time." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.daysSinceLast}d</div>
                    <div className="text-xs text-muted-foreground">
                      Since Last
                      <InfoTip text="Days since your last session. Not a streak counter." />
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{habitPatterns.longestGap}d</div>
                    <div className="text-xs text-muted-foreground">
                      Longest Gap
                      <InfoTip text="Longest break between sessions." />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
