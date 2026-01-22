import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus, Sun, Moon, Pencil } from 'lucide-react-native'
import { useThemeStore, useHabitsStore, useEntriesStore } from '@/stores'
import { DateNavigator, SwipeableEntryCard, DayStats, EntryFormSheet, PreparationSheet, ClosureSheet } from '@/components/today'
import { Card, CardContent, Button, SkeletonList, useToast } from '@/components/ui'
import { useErrorHandler } from '@/hooks'
import * as api from '@/api/offlineApi'
import type { Entry } from '@shared/types'

// Format date to YYYY-MM-DD
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function TodayScreen() {
  const { colors, isDark } = useThemeStore()
  const { habits, isLoading: habitsLoading, loadInitialData } = useHabitsStore()
  const { entries, createEntry, updateEntry, deleteEntry, loadEntriesForRange, isLoading: entriesLoading } = useEntriesStore()
  const { handleError, handleSuccess } = useErrorHandler()

  // Date state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  // Entry form state
  const [entryFormOpen, setEntryFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  // Preparation and closure state
  const [dayPreparation, setDayPreparation] = useState<any>(null)
  const [dayClosure, setDayClosure] = useState<any>(null)
  const [preparationSheetOpen, setPreparationSheetOpen] = useState(false)
  const [closureSheetOpen, setClosureSheetOpen] = useState(false)

  const dateKey = formatDateKey(selectedDate)

  // Check if viewing today
  const isToday = useMemo(() => {
    const today = new Date()
    return selectedDate.toDateString() === today.toDateString()
  }, [selectedDate])

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  // Load data on mount and date change
  const loadData = useCallback(async () => {
    // Load entries for a week around selected date
    const startDate = new Date(selectedDate)
    startDate.setDate(startDate.getDate() - 7)
    const endDate = new Date(selectedDate)
    endDate.setDate(endDate.getDate() + 1)

    await Promise.all([
      loadEntriesForRange(formatDateKey(startDate), formatDateKey(endDate)),
      api.getPreparation('day', dateKey).then(setDayPreparation).catch(() => null),
      api.getClosure('day', dateKey).then(setDayClosure).catch(() => null),
    ])
  }, [selectedDate, dateKey, loadEntriesForRange])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  // Filter entries for selected date
  const dayEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        const entryDate = (entry as any).occurred_at?.split('T')[0] || entry.date
        return entryDate === dateKey && !(entry as any).archived_at
      })
      .sort((a, b) => {
        const aTime = new Date((a as any).occurred_at || a.created_at).getTime()
        const bTime = new Date((b as any).occurred_at || b.created_at).getTime()
        return bTime - aTime
      })
  }, [entries, dateKey])

  // Compute day stats
  const dayStats = useMemo(() => {
    return {
      habits: dayEntries.filter((e) => e.type === 'habit').length,
      life: dayEntries.filter((e) => e.type === 'life').length,
      caution: dayEntries.filter((e) => e.type === 'caution').length,
      minutes: dayEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
    }
  }, [dayEntries])

  // Compute habit breakdown for closure modal
  const habitBreakdown = useMemo(() => {
    const habitEntries = dayEntries.filter((e) => e.type === 'habit' && e.habit_id)
    const breakdown: Record<number, { habit: string; minutes: number; count: number }> = {}

    habitEntries.forEach((entry) => {
      const habit = habits.find((h) => h.id === entry.habit_id)
      if (habit) {
        if (!breakdown[habit.id]) {
          breakdown[habit.id] = { habit: habit.name, minutes: 0, count: 0 }
        }
        breakdown[habit.id].minutes += entry.duration_minutes || 0
        breakdown[habit.id].count += 1
      }
    })

    return Object.values(breakdown).sort((a, b) => b.minutes - a.minutes)
  }, [dayEntries, habits])

  const handleEntryPress = (entry: Entry) => {
    setEditingEntry(entry)
    setEntryFormOpen(true)
  }

  const handleAddEntry = () => {
    setEditingEntry(null)
    setEntryFormOpen(true)
  }

  const handleEntryFormClose = () => {
    setEntryFormOpen(false)
    setEditingEntry(null)
  }

  const handleEntrySubmit = async (entryData: Partial<Entry>) => {
    try {
      if (editingEntry) {
        const result = await updateEntry(editingEntry.id, entryData)
        if (result.success) {
          handleSuccess('Entry updated')
          handleEntryFormClose()
        } else if (result.error) {
          handleError(new Error(result.error), 'Update entry')
        }
      } else {
        const result = await createEntry({
          ...entryData,
          date: dateKey,
        } as any)
        if (result.success) {
          handleSuccess('Entry added')
          handleEntryFormClose()
        } else if (result.error) {
          handleError(new Error(result.error), 'Create entry')
        }
      }
    } catch (error) {
      handleError(error, editingEntry ? 'Update entry' : 'Create entry')
    }
  }

  const handleArchiveEntry = async (entry: Entry) => {
    try {
      const result = await updateEntry(entry.id, { archived_at: new Date().toISOString() })
      if (result.success) {
        handleSuccess('Entry archived')
      } else if (result.error) {
        handleError(new Error(result.error), 'Archive entry')
      }
    } catch (error) {
      handleError(error, 'Archive entry')
    }
  }

  const handleDeleteEntry = async (entry: Entry) => {
    try {
      const result = await deleteEntry(entry.id)
      if (result.success) {
        handleSuccess('Entry deleted')
      } else if (result.error) {
        handleError(new Error(result.error), 'Delete entry')
      }
    } catch (error) {
      handleError(error, 'Delete entry')
    }
  }

  const handleToggleHighlight = async (entry: Entry) => {
    try {
      await api.updateEntry(entry.id, { is_highlight: !entry.is_highlight })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle highlight:', error)
      showError('Failed to update entry')
    }
  }

  const handleOpenPreparation = () => {
    setPreparationSheetOpen(true)
  }

  const handleOpenClosure = () => {
    setClosureSheetOpen(true)
  }

  const handlePreparationSubmit = async (preparationData: any) => {
    try {
      await api.savePreparation(preparationData)
      showSuccess(dayPreparation ? 'Preparation updated' : 'Day started')
      await loadData()
    } catch (error) {
      console.error('Failed to save preparation:', error)
      showError('Failed to save preparation')
    }
  }

  const handleClosureSubmit = async (closureData: any) => {
    try {
      await api.saveClosure(closureData)
      showSuccess(dayClosure ? 'Closure updated' : 'Day closed')
      await loadData()
    } catch (error) {
      console.error('Failed to save closure:', error)
      showError('Failed to save closure')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {isToday ? 'Today' : formatDateDisplay(selectedDate)}
          </Text>
          {isToday && (
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {formatDateDisplay(selectedDate)}
            </Text>
          )}
        </View>
        <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />
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
        {/* Add Entry Button */}
        <View style={styles.addButtonContainer}>
          <Button onPress={handleAddEntry} size="md">
            <View style={styles.addButtonContent}>
              <Plus size={16} color={isDark ? '#1a1a1a' : '#ffffff'} />
              <Text style={[styles.addButtonText, { color: isDark ? '#1a1a1a' : '#ffffff' }]}>
                Add Entry
              </Text>
            </View>
          </Button>
        </View>

        {/* Day Preparation Card */}
        <Card
          style={
            dayPreparation
              ? [
                  styles.promptCard,
                  {
                    backgroundColor: isDark ? '#3d2f0a' : '#fef3c7',
                    borderWidth: 1,
                    borderColor: '#f59e0b',
                  },
                ]
              : styles.promptCard
          }
        >
          <CardContent>
            {dayPreparation ? (
              <View style={styles.promptContent}>
                <View style={styles.promptHeader}>
                  <View style={styles.promptTitle}>
                    <Sun size={16} color="#f59e0b" />
                    <Text style={[styles.promptLabel, { color: colors.text }]}>
                      Day Started
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleOpenPreparation}>
                    <Pencil size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {dayPreparation.note && (
                  <Text style={[styles.promptNote, { color: colors.textMuted }]}>
                    {dayPreparation.note}
                  </Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.promptButton}
                onPress={handleOpenPreparation}
              >
                <Sun size={16} color="#f59e0b" />
                <Text style={[styles.promptButtonText, { color: colors.text }]}>
                  {isToday ? 'Start your day with intention?' : 'Add preparation note'}
                </Text>
              </TouchableOpacity>
            )}
          </CardContent>
        </Card>

        {/* Day Stats */}
        <DayStats
          stats={dayStats}
          hasPreparation={!!dayPreparation}
          hasClosure={!!dayClosure}
          isRestDay={dayPreparation?.rest_day}
        />

        {/* Entry List */}
        <View style={styles.entryList}>
          {entriesLoading && dayEntries.length === 0 ? (
            <SkeletonList count={3} />
          ) : dayEntries.length === 0 ? (
            <Card>
              <CardContent style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  {isToday ? 'No entries yet today.' : 'No entries for this day.'}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                  {isToday
                    ? 'Add your first entry to get started.'
                    : 'You can still add entries to past days.'}
                </Text>
              </CardContent>
            </Card>
          ) : (
            dayEntries.map((entry) => (
              <SwipeableEntryCard
                key={entry.id}
                entry={entry}
                onPress={() => handleEntryPress(entry)}
                onArchive={() => handleArchiveEntry(entry)}
                onDelete={() => handleDeleteEntry(entry)}
                onToggleHighlight={() => handleToggleHighlight(entry)}
              />
            ))
          )}
        </View>

        {/* Day Closure Card */}
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <Card
          style={
            dayClosure
              ? [
                  styles.promptCard,
                  {
                    backgroundColor: isDark ? '#1e1b4b' : '#e0e7ff',
                    borderWidth: 1,
                    borderColor: '#6366f1',
                  },
                ]
              : styles.promptCard
          }
        >
          <CardContent>
            {dayClosure ? (
              <View style={styles.promptContent}>
                <View style={styles.promptHeader}>
                  <View style={styles.promptTitle}>
                    <Moon size={16} color="#6366f1" />
                    <Text style={[styles.promptLabel, { color: colors.text }]}>
                      Day Closed
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleOpenClosure}>
                    <Pencil size={14} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {dayClosure.note && (
                  <Text style={[styles.promptNote, { color: colors.textMuted }]}>
                    {dayClosure.note}
                  </Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.promptButton}
                onPress={handleOpenClosure}
              >
                <Moon size={16} color="#6366f1" />
                <Text style={[styles.promptButtonText, { color: colors.text }]}>
                  {isToday ? 'Close the day?' : 'Add closure note'}
                </Text>
              </TouchableOpacity>
            )}
          </CardContent>
        </Card>
      </ScrollView>

      {/* Entry Form Sheet */}
      <EntryFormSheet
        isOpen={entryFormOpen}
        onClose={handleEntryFormClose}
        onSubmit={handleEntrySubmit}
        editingEntry={editingEntry}
        selectedDate={dateKey}
      />

      {/* Preparation Sheet */}
      <PreparationSheet
        isOpen={preparationSheetOpen}
        onClose={() => setPreparationSheetOpen(false)}
        onSubmit={handlePreparationSubmit}
        existingPreparation={dayPreparation}
        selectedDate={dateKey}
      />

      {/* Closure Sheet */}
      <ClosureSheet
        isOpen={closureSheetOpen}
        onClose={() => setClosureSheetOpen(false)}
        onSubmit={handleClosureSubmit}
        existingClosure={dayClosure}
        selectedDate={dateKey}
        dayStats={dayStats}
        habitBreakdown={habitBreakdown}
      />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  addButtonContainer: {
    alignItems: 'flex-end',
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  promptCard: {
    overflow: 'hidden',
  },
  promptContent: {
    gap: 8,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promptTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  promptNote: {
    fontSize: 13,
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  promptButtonText: {
    fontSize: 14,
  },
  entryList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
  },
  separator: {
    height: 1,
    marginVertical: 8,
  },
})
