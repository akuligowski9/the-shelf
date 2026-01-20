import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useThemeStore } from '@/stores'
import { Badge } from '@/components/ui'
import { statusColors } from '@shared/colors'
import type { Target, Habit } from '@shared/types'

interface TargetEditSheetProps {
  target: Target | null
  habits: Habit[]
  onClose: () => void
  onSave: (updates: {
    name: string
    habit_id: number | null
    status: string
    start_date: string | null
    end_date: string | null
    planned_duration: string | null
    notes: string | null
  }) => void
  onDelete: (id: number) => void
}

type TargetStatus = 'active' | 'planned' | 'parked' | 'completed' | 'archived'

const statusOptions: { value: TargetStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'planned', label: 'Planned' },
  { value: 'parked', label: 'Parked' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
]

export function TargetEditSheet({
  target,
  habits,
  onClose,
  onSave,
  onDelete,
}: TargetEditSheetProps) {
  const { colors, isDark } = useThemeStore()
  const [name, setName] = useState('')
  const [habitId, setHabitId] = useState<number | null>(null)
  const [status, setStatus] = useState<TargetStatus>('planned')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [plannedDuration, setPlannedDuration] = useState('')
  const [notes, setNotes] = useState('')

  const snapPoints = useMemo(() => ['85%'], [])

  useEffect(() => {
    if (target) {
      setName(target.name)
      setHabitId((target as any).habit_id || null)
      setStatus(target.status as TargetStatus)
      setStartDate((target as any).start_date || '')
      setEndDate((target as any).end_date || '')
      setPlannedDuration((target as any).planned_duration || '')
      setNotes((target as any).notes || '')
    }
  }, [target])

  const handleSave = () => {
    onSave({
      name,
      habit_id: habitId,
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      planned_duration: plannedDuration || null,
      notes: notes || null,
    })
    onClose()
  }

  const handleDelete = () => {
    if (target) {
      onDelete(target.id)
      onClose()
    }
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

  if (!target) return null

  const activeHabits = habits.filter((h) => (h as any).type !== 'caution' && h.active)

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.text }]}>Edit Target</Text>

          {/* Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Target name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Habit */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Habit</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
            >
              <View style={styles.chipRow}>
                <TouchableOpacity
                  onPress={() => setHabitId(null)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: habitId === null
                        ? colors.primary + '20'
                        : colors.background,
                      borderColor: habitId === null
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: habitId === null ? colors.primary : colors.text },
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
                {activeHabits.map((habit) => (
                  <TouchableOpacity
                    key={habit.id}
                    onPress={() => setHabitId(habit.id)}
                  >
                    <Badge
                      variant="habit"
                      color={habit.color || 'forest'}
                      style={
                        habitId === habit.id
                          ? { borderWidth: 2, borderColor: colors.primary }
                          : undefined
                      }
                    >
                      {habit.name}
                    </Badge>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Status */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
            <View style={styles.statusRow}>
              {statusOptions.map((option) => {
                const isSelected = status === option.value
                const statusColor = statusColors[option.value as keyof typeof statusColors]?.main || colors.textMuted
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setStatus(option.value)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isSelected
                          ? statusColor + '20'
                          : colors.background,
                        borderColor: isSelected ? statusColor : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: statusColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isSelected ? statusColor : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Dates */}
          <View style={styles.dateRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          {/* Duration */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Planned Duration
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={plannedDuration}
              onChangeText={setPlannedDuration}
              placeholder="e.g., 2 weeks"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteButton, { borderColor: '#ef4444' }]}
            >
              <Text style={[styles.deleteButtonText, { color: '#ef4444' }]}>
                Delete Target
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actions: {
    gap: 12,
    paddingBottom: 40,
    paddingTop: 8,
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
})
