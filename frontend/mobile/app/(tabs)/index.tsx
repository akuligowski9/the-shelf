import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronRight } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useThemeStore, useHabitsStore, useEntriesStore } from '@/stores'
import {
  TargetCard,
  CompactTargetCard,
  HabitAccordion,
  ActivityStats,
  WeekMonthStats,
} from '@/components/shelf'
import { Card, CardContent } from '@/components/ui'
import { statusColors } from '@shared/colors'
import * as api from '@/api/offlineApi'

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function ShelfScreen() {
  const router = useRouter()
  const { colors } = useThemeStore()
  const {
    habits,
    targets,
    loadInitialData,
    getActiveHabits,
  } = useHabitsStore()
  const { entries, loadEntriesForRange } = useEntriesStore()

  const [refreshing, setRefreshing] = useState(false)
  const [showAllActive, setShowAllActive] = useState(false)
  const [dayPreparation, setDayPreparation] = useState<any>(null)
  const [dayClosure, setDayClosure] = useState<any>(null)

  const today = new Date()
  const todayKey = formatDateKey(today)

  const activeHabits = useMemo(() => getActiveHabits(), [habits])

  // Load data
  const loadData = useCallback(async () => {
    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)

    await Promise.all([
      loadInitialData(),
      loadEntriesForRange(formatDateKey(monthAgo), todayKey),
      api.getPreparation('day', todayKey).then(setDayPreparation).catch(() => null),
      api.getClosure('day', todayKey).then(setDayClosure).catch(() => null),
    ])
  }, [todayKey])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // Group targets by status
  const groupedTargets = useMemo(() => {
    const sortByPriority = (a: any, b: any) =>
      (a.sort_order ?? 999) - (b.sort_order ?? 999)

    return {
      active: targets.filter((t) => t.status === 'active').sort(sortByPriority),
      planned: targets.filter((t) => t.status === 'planned').sort(sortByPriority),
      parked: targets.filter((t) => t.status === 'parked').sort(sortByPriority),
      completed: targets.filter((t) => t.status === 'completed'),
      archived: targets.filter((t) => t.status === 'archived'),
    }
  }, [targets])

  // Calculate target progress
  const targetProgress = useMemo(() => {
    const progress: Record<number, { minutes: number; sessions: number }> = {}
    targets.forEach((target) => {
      const relevantEntries = entries.filter(
        (entry) => entry.target_id === target.id && !(entry as any).archived_at
      )
      if (relevantEntries.length > 0) {
        progress[target.id] = {
          minutes: relevantEntries.reduce(
            (sum, e) => sum + (e.duration_minutes || 0),
            0
          ),
          sessions: relevantEntries.length,
        }
      }
    })
    return progress
  }, [entries, targets])

  // Calculate stats
  const todayStats = useMemo(() => {
    const todayEntries = entries.filter((entry) => {
      const entryDate = (entry as any).occurred_at?.split('T')[0] || entry.date
      return entryDate === todayKey && !(entry as any).archived_at
    })
    const highlightEntries = todayEntries.filter((e) => (e as any).is_highlight)
    return {
      habits: todayEntries.filter((e) => e.type === 'habit').length,
      life: todayEntries.filter((e) => e.type === 'life').length,
      caution: todayEntries.filter((e) => e.type === 'caution').length,
      minutes: todayEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
      highlights: highlightEntries.length,
      highlightEntries: highlightEntries.map((e) => ({
        id: e.id,
        habit: (e as any).habit_name,
        type: e.type,
        practice: (e as any).practice_name,
        note: (e as any).note,
      })),
    }
  }, [entries, todayKey])

  const weekStats = useMemo(() => {
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date((entry as any).occurred_at || entry.created_at)
      return entryDate >= weekAgo && !(entry as any).archived_at
    })
    return {
      habits: weekEntries.filter((e) => e.type === 'habit').length,
      life: weekEntries.filter((e) => e.type === 'life').length,
      caution: weekEntries.filter((e) => e.type === 'caution').length,
      minutes: weekEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
      highlights: weekEntries.filter((e) => (e as any).is_highlight).length,
    }
  }, [entries, today])

  const monthStats = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date((entry as any).occurred_at || entry.created_at)
      return entryDate >= monthStart && !(entry as any).archived_at
    })
    return {
      habits: monthEntries.filter((e) => e.type === 'habit').length,
      life: monthEntries.filter((e) => e.type === 'life').length,
      caution: monthEntries.filter((e) => e.type === 'caution').length,
      minutes: monthEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
      highlights: monthEntries.filter((e) => (e as any).is_highlight).length,
    }
  }, [entries, today])

  const getHabitForTarget = (target: any) => {
    return habits.find((h) => h.id === target.habit_id)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>The Shelf</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/attention')}
          style={styles.manageButton}
        >
          <Text style={[styles.manageButtonText, { color: colors.textMuted }]}>
            Manage Targets
          </Text>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>
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
        {/* Active Targets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusColors.active.main },
              ]}
            />
            <Text style={[styles.sectionTitle, { color: statusColors.active.main }]}>
              Active
            </Text>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
              ({groupedTargets.active.length})
            </Text>
          </View>

          {groupedTargets.active.length === 0 ? (
            <Card variant="outline">
              <CardContent style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  No active targets
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  Drag a target here to activate it
                </Text>
              </CardContent>
            </Card>
          ) : (
            <View style={styles.targetList}>
              {(showAllActive
                ? groupedTargets.active
                : groupedTargets.active.slice(0, 5)
              ).map((target) => (
                <TargetCard
                  key={target.id}
                  target={target}
                  habit={getHabitForTarget(target)}
                  progress={targetProgress[target.id]}
                />
              ))}
              {groupedTargets.active.length > 5 && (
                <TouchableOpacity
                  onPress={() => setShowAllActive(!showAllActive)}
                  style={styles.viewMoreButton}
                >
                  <Text style={[styles.viewMoreText, { color: colors.textMuted }]}>
                    {showAllActive
                      ? 'Show less'
                      : `+${groupedTargets.active.length - 5} more → View all`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Target Shelf Grid (Planned, Parked, Completed, Archived) */}
        <Card>
          <CardContent>
            <View style={styles.shelfGrid}>
              {/* Planned */}
              <View style={styles.shelfColumn}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors.planned.main },
                    ]}
                  />
                  <Text style={{ color: statusColors.planned.main, fontSize: 13, fontWeight: '500' }}>
                    Planned
                  </Text>
                  <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                    ({groupedTargets.planned.length})
                  </Text>
                </View>
                {groupedTargets.planned.length === 0 ? (
                  <Text style={[styles.dropHint, { color: colors.textMuted }]}>
                    Drop here to plan
                  </Text>
                ) : (
                  <View style={styles.compactList}>
                    {groupedTargets.planned.slice(0, 5).map((target) => (
                      <CompactTargetCard
                        key={target.id}
                        target={target}
                        habit={getHabitForTarget(target)}
                        progress={targetProgress[target.id]}
                      />
                    ))}
                    {groupedTargets.planned.length > 5 && (
                      <TouchableOpacity onPress={() => router.push('/attention')}>
                        <Text style={[styles.viewMoreSmall, { color: colors.textMuted }]}>
                          +{groupedTargets.planned.length - 5} more
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Parked */}
              <View style={styles.shelfColumn}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors.parked.main },
                    ]}
                  />
                  <Text style={{ color: statusColors.parked.main, fontSize: 13, fontWeight: '500' }}>
                    Parked
                  </Text>
                  <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                    ({groupedTargets.parked.length})
                  </Text>
                </View>
                {groupedTargets.parked.length === 0 ? (
                  <Text style={[styles.dropHint, { color: colors.textMuted }]}>
                    Drop here to park
                  </Text>
                ) : (
                  <View style={styles.compactList}>
                    {groupedTargets.parked.slice(0, 5).map((target) => (
                      <CompactTargetCard
                        key={target.id}
                        target={target}
                        habit={getHabitForTarget(target)}
                        progress={targetProgress[target.id]}
                      />
                    ))}
                    {groupedTargets.parked.length > 5 && (
                      <TouchableOpacity onPress={() => router.push('/attention')}>
                        <Text style={[styles.viewMoreSmall, { color: colors.textMuted }]}>
                          +{groupedTargets.parked.length - 5} more
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Completed */}
              <View style={styles.shelfColumn}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors.completed.main },
                    ]}
                  />
                  <Text style={{ color: statusColors.completed.main, fontSize: 13, fontWeight: '500' }}>
                    Completed
                  </Text>
                  <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                    ({groupedTargets.completed.length})
                  </Text>
                </View>
                {groupedTargets.completed.length === 0 ? (
                  <Text style={[styles.dropHint, { color: colors.textMuted }]}>
                    Drop here to complete
                  </Text>
                ) : (
                  <View style={styles.compactList}>
                    {groupedTargets.completed.slice(0, 5).map((target) => (
                      <CompactTargetCard
                        key={target.id}
                        target={target}
                        habit={getHabitForTarget(target)}
                        progress={targetProgress[target.id]}
                      />
                    ))}
                    {groupedTargets.completed.length > 5 && (
                      <TouchableOpacity onPress={() => router.push('/attention')}>
                        <Text style={[styles.viewMoreSmall, { color: colors.textMuted }]}>
                          +{groupedTargets.completed.length - 5} more
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

              {/* Archived */}
              <View style={styles.shelfColumn}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusColors.archived.main },
                    ]}
                  />
                  <Text style={{ color: statusColors.archived.main, fontSize: 13, fontWeight: '500' }}>
                    Archived
                  </Text>
                  <Text style={[styles.sectionCount, { color: colors.textMuted }]}>
                    ({groupedTargets.archived.length})
                  </Text>
                </View>
                {groupedTargets.archived.length === 0 ? (
                  <Text style={[styles.dropHint, { color: colors.textMuted }]}>
                    Drop here to archive
                  </Text>
                ) : (
                  <View style={styles.compactList}>
                    {groupedTargets.archived.slice(0, 5).map((target) => (
                      <CompactTargetCard
                        key={target.id}
                        target={target}
                        habit={getHabitForTarget(target)}
                        progress={targetProgress[target.id]}
                      />
                    ))}
                    {groupedTargets.archived.length > 5 && (
                      <TouchableOpacity onPress={() => router.push('/attention')}>
                        <Text style={[styles.viewMoreSmall, { color: colors.textMuted }]}>
                          +{groupedTargets.archived.length - 5} more
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Habits Summary */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Habits</Text>
            <TouchableOpacity
              onPress={() => router.push('/attention')}
              style={styles.cardHeaderLink}
            >
              <Text style={[styles.cardHeaderLinkText, { color: colors.textMuted }]}>
                Go to Habits
              </Text>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <CardContent>
            <View style={styles.habitsCount}>
              <Text style={[styles.habitsCountNumber, { color: colors.text }]}>
                {activeHabits.length}
              </Text>
              <Text style={[styles.habitsCountLabel, { color: colors.textMuted }]}>
                / {habits.filter((h) => (h as any).type !== 'caution').length} active
              </Text>
            </View>
            <View style={styles.habitsList}>
              {activeHabits.map((habit) => (
                <HabitAccordion key={habit.id} habit={habit} />
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Activity</Text>
            <TouchableOpacity
              onPress={() => router.push('/today')}
              style={styles.cardHeaderLink}
            >
              <Text style={[styles.cardHeaderLinkText, { color: colors.textMuted }]}>
                Go to Today
              </Text>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <CardContent style={styles.activityContent}>
            <ActivityStats
              title="Today"
              stats={todayStats}
              hasPreparation={!!dayPreparation}
              hasClosure={!!dayClosure}
              highlights={todayStats.highlightEntries}
            />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <WeekMonthStats title="This Week" stats={weekStats} />
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <WeekMonthStats title="This Month" stats={monthStats} />
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    gap: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionCount: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  targetList: {
    gap: 10,
  },
  viewMoreButton: {
    paddingVertical: 8,
  },
  viewMoreText: {
    fontSize: 13,
  },
  shelfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  shelfColumn: {
    width: '47%',
    gap: 8,
  },
  dropHint: {
    fontSize: 12,
    paddingVertical: 8,
  },
  compactList: {
    gap: 6,
  },
  viewMoreSmall: {
    fontSize: 11,
    paddingTop: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardHeaderLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderLinkText: {
    fontSize: 13,
  },
  habitsCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  habitsCountNumber: {
    fontSize: 28,
    fontWeight: '600',
  },
  habitsCountLabel: {
    fontSize: 14,
  },
  habitsList: {
    gap: 0,
  },
  activityContent: {
    gap: 16,
  },
  separator: {
    height: 1,
  },
})
