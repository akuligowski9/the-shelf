import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Moon, Clock, Activity, AlertTriangle } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { Button } from '@/components/ui'
import type { Closure } from '@shared/types'

interface DayStats {
  habits: number
  life: number
  caution: number
  minutes: number
}

interface HabitBreakdown {
  habit: string
  minutes: number
  count: number
}

interface ClosureSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (closure: Partial<Closure>) => void
  existingClosure?: Closure | null
  selectedDate: string
  dayStats?: DayStats
  habitBreakdown?: HabitBreakdown[]
}

function formatDuration(minutes: number): string {
  if (!minutes) return '0 min'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function ClosureSheet({
  isOpen,
  onClose,
  onSubmit,
  existingClosure,
  selectedDate,
  dayStats,
  habitBreakdown,
}: ClosureSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const { colors, isDark } = useThemeStore()

  // Form state
  const [note, setNote] = useState('')

  const snapPoints = useMemo(() => ['65%', '85%'], [])

  // Reset form
  const resetForm = useCallback(() => {
    setNote('')
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (existingClosure) {
      setNote(existingClosure.note || '')
    } else {
      resetForm()
    }
  }, [existingClosure, resetForm])

  // Handle open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

  const handleSubmit = () => {
    const closure: Partial<Closure> = {
      id: existingClosure?.id,
      scope: 'day',
      date: selectedDate,
      occurred_at: existingClosure?.occurred_at || new Date().toISOString(),
      note: note.trim() || null,
    }

    onSubmit(closure)
    resetForm()
    onClose()
  }

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  )

  const isEditing = !!existingClosure

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerIcon}>
            <Moon size={24} color="#6366f1" />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? 'Edit Closure' : 'Close the Day'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {isEditing
                ? 'Update your closing thoughts for the day.'
                : 'Mark the end of your day. This is about stopping cleanly, not perfectly.'}
            </Text>
          </View>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Day Stats Summary */}
          {dayStats && (
            <View
              style={[
                styles.statsCard,
                { backgroundColor: isDark ? '#262626' : '#f5f5f5' },
              ]}
            >
              <View style={styles.statsHeader}>
                <Text style={[styles.statsTitle, { color: colors.text }]}>
                  Today's Activity
                </Text>
                <View style={styles.statsDuration}>
                  <Clock size={16} color={colors.textMuted} />
                  <Text style={[styles.statsDurationText, { color: colors.text }]}>
                    {formatDuration(dayStats.minutes)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                {dayStats.habits > 0 && (
                  <View style={styles.statItem}>
                    <Activity size={16} color={colors.primary} />
                    <Text style={[styles.statText, { color: colors.text }]}>
                      {dayStats.habits} {dayStats.habits === 1 ? 'habit session' : 'habit sessions'}
                    </Text>
                  </View>
                )}
                {dayStats.caution > 0 && (
                  <View style={styles.statItem}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <Text style={[styles.statText, { color: '#ef4444' }]}>
                      {dayStats.caution} caution
                    </Text>
                  </View>
                )}
              </View>

              {/* Habit breakdown */}
              {habitBreakdown && habitBreakdown.length > 0 && (
                <View style={[styles.breakdownSection, { borderTopColor: colors.border }]}>
                  {habitBreakdown.map(({ habit, minutes }, index) => (
                    <View key={index} style={styles.breakdownRow}>
                      <Text style={[styles.breakdownHabit, { color: colors.textMuted }]}>
                        {habit}
                      </Text>
                      <Text style={[styles.breakdownTime, { color: colors.text }]}>
                        {formatDuration(minutes)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Note */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              Closing thoughts{' '}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>(optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={note}
              onChangeText={setNote}
              placeholder="How did today feel? What worked well? Anything to carry forward?"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </BottomSheetScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button variant="ghost" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Close Day'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerIcon: {
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsDurationText: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
  },
  breakdownSection: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownHabit: {
    fontSize: 14,
  },
  breakdownTime: {
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 120,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
})
