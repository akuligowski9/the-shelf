import React from 'react'
import { View, StyleSheet, Dimensions, Text } from 'react-native'
import { useThemeStore } from '@/stores'
import { getHabitColor } from '@shared/colors'
import type { Habit } from '@shared/types'
import Svg, { Polyline, Circle } from 'react-native-svg'

interface ChartDataPoint {
  date: string
  dateLabel: string
  life: number
  [habitName: string]: string | number
}

interface PatternsChartProps {
  data: ChartDataPoint[]
  habits: Habit[]
  enabledFilters: Set<string>
  includeLife?: boolean
  timeRange: 'week' | 'month' | 'year'
}

export function PatternsChart({
  data,
  habits,
  enabledFilters,
  includeLife = true,
  timeRange,
}: PatternsChartProps) {
  const { colors, isDark } = useThemeStore()
  const screenWidth = Dimensions.get('window').width - 88

  const getLineColor = (colorKey: string) => {
    const colorSet = getHabitColor(colorKey)
    return colorSet.main
  }

  const lifeColor = '#3b82f6'

  // Filter habits that are enabled
  const enabledHabits = habits.filter((h) => enabledFilters.has(h.name))

  // Calculate max value for scaling
  let maxValue = 0
  data.forEach((d) => {
    enabledHabits.forEach((h) => {
      const val = (d[h.name] as number) || 0
      if (val > maxValue) maxValue = val
    })
    if (includeLife && enabledFilters.has('Life')) {
      if (d.life > maxValue) maxValue = d.life
    }
  })
  maxValue = maxValue || 1

  if (data.length === 0 || enabledHabits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height: 200 }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No data to display
        </Text>
      </View>
    )
  }

  const chartHeight = 160
  const padding = 10

  // Generate points for each line
  const generatePoints = (values: number[]) => {
    return values
      .map((val, i) => {
        const x = padding + (i * (screenWidth - padding * 2)) / (values.length - 1 || 1)
        const y = chartHeight - padding - ((val / maxValue) * (chartHeight - padding * 2))
        return `${x},${y}`
      })
      .join(' ')
  }

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
        <View style={[styles.gridLine, { borderColor: colors.border, top: padding }]} />
        <View style={[styles.gridLine, { borderColor: colors.border, top: chartHeight / 2 }]} />
        <View style={[styles.gridLine, { borderColor: colors.border, top: chartHeight - padding }]} />

        <Svg width={screenWidth} height={chartHeight}>
          {/* Lines for each habit */}
          {enabledHabits.map((habit) => {
            const values = data.map((d) => (d[habit.name] as number) || 0)
            const hasData = values.some((v) => v > 0)
            if (!hasData) return null

            return (
              <Polyline
                key={habit.id}
                points={generatePoints(values)}
                fill="none"
                stroke={getLineColor(habit.color)}
                strokeWidth="2"
              />
            )
          })}

          {/* Life line */}
          {includeLife && enabledFilters.has('Life') && (
            <Polyline
              points={generatePoints(data.map((d) => d.life || 0))}
              fill="none"
              stroke={lifeColor}
              strokeWidth="2"
            />
          )}
        </Svg>
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
    paddingTop: 10,
    paddingBottom: 30,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
})
