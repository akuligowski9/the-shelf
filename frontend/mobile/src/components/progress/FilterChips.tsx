import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useThemeStore } from '@/stores'
import { getHabitColor } from '@shared/colors'
import type { Habit } from '@shared/types'

interface FilterChipsProps {
  habits: Habit[]
  enabledFilters: Set<string>
  onToggleFilter: (filterName: string) => void
  includeLife?: boolean
}

export function FilterChips({
  habits,
  enabledFilters,
  onToggleFilter,
  includeLife = true,
}: FilterChipsProps) {
  const { colors, isDark } = useThemeStore()

  const getChipStyle = (colorKey: string, isEnabled: boolean) => {
    const colorSet = getHabitColor(colorKey)
    if (isEnabled) {
      return {
        backgroundColor: isDark ? colorSet.darkLight : colorSet.light,
        borderColor: colorSet.main,
      }
    }
    return {
      backgroundColor: 'transparent',
      borderColor: colors.border,
    }
  }

  const getTextColor = (colorKey: string, isEnabled: boolean) => {
    if (!isEnabled) return colors.textMuted
    const colorSet = getHabitColor(colorKey)
    return colorSet.main
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {habits.map((habit) => {
        const isEnabled = enabledFilters.has(habit.name)
        const chipStyle = getChipStyle(habit.color, isEnabled)
        const textColor = getTextColor(habit.color, isEnabled)

        return (
          <TouchableOpacity
            key={habit.id}
            style={[
              styles.chip,
              chipStyle,
              !isEnabled && styles.chipDisabled,
            ]}
            onPress={() => onToggleFilter(habit.name)}
          >
            <Text style={[styles.chipText, { color: textColor }]}>
              {habit.name}
            </Text>
          </TouchableOpacity>
        )
      })}

      {includeLife && (
        <TouchableOpacity
          style={[
            styles.chip,
            enabledFilters.has('Life')
              ? {
                  backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
                  borderColor: '#3b82f6',
                }
              : {
                  backgroundColor: 'transparent',
                  borderColor: colors.border,
                },
            !enabledFilters.has('Life') && styles.chipDisabled,
          ]}
          onPress={() => onToggleFilter('Life')}
        >
          <Text
            style={[
              styles.chipText,
              {
                color: enabledFilters.has('Life') ? '#3b82f6' : colors.textMuted,
              },
            ]}
          >
            Life
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
})
