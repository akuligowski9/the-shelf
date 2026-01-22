import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeStore, useHabitsStore, useEntriesStore } from '@/stores'
import { Card, CardContent, Button, SkeletonCard } from '@/components/ui'
import {
  PeriodSelector,
  FilterChips,
  TimeSplitBar,
  StatsCard,
  BalanceChart,
  PatternsChart,
  TimeRange,
} from '@/components/progress'
import { getHabitColor } from '@shared/colors'
import * as api from '@/api/offlineApi'

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format date label based on time range
function formatDateLabel(dateStr: string, timeRange: TimeRange): string {
  const date = new Date(dateStr + 'T12:00:00')
  if (timeRange === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else if (timeRange === 'month') {
    return date.getDate().toString()
  } else {
    return date.toLocaleDateString('en-US', { month: 'short' })
  }
}

// Get week key for a date (for weekly aggregation)
function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const jan1 = new Date(date.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((date.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`
}

type ViewMode = 'balance' | 'patterns'

export default function ProgressScreen() {
  const { colors, isDark } = useThemeStore()
  const { habits, isLoading, loadInitialData } = useHabitsStore()

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('balance')
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [periodOffset, setPeriodOffset] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Filter state - initialize with all active habits
  const activeHabits = useMemo(() => habits.filter((h) => h.active && h.type !== 'caution'), [habits])
  const [enabledFilters, setEnabledFilters] = useState<Set<string>>(new Set())

  // Server metrics state
  const [serverMetrics, setServerMetrics] = useState<any>(null)
  const [prevServerMetrics, setPrevServerMetrics] = useState<any>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)

  // Initialize filters when habits load
  useEffect(() => {
    if (activeHabits.length > 0 && enabledFilters.size === 0) {
      setEnabledFilters(new Set([...activeHabits.map((h) => h.name), 'Life']))
    }
  }, [activeHabits])

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const today = new Date()
    const dates: string[] = []

    if (timeRange === 'week') {
      const currentDay = today.getDay()
      const startOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - currentDay + periodOffset * 7
      )
      for (let i = 0; i < 7; i++) {
        const date = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate() + i
        )
        dates.push(formatDate(date))
      }
    } else if (timeRange === 'month') {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
      const year = targetMonth.getFullYear()
      const month = targetMonth.getMonth()
      const lastDay = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= lastDay; day++) {
        dates.push(formatDate(new Date(year, month, day)))
      }
    } else {
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

  // Previous period date range for comparison
  const prevDateRange = useMemo(() => {
    if (dateRange.length === 0) return []
    const periodLength = dateRange.length
    const firstDate = new Date(dateRange[0] + 'T12:00:00')
    const prevDates: string[] = []
    for (let i = periodLength; i > 0; i--) {
      const date = new Date(firstDate)
      date.setDate(firstDate.getDate() - i)
      prevDates.push(formatDate(date))
    }
    return prevDates
  }, [dateRange])

  // Period label for display
  const periodLabel = useMemo(() => {
    const today = new Date()

    if (timeRange === 'month') {
      const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
      return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    if (timeRange === 'year') {
      return (today.getFullYear() + periodOffset).toString()
    }

    // Week view
    const startDate = new Date(dateRange[0] + 'T12:00:00')
    const endDate = new Date(dateRange[dateRange.length - 1] + 'T12:00:00')
    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${startDate.toLocaleDateString('en-US', formatOpts)} - ${endDate.toLocaleDateString('en-US', formatOpts)}`
  }, [timeRange, periodOffset, dateRange])

  // Fetch metrics when date range changes
  const loadMetrics = useCallback(async () => {
    if (dateRange.length === 0) return

    const startDate = dateRange[0]
    const lastDate = new Date(dateRange[dateRange.length - 1] + 'T12:00:00')
    lastDate.setDate(lastDate.getDate() + 1)
    const endDate = formatDate(lastDate)

    setMetricsLoading(true)

    try {
      const metrics = await api.getMetricsForRange(startDate, endDate)
      setServerMetrics(metrics)
    } catch (err) {
      console.error('Failed to load metrics:', err)
      setServerMetrics(null)
    }

    // Fetch previous period for comparison
    if (prevDateRange.length > 0) {
      try {
        const prevStartDate = prevDateRange[0]
        const prevLastDate = new Date(prevDateRange[prevDateRange.length - 1] + 'T12:00:00')
        prevLastDate.setDate(prevLastDate.getDate() + 1)
        const prevEndDate = formatDate(prevLastDate)

        const prevMetrics = await api.getMetricsForRange(prevStartDate, prevEndDate)
        setPrevServerMetrics(prevMetrics)
      } catch (err) {
        setPrevServerMetrics(null)
      }
    }

    setMetricsLoading(false)
  }, [dateRange, prevDateRange])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  // Handle time range change - reset offset
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    setPeriodOffset(0)
  }

  // Toggle filter
  const toggleFilter = (filterName: string) => {
    setEnabledFilters((prev) => {
      const next = new Set(prev)
      if (next.has(filterName)) {
        next.delete(filterName)
      } else {
        next.add(filterName)
      }
      return next
    })
  }

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([loadInitialData(), loadMetrics()])
    setRefreshing(false)
  }, [loadMetrics])

  // Process server metrics into chart data
  const chartData = useMemo(() => {
    if (!serverMetrics || !serverMetrics.daily) return []

    const habitIdToName = new Map<number, string>(serverMetrics.habits?.map((h: any) => [h.id, h.name]) || [])

    // For year view, aggregate by week
    if (timeRange === 'year') {
      const dataByWeek: Record<string, any> = {}
      const weekDates: Record<string, string[]> = {}

      dateRange.forEach((date) => {
        const weekKey = getWeekKey(date)
        if (!dataByWeek[weekKey]) {
          dataByWeek[weekKey] = { date: weekKey, life: 0, caution: 0 }
          weekDates[weekKey] = []
          activeHabits.forEach((habit) => {
            dataByWeek[weekKey][habit.name] = 0
          })
        }
        weekDates[weekKey].push(date)
      })

      // Add week labels
      Object.keys(dataByWeek).forEach((weekKey, index) => {
        dataByWeek[weekKey].dateLabel = (index + 1).toString()
      })

      // Aggregate server daily data into weeks
      serverMetrics.daily.forEach((day: any) => {
        const weekKey = getWeekKey(day.date)
        if (!dataByWeek[weekKey]) return

        if (day.habits) {
          Object.entries(day.habits).forEach(([habitId, data]: [string, any]) => {
            const habitName = habitIdToName.get(Number(habitId))
            if (habitName && dataByWeek[weekKey][habitName] !== undefined) {
              dataByWeek[weekKey][habitName] += data.minutes || 0
            }
          })
        }
        dataByWeek[weekKey].life += day.life || 0
        dataByWeek[weekKey].caution += day.caution || 0
      })

      // Convert minutes to hours
      return Object.values(dataByWeek).map((week: any) => {
        const converted: any = {
          date: week.date,
          dateLabel: week.dateLabel,
          caution: week.caution,
        }
        activeHabits.forEach((habit) => {
          converted[habit.name] = Math.round(((week[habit.name] || 0) / 60) * 10) / 10
        })
        converted.life = Math.round(((week.life || 0) / 60) * 10) / 10
        return converted
      })
    }

    // For week/month view, keep daily granularity
    const dataByDate: Record<string, any> = {}

    dateRange.forEach((date) => {
      dataByDate[date] = {
        date,
        dateLabel: formatDateLabel(date, timeRange),
        life: 0,
        caution: 0,
      }
      activeHabits.forEach((habit) => {
        dataByDate[date][habit.name] = 0
      })
    })

    serverMetrics.daily.forEach((day: any) => {
      if (!dataByDate[day.date]) return

      if (day.habits) {
        Object.entries(day.habits).forEach(([habitId, data]: [string, any]) => {
          const habitName = habitIdToName.get(Number(habitId))
          if (habitName && dataByDate[day.date][habitName] !== undefined) {
            dataByDate[day.date][habitName] = data.minutes || 0
          }
        })
      }
      dataByDate[day.date].life = day.life || 0
      dataByDate[day.date].caution = day.caution || 0
    })

    // Convert minutes to hours
    return Object.values(dataByDate).map((day: any) => {
      const converted: any = {
        date: day.date,
        dateLabel: day.dateLabel,
        caution: day.caution,
      }
      activeHabits.forEach((habit) => {
        converted[habit.name] = Math.round(((day[habit.name] || 0) / 60) * 10) / 10
      })
      converted.life = Math.round(((day.life || 0) / 60) * 10) / 10
      return converted
    })
  }, [dateRange, activeHabits, timeRange, serverMetrics])

  // Calculate stats
  const stats = useMemo(() => {
    const enabledHabitNames = new Set([...enabledFilters].filter((f) => f !== 'Life'))
    const includeLife = enabledFilters.has('Life')

    const totals = serverMetrics?.totals || {}
    const serverHabits = serverMetrics?.habits || []

    // Calculate filtered totals
    const enabledHabitIds = new Set(
      serverHabits.filter((h: any) => enabledHabitNames.has(h.name)).map((h: any) => h.id)
    )

    const habitEntries = serverHabits
      .filter((h: any) => enabledHabitIds.has(h.id))
      .reduce((sum: number, h: any) => sum + (h.sessions || 0), 0)

    const lifeEntries = includeLife ? totals.life_entries || 0 : 0
    const cautionEntries = totals.caution_entries || 0
    const totalEntries = habitEntries + lifeEntries + cautionEntries
    const restDays = totals.rest_days || 0

    const daysWithEntries =
      serverMetrics?.daily?.filter(
        (d: any) =>
          Object.keys(d.habits || {}).some((hid) => enabledHabitIds.has(Number(hid))) ||
          (includeLife && d.life > 0)
      ).length || 0

    // Total hours from chart data
    const totalHours = chartData.reduce((acc, day) => {
      const dayHours =
        activeHabits
          .filter((h) => enabledHabitNames.has(h.name))
          .reduce((sum, h) => sum + (day[h.name] || 0), 0) + (includeLife ? day.life : 0)
      return acc + dayHours
    }, 0)

    const habitHours = chartData.reduce((acc, day) => {
      return (
        acc +
        activeHabits
          .filter((h) => enabledHabitNames.has(h.name))
          .reduce((sum, h) => sum + (day[h.name] || 0), 0)
      )
    }, 0)

    const lifeHours = includeLife
      ? chartData.reduce((acc, day) => acc + (day.life || 0), 0)
      : 0

    const habitPercent = totalHours > 0 ? Math.round((habitHours / totalHours) * 100) : 0
    const lifePercent = totalHours > 0 ? Math.round((lifeHours / totalHours) * 100) : 0

    const avgEntriesPerDay = daysWithEntries > 0 ? (totalEntries / daysWithEntries).toFixed(1) : '0'
    const avgHoursPerDay = daysWithEntries > 0 ? (totalHours / daysWithEntries).toFixed(1) : '0'
    const activeDaysPercent =
      dateRange.length > 0 ? Math.round((daysWithEntries / dateRange.length) * 100) : 0

    // Habit totals for time split
    const habitTotals = activeHabits
      .filter((h) => enabledHabitNames.has(h.name))
      .map((habit) => {
        const hours = chartData.reduce((acc, day) => acc + (day[habit.name] || 0), 0)
        const percent = totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0
        return {
          name: habit.name,
          color: habit.color,
          hours: Math.round(hours * 10) / 10,
          percent,
        }
      })

    // Habit coverage
    const habitCoverage = serverHabits
      .filter((h: any) => enabledHabitNames.has(h.name))
      .map((habit: any) => {
        const coveragePercent =
          daysWithEntries > 0 ? Math.round((habit.days_touched / daysWithEntries) * 100) : 0
        return { name: habit.name, color: habit.color, coverage: coveragePercent }
      })

    return {
      totalEntries,
      habitEntries,
      lifeEntries,
      cautionEntries,
      restDays,
      totalHours: Math.round(totalHours * 10) / 10,
      daysWithEntries,
      totalDaysInRange: dateRange.length,
      habitPercent,
      lifePercent,
      lifeHours: Math.round(lifeHours * 10) / 10,
      avgEntriesPerDay,
      avgHoursPerDay,
      activeDaysPercent,
      habitTotals,
      habitCoverage,
    }
  }, [chartData, dateRange, activeHabits, enabledFilters, serverMetrics])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Progress</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          See where your attention went
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading && habits.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <Button
            variant={viewMode === 'balance' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setViewMode('balance')}
          >
            Balance
          </Button>
          <Button
            variant={viewMode === 'patterns' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setViewMode('patterns')}
          >
            Patterns
          </Button>
        </View>

        {/* Period Selector */}
        <Card>
          <CardContent>
            <PeriodSelector
              timeRange={timeRange}
              periodOffset={periodOffset}
              periodLabel={periodLabel}
              onTimeRangeChange={handleTimeRangeChange}
              onPeriodOffsetChange={setPeriodOffset}
            />
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardContent>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              {viewMode === 'balance' ? 'Balance' : 'Patterns'}
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
              {viewMode === 'balance'
                ? 'Are you giving attention to what matters?'
                : 'Are you showing up consistently?'}
            </Text>

            {chartData.length > 0 ? (
              viewMode === 'balance' ? (
                <BalanceChart
                  data={chartData}
                  habits={activeHabits}
                  enabledFilters={enabledFilters}
                  includeLife={true}
                  timeRange={timeRange}
                />
              ) : (
                <PatternsChart
                  data={chartData}
                  habits={activeHabits}
                  enabledFilters={enabledFilters}
                  includeLife={true}
                  timeRange={timeRange}
                />
              )
            ) : (
              <View style={styles.emptyChart}>
                <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>
                  No data for this period
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Filters</Text>
            <FilterChips
              habits={activeHabits}
              enabledFilters={enabledFilters}
              onToggleFilter={toggleFilter}
              includeLife={true}
            />
          </CardContent>
        </Card>

        {/* Stats based on view mode */}
        {viewMode === 'balance' ? (
          <>
            {/* Time Split */}
            <Card>
              <CardContent>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Time Split</Text>
                <TimeSplitBar
                  items={stats.habitTotals}
                  totalHours={stats.totalHours}
                  lifeHours={stats.lifeHours}
                  lifePercent={stats.lifePercent}
                  showLife={enabledFilters.has('Life')}
                />
              </CardContent>
            </Card>

            {/* Stewardship */}
            <StatsCard
              title="Stewardship"
              stats={[
                { value: stats.habitEntries, label: 'Habit' },
                { value: stats.lifeEntries, label: 'Life' },
                { value: stats.cautionEntries, label: 'Caution' },
                { value: stats.restDays, label: 'Rest Days' },
              ]}
              columns={4}
            />

            {/* Averages */}
            <StatsCard
              title="Averages"
              stats={[
                { value: `${stats.avgHoursPerDay}h`, label: 'Hrs/Day' },
                { value: stats.avgEntriesPerDay, label: 'Entries/Day' },
                { value: `${stats.totalHours}h`, label: 'Total Hours' },
              ]}
              columns={3}
            />
          </>
        ) : (
          <>
            {/* Activity */}
            <StatsCard
              title="Activity"
              stats={[
                { value: `${stats.activeDaysPercent}%`, label: 'Active Days' },
                { value: stats.totalEntries, label: 'Entries' },
                { value: stats.avgEntriesPerDay, label: 'Entries/Day' },
              ]}
              columns={3}
            />

            {/* Habit Consistency */}
            <Card>
              <CardContent>
                <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
                  Habit Consistency
                </Text>
                <View style={styles.consistencyList}>
                  {stats.habitCoverage.map((habit: any) => {
                    const colorSet = getHabitColor(habit.color)
                    const dotColor = colorSet.main
                    return (
                      <View key={habit.name} style={styles.consistencyItem}>
                        <View style={[styles.consistencyDot, { backgroundColor: dotColor }]} />
                        <Text style={[styles.consistencyName, { color: colors.text }]}>
                          {habit.name}
                        </Text>
                        <Text style={[styles.consistencyValue, { color: colors.primary }]}>
                          {habit.coverage}%
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </CardContent>
            </Card>
          </>
        )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    gap: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  emptyChart: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChartText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  consistencyList: {
    gap: 10,
  },
  consistencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consistencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  consistencyName: {
    flex: 1,
    fontSize: 14,
  },
  consistencyValue: {
    fontSize: 14,
    fontWeight: '600',
  },
})
