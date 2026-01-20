import React from 'react'
import { View, StyleSheet, Dimensions, Text } from 'react-native'
import { useThemeStore } from '@/stores'
import { getHabitColor } from '@shared/colors'
import type { Habit } from '@shared/types'

interface ChartDataPoint {
  date: string
  dateLabel: string
  life: number
  [habitName: string]: string | number
}

interface BalanceChartProps {
  data: ChartDataPoint[]
  habits: Habit[]
  enabledFilters: Set<string>
  includeLife?: boolean
  timeRange: 'week' | 'month' | 'year'
}

export function BalanceChart({
  data,
  habits,
  enabledFilters,
  includeLife = true,
  timeRange,
}: BalanceChartProps) {
  const { colors, isDark } = useThemeStore()
  const screenWidth = Dimensions.get('window').width - 48

  const getBarColor = (colorKey: string) => {
    const colorSet = getHabitColor(colorKey)
    return colorSet.main
  }

  const lifeColor = '#3b82f6'

  // Filter habits that are enabled
  const enabledHabits = habits.filter((h) => enabledFilters.has(h.name))

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.map((d) => {
      let total = 0
      enabledHabits.forEach((h) => {
        total += (d[h.name] as number) || 0
      })
      if (includeLife && enabledFilters.has('Life')) {
        total += d.life || 0
      }
      return total
    }),
    1 // Minimum of 1 to avoid division by zero
  )

  if (data.length === 0 || enabledHabits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height: 200 }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No data to display
        </Text>
      </View>
    )
  }

  // Simplified bar chart using native Views
  const barWidth = Math.max(4, (screenWidth - data.length * 2) / data.length)

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        <Text style={[styles.axisLabel, { color: colors.textMuted }]}>{maxValue.toFixed(1)}h</Text>
        <Text style={[styles.axisLabel, { color: colors.textMuted }]}>{(maxValue / 2).toFixed(1)}h</Text>
        <Text style={[styles.axisLabel, { color: colors.textMuted }]}>0h</Text>
      </View>

      {/* Chart area */}
      <View style={styles.chartArea}>
        {/* Grid lines */}
        <View style={[styles.gridLine, { borderColor: colors.border, top: 0 }]} />
        <View style={[styles.gridLine, { borderColor: colors.border, top: '50%' }]} />
        <View style={[styles.gridLine, { borderColor: colors.border, top: '100%' }]} />

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((d, i) => {
            // Calculate stacked segments
            const segments: { color: string; height: number }[] = []

            enabledHabits.forEach((h) => {
              const value = (d[h.name] as number) || 0
              if (value > 0) {
                segments.push({
                  color: getBarColor(h.color),
                  height: (value / maxValue) * 100,
                })
              }
            })

            if (includeLife && enabledFilters.has('Life') && d.life > 0) {
              segments.push({
                color: lifeColor,
                height: (d.life / maxValue) * 100,
              })
            }

            return (
              <View key={i} style={[styles.barColumn, { width: barWidth }]}>
                <View style={styles.stackedBar}>
                  {segments.map((seg, j) => (
                    <View
                      key={j}
                      style={[
                        styles.barSegment,
                        {
                          height: `${seg.height}%`,
                          backgroundColor: seg.color,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 200,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 20,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    paddingBottom: 20,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barColumn: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  stackedBar: {
    width: '80%',
    flexDirection: 'column-reverse',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    overflow: 'hidden',
  },
  barSegment: {
    width: '100%',
  },
})
