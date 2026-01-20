import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useThemeStore } from '@/stores'

export type TimeRange = 'week' | 'month' | 'year'

interface PeriodSelectorProps {
  timeRange: TimeRange
  periodOffset: number
  periodLabel: string
  onTimeRangeChange: (range: TimeRange) => void
  onPeriodOffsetChange: (offset: number) => void
}

export function PeriodSelector({
  timeRange,
  periodOffset,
  periodLabel,
  onTimeRangeChange,
  onPeriodOffsetChange,
}: PeriodSelectorProps) {
  const { colors } = useThemeStore()

  const timeRanges: TimeRange[] = ['week', 'month', 'year']

  return (
    <View style={styles.container}>
      {/* Period Navigation */}
      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={[styles.navButton, { backgroundColor: colors.card }]}
          onPress={() => onPeriodOffsetChange(periodOffset - 1)}
        >
          <ChevronLeft size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.periodLabel, { color: colors.text }]}>
          {periodLabel}
        </Text>

        <TouchableOpacity
          style={[
            styles.navButton,
            { backgroundColor: colors.card },
            periodOffset === 0 && styles.navButtonDisabled,
          ]}
          onPress={() => onPeriodOffsetChange(Math.min(periodOffset + 1, 0))}
          disabled={periodOffset === 0}
        >
          <ChevronRight size={20} color={periodOffset === 0 ? colors.textMuted : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={[styles.rangeSelector, { backgroundColor: colors.card }]}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.rangeButton,
              timeRange === range && { backgroundColor: colors.primary },
            ]}
            onPress={() => onTimeRangeChange(range)}
          >
            <Text
              style={[
                styles.rangeButtonText,
                { color: timeRange === range ? '#ffffff' : colors.text },
              ]}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  periodLabel: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  rangeSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
})
