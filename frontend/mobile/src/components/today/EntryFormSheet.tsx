import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useThemeStore, useHabitsStore } from '@/stores'
import { Button, Input } from '@/components/ui'
import type { Entry } from '@shared/types'

interface EntryFormSheetProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (entry: Partial<Entry>) => void
  editingEntry?: Entry | null
  selectedDate: string
}

const ENTRY_TYPES = [
  { value: 'habit', label: 'Habit' },
  { value: 'life', label: 'Life' },
  { value: 'caution', label: 'Caution' },
]

export function EntryFormSheet({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
  selectedDate,
}: EntryFormSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null)
  const { colors, isDark } = useThemeStore()
  const {
    habits,
    practices,
    targets,
    getActiveHabits,
    getPracticesForHabit,
    getActionsForPractice,
  } = useHabitsStore()

  // Form state
  const [entryType, setEntryType] = useState<'habit' | 'life' | 'caution'>('habit')
  const [habitId, setHabitId] = useState<number | null>(null)
  const [practiceId, setPracticeId] = useState<number | null>(null)
  const [targetId, setTargetId] = useState<number | null>(null)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const [durationMinutes, setDurationMinutes] = useState('')
  const [note, setNote] = useState('')

  const snapPoints = useMemo(() => ['75%', '90%'], [])

  // Active habits
  const activeHabits = useMemo(() => getActiveHabits(), [habits])

  // Practices for selected habit
  const habitPractices = useMemo(() => {
    if (!habitId) return []
    return getPracticesForHabit(habitId).filter((p) => p.active)
  }, [habitId, practices])

  // Targets for selected habit
  const habitTargets = useMemo(() => {
    if (!habitId) return []
    return targets.filter((t) => (t as any).habit_id === habitId)
  }, [habitId, targets])

  // Actions for selected practice
  const practiceActions = useMemo(() => {
    if (!practiceId) return []
    const habit = habits.find((h) => h.id === habitId)
    if (!(habit as any)?.track_actions) return []
    return getActionsForPractice(practiceId).filter((a) => a.active)
  }, [practiceId, habitId, habits])

  // Selected habit object
  const selectedHabit = useMemo(() => {
    return habits.find((h) => h.id === habitId)
  }, [habitId, habits])

  // Selected practice object
  const selectedPractice = useMemo(() => {
    return practices.find((p) => p.id === practiceId)
  }, [practiceId, practices])

  // Selected target object
  const selectedTarget = useMemo(() => {
    return targets.find((t) => t.id === targetId)
  }, [targetId, targets])

  // Reset form
  const resetForm = useCallback(() => {
    setEntryType('habit')
    setHabitId(null)
    setPracticeId(null)
    setTargetId(null)
    setSelectedActions([])
    setDurationMinutes('')
    setNote('')
  }, [])

  // Populate form when editing
  useEffect(() => {
    if (editingEntry) {
      setEntryType(editingEntry.type)
      setDurationMinutes(editingEntry.duration_minutes?.toString() || '')
      setNote(editingEntry.note || '')

      if (editingEntry.type === 'habit' && editingEntry.habit_id) {
        setHabitId(editingEntry.habit_id)
        if (editingEntry.practice_id) {
          setPracticeId(editingEntry.practice_id)
        }
        if (editingEntry.target_id) {
          setTargetId(editingEntry.target_id)
        }
      }
    } else {
      resetForm()
    }
  }, [editingEntry, resetForm])

  // Handle open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

  const handleSubmit = () => {
    const entry: Partial<Entry> = {
      id: editingEntry?.id,
      type: entryType,
      date: selectedDate,
      duration_minutes: durationMinutes ? Number(durationMinutes) : null,
      note: note.trim() || null,
    }

    if (entryType === 'habit' && habitId) {
      entry.habit_id = habitId
      entry.practice_id = practiceId
      entry.target_id = targetId
      entry.actions = selectedActions.length > 0 ? selectedActions as any : null
    }

    onSubmit(entry)
    resetForm()
    onClose()
  }

  const toggleAction = (actionName: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionName)
        ? prev.filter((a) => a !== actionName)
        : [...prev, actionName]
    )
  }

  const canSubmit = () => {
    if (entryType === 'habit') {
      return habitId !== null
    }
    return note.trim() !== '' || durationMinutes !== ''
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {editingEntry ? 'Edit Entry' : 'Add Entry'}
          </Text>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Entry Type Selector */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Type</Text>
            <View style={styles.typeButtons}>
              {ENTRY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => {
                    setEntryType(type.value as any)
                    setHabitId(null)
                    setPracticeId(null)
                    setSelectedActions([])
                  }}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        entryType === type.value ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color:
                          entryType === type.value
                            ? isDark
                              ? '#1a1a1a'
                              : '#ffffff'
                            : colors.text,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Habit Selector */}
          {entryType === 'habit' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Habit</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {activeHabits.map((habit) => (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => {
                      setHabitId(habit.id)
                      setPracticeId(null)
                      setSelectedActions([])
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          habitId === habit.id ? colors.primary : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            habitId === habit.id
                              ? isDark
                                ? '#1a1a1a'
                                : '#ffffff'
                              : colors.text,
                        },
                      ]}
                    >
                      {habit.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Practice Selector */}
          {entryType === 'habit' && habitId && habitPractices.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Practice{' '}
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  (optional)
                </Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {habitPractices.map((practice) => (
                  <TouchableOpacity
                    key={practice.id}
                    onPress={() => {
                      setPracticeId(
                        practiceId === practice.id ? null : practice.id
                      )
                      setSelectedActions([])
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          practiceId === practice.id
                            ? colors.primary
                            : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            practiceId === practice.id
                              ? isDark
                                ? '#1a1a1a'
                                : '#ffffff'
                              : colors.text,
                        },
                      ]}
                    >
                      {practice.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Target Selector */}
          {entryType === 'habit' && habitId && habitTargets.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Target{' '}
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  (optional)
                </Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScroll}
              >
                {habitTargets.map((target) => (
                  <TouchableOpacity
                    key={target.id}
                    onPress={() => {
                      setTargetId(targetId === target.id ? null : target.id)
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          targetId === target.id ? colors.primary : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            targetId === target.id
                              ? isDark
                                ? '#1a1a1a'
                                : '#ffffff'
                              : colors.text,
                        },
                      ]}
                    >
                      {target.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Actions */}
          {entryType === 'habit' && practiceId && practiceActions.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                What did you work on?
              </Text>
              <View style={styles.actionsGrid}>
                {practiceActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={() => toggleAction(action.name)}
                    style={[
                      styles.actionChip,
                      {
                        backgroundColor: selectedActions.includes(action.name)
                          ? colors.primary
                          : colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: selectedActions.includes(action.name)
                            ? isDark
                              ? '#1a1a1a'
                              : '#ffffff'
                            : colors.text,
                        },
                      ]}
                    >
                      {action.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Duration */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              Duration{' '}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                (minutes, optional)
              </Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              placeholder="e.g., 30"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>
              Note{' '}
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                (optional)
              </Text>
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
              placeholder={
                entryType === 'life'
                  ? 'What happened?'
                  : entryType === 'habit'
                  ? 'Session notes...'
                  : 'Additional context...'
              }
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </BottomSheetScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button variant="ghost" onPress={onClose}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} disabled={!canSubmit()}>
            {editingEntry ? 'Save Changes' : 'Add Entry'}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipScroll: {
    flexGrow: 0,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
})
