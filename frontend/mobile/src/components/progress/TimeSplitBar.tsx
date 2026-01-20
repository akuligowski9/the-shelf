import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useThemeStore } from '@/stores'
import { getHabitColor } from '@shared/colors'

interface TimeSplitItem {
  name: string
  color: string
  hours: number
  percent: number
}

interface TimeSplitBarProps {
  items: TimeSplitItem[]
  totalHours: number
  lifeHours?: number
  lifePercent?: number
  showLife?: boolean
}

export function TimeSplitBar({
  items,
  totalHours,
  lifeHours = 0,
  lifePercent = 0,
  showLife = true,
}: TimeSplitBarProps) {
  const { colors, isDark } = useThemeStore()

  const getBarColor = (colorKey: string) => {
    const colorSet = getHabitColor(colorKey)
    return colorSet.main
  }

  const lifeColor = '#3b82f6'

  // Filter items with percent > 0
  const visibleItems = items.filter((item) => item.percent > 0)

  return (
    <View style={styles.container}>
      {/* Stacked Bar */}
      <View style={[styles.bar, { backgroundColor: colors.border }]}>
        {visibleItems.map((item) => (
          <View
            key={item.name}
            style={[
              styles.barSegment,
              {
                width: `${item.percent}%`,
                backgroundColor: getBarColor(item.color),
              },
            ]}
          />
        ))}
        {showLife && lifePercent > 0 && (
          <View
            style={[
              styles.barSegment,
              {
                width: `${lifePercent}%`,
                backgroundColor: lifeColor,
              },
            ]}
          />
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {visibleItems.map((item) => (
          <View key={item.name} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: getBarColor(item.color) }]}
            />
            <Text style={[styles.legendName, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.legendValue, { color: colors.textMuted }]}>
              {item.percent}%
            </Text>
          </View>
        ))}
        {showLife && lifePercent > 0 && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: lifeColor }]} />
            <Text style={[styles.legendName, { color: colors.text }]}>Life</Text>
            <Text style={[styles.legendValue, { color: colors.textMuted }]}>
              {lifePercent}%
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  bar: {
    height: 16,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 13,
  },
  legendValue: {
    fontSize: 13,
  },
})
