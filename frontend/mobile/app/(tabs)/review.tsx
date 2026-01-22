import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Star, Target, Activity, Leaf, AlertCircle } from 'lucide-react-native'
import { useThemeStore, useHabitsStore, useEntriesStore } from '@/stores'
import { Card, CardContent, Badge, SkeletonCard } from '@/components/ui'
import { PeriodSelector, TimeRange } from '@/components/progress'
import { PeriodMetrics, ReflectionCard, ReflectionEditor } from '@/components/review'
import { useErrorHandler } from '@/hooks'
import * as api from '@/api/offlineApi'
import type { Reflection, Entry, Target as TargetType } from '@shared/types'

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Calculate date range for period
function getDateRange(timeRange: TimeRange, periodOffset: number) {
  const today = new Date()

  if (timeRange === 'week') {
    const currentDay = today.getDay()
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - currentDay + periodOffset * 7
    )
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start, end }
  } else if (timeRange === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
    const end = new Date(today.getFullYear(), today.getMonth() + periodOffset + 1, 0)
    return { start, end }
  } else {
    const start = new Date(today.getFullYear() + periodOffset, 0, 1)
    const end = new Date(today.getFullYear() + periodOffset, 11, 31)
    return { start, end }
  }
}

// Get period label for display
function getPeriodLabel(timeRange: TimeRange, periodOffset: number) {
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
  const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${dateRange.start.toLocaleDateString('en-US', formatOpts)} - ${dateRange.end.toLocaleDateString('en-US', formatOpts)}`
}

export default function ReviewScreen() {
  const { colors, isDark } = useThemeStore()
  const { habits, targets, isLoading: habitsLoading, loadInitialData } = useHabitsStore()
  const { entries, loadEntriesForRange, isLoading: entriesLoading } = useEntriesStore()
  const { handleError, handleSuccess } = useErrorHandler()

  // View state
  const [timeRange, setTimeRange] = useState<TimeRange>('week')
  const [periodOffset, setPeriodOffset] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Reflections state
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [preparations, setPreparations] = useState<Record<string, any>>({})

  const dateRange = useMemo(() => getDateRange(timeRange, periodOffset), [timeRange, periodOffset])
  const periodLabel = useMemo(() => getPeriodLabel(timeRange, periodOffset), [timeRange, periodOffset])

  // Load data
  const loadData = useCallback(async () => {
    const startDate = formatDate(dateRange.start)
    const endDateObj = new Date(dateRange.end)
    endDateObj.setDate(endDateObj.getDate() + 1)
    const endDate = formatDate(endDateObj)

    await Promise.all([
      loadEntriesForRange(startDate, endDate),
      api.getReflections().then(setReflections).catch(() => []),
      api.getPreparationsInRange('day', startDate, endDate)
        .then((preps: any[]) => {
          const prepsMap: Record<string, any> = {}
          preps.forEach((prep) => {
            const dateKey = prep.period_start.split('T')[0]
            prepsMap[dateKey] = prep
          })
          setPreparations(prepsMap)
        })
        .catch(() => {}),
    ])
  }, [dateRange, loadEntriesForRange])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    setPeriodOffset(0)
  }

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([loadInitialData(), loadData()])
    setRefreshing(false)
  }, [loadData])

  // Filter entries within date range
  const periodEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date((entry as any).occurred_at || entry.created_at)
      return (
        entryDate >= dateRange.start &&
        entryDate <= dateRange.end &&
        !(entry as any).archived_at
      )
    })
  }, [entries, dateRange])

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalMinutes = periodEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
    const habitEntries = periodEntries.filter((e) => e.type === 'habit').length
    const lifeEntries = periodEntries.filter((e) => e.type === 'life').length
    const cautionEntries = periodEntries.filter((e) => e.type === 'caution').length

    // Count rest days from preparations
    const restDays = Object.values(preparations).filter((prep: any) => prep.rest_day).length

    return {
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      habitEntries,
      lifeEntries,
      cautionEntries,
      restDays,
    }
  }, [periodEntries, preparations])

  // Get highlighted entries
  const highlights = useMemo(() => {
    return periodEntries
      .filter((e) => (e as any).is_highlight)
      .sort((a, b) => {
        const aTime = new Date((a as any).occurred_at || a.created_at).getTime()
        const bTime = new Date((b as any).occurred_at || b.created_at).getTime()
        return bTime - aTime
      })
  }, [periodEntries])

  // Get completed targets
  const completedTargets = useMemo(() => {
    return targets.filter((t) => t.status === 'completed')
  }, [targets])

  // Filter reflections for this period
  const periodReflections = useMemo(() => {
    return reflections
      .filter((r) => {
        const refDate = new Date(r.created_at)
        return refDate >= dateRange.start && refDate <= dateRange.end
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [reflections, dateRange])

  // Get habit name for entry
  const getHabitName = (entry: Entry) => {
    if (entry.type === 'life') return 'Life Event'
    if (entry.type === 'caution') return 'Caution'
    if ((entry as any).habit_name) return (entry as any).habit_name
    const habit = habits.find((h) => h.id === entry.habit_id)
    return habit?.name || 'Unknown'
  }

  // Save new reflection
  const handleSaveReflection = async (content: string) => {
    try {
      const saved = await api.createReflection({
        period_type: timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : 'year',
        period_start: formatDate(dateRange.start),
        content,
      })
      setReflections((prev) => [saved, ...prev])
      handleSuccess('Reflection saved')
    } catch (err) {
      handleError(err, 'Save reflection')
    }
  }

  // Delete reflection
  const handleDeleteReflection = async (id: number) => {
    try {
      await api.deleteReflection(id)
      setReflections((prev) => prev.filter((r) => r.id !== id))
      handleSuccess('Reflection deleted')
    } catch (err) {
      handleError(err, 'Delete reflection')
    }
  }

  // Get icon for entry type
  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <Activity size={16} color="#3b82f6" />
      case 'life':
        return <Leaf size={16} color="#10b981" />
      case 'caution':
        return <AlertCircle size={16} color="#f59e0b" />
      default:
        return <Star size={16} color="#f59e0b" />
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Review</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Reflect on what happened
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
        {habitsLoading && habits.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
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

        {/* Period Metrics */}
        <PeriodMetrics metrics={metrics} periodLabel={periodLabel} />

        {/* Accomplishments */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Accomplishments</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Highlighted moments and completed targets
            </Text>

            {highlights.length === 0 && completedTargets.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No highlights or completed targets for this period.
              </Text>
            ) : (
              <View style={styles.accomplishmentsList}>
                {/* Highlights */}
                {highlights.map((entry) => (
                  <View key={entry.id} style={styles.accomplishmentItem}>
                    <View style={styles.accomplishmentIcon}>
                      {getEntryIcon(entry.type)}
                    </View>
                    <View style={styles.accomplishmentContent}>
                      <View style={styles.accomplishmentHeader}>
                        <Badge variant="secondary">{getHabitName(entry)}</Badge>
                        {(entry as any).practice_name && (
                          <Text style={[styles.practiceLabel, { color: colors.textMuted }]}>
                            {(entry as any).practice_name}
                          </Text>
                        )}
                      </View>
                      <Text style={[styles.entryNote, { color: colors.text }]}>
                        {entry.note || 'No note'}
                      </Text>
                      <Text style={[styles.entryDate, { color: colors.textMuted }]}>
                        {formatDisplayDate((entry as any).occurred_at || entry.created_at)}
                        {entry.duration_minutes && ` · ${entry.duration_minutes}min`}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Completed Targets */}
                {completedTargets.map((target) => (
                  <View key={target.id} style={styles.accomplishmentItem}>
                    <View style={styles.accomplishmentIcon}>
                      <Target size={16} color="#22c55e" />
                    </View>
                    <View style={styles.accomplishmentContent}>
                      <Badge variant="outline">Target Completed</Badge>
                      <Text style={[styles.entryNote, { color: colors.text }]}>
                        {target.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Reflection Editor */}
        <ReflectionEditor periodLabel={periodLabel} onSave={handleSaveReflection} />

        {/* Past Reflections */}
        <Card>
          <CardContent>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Past Reflections</Text>

            {periodReflections.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No reflections for this period yet.
              </Text>
            ) : (
              <View style={styles.reflectionsList}>
                {periodReflections.map((reflection) => (
                  <ReflectionCard
                    key={reflection.id}
                    reflection={reflection}
                    onDelete={handleDeleteReflection}
                  />
                ))}
              </View>
            )}
          </CardContent>
        </Card>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  accomplishmentsList: {
    gap: 16,
  },
  accomplishmentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  accomplishmentIcon: {
    marginTop: 2,
  },
  accomplishmentContent: {
    flex: 1,
  },
  accomplishmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  practiceLabel: {
    fontSize: 12,
  },
  entryNote: {
    fontSize: 14,
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 12,
  },
  reflectionsList: {
    marginTop: 8,
  },
})
