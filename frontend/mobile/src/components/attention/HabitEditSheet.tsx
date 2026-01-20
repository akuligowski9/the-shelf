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
import { Button, Input } from '@/components/ui'
import { habitColors, colorOptions } from '@shared/colors'
import type { Habit } from '@shared/types'

interface HabitEditSheetProps {
  habit: Habit | null
  onClose: () => void
  onSave: (updates: {
    name: string
    color: string
    target_minutes?: number
    track_actions: boolean
  }) => void
  onToggleActive: () => void
}

export function HabitEditSheet({
  habit,
  onClose,
  onSave,
  onToggleActive,
}: HabitEditSheetProps) {
  const { colors, isDark } = useThemeStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState('forest')
  const [targetMinutes, setTargetMinutes] = useState<string>('')
  const [trackActions, setTrackActions] = useState(false)

  const snapPoints = useMemo(() => ['70%'], [])

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setColor(habit.color || 'forest')
      setTargetMinutes((habit as any).target_minutes?.toString() || '')
      setTrackActions((habit as any).track_actions || false)
    }
  }, [habit])

  const handleSave = () => {
    onSave({
      name,
      color,
      target_minutes: targetMinutes ? parseInt(targetMinutes) : undefined,
      track_actions: trackActions,
    })
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

  if (!habit) return null

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
          <Text style={[styles.title, { color: colors.text }]}>Edit Habit</Text>

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
              placeholder="Habit name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Color */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Color</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.colorScroll}
            >
              <View style={styles.colorRow}>
                {colorOptions.map((colorOption) => {
                  const isSelected = color === colorOption.key
                  return (
                    <TouchableOpacity
                      key={colorOption.key}
                      onPress={() => setColor(colorOption.key)}
                      style={[
                        styles.colorOption,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : 'transparent',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.colorDot,
                          { backgroundColor: colorOption.main },
                        ]}
                      />
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
          </View>

          {/* Target Minutes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Daily Target (minutes)
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
              value={targetMinutes}
              onChangeText={setTargetMinutes}
              placeholder="e.g., 60"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          {/* Track Actions Toggle */}
          <TouchableOpacity
            onPress={() => setTrackActions(!trackActions)}
            style={[
              styles.toggleRow,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.toggleLabel, { color: colors.text }]}>
              Track Actions
            </Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: trackActions
                    ? colors.primary
                    : colors.textMuted,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  {
                    backgroundColor: '#fff',
                    transform: [{ translateX: trackActions ? 18 : 2 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                onToggleActive()
                onClose()
              }}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                {habit.active ? 'Deactivate' : 'Activate'}
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
    marginBottom: 20,
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
  colorScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  actions: {
    gap: 12,
    paddingBottom: 40,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
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
