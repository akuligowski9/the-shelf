import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Sun, Moon, Coffee } from 'lucide-react-native'
import { useThemeStore } from '@/stores'

interface DayStatsProps {
  stats: {
    habits: number
    life: number
    caution: number
    minutes: number
  }
  hasPreparation?: boolean
  hasClosure?: boolean
  isRestDay?: boolean
}

export function DayStats({
  stats,
  hasPreparation,
  hasClosure,
  isRestDay,
}: DayStatsProps) {
  const { colors } = useThemeStore()

  const parts: React.ReactNode[] = []

  if (stats.habits > 0) {
    parts.push(
      <Text key="habits" style={[styles.text, { color: colors.text }]}>
        {stats.habits} {stats.habits === 1 ? 'habit' : 'habits'}
      </Text>
    )
  }

  if (stats.life > 0) {
    parts.push(
      <Text key="life" style={[styles.text, { color: colors.text }]}>
        {stats.life} life
      </Text>
    )
  }

  if (stats.caution > 0) {
    parts.push(
      <Text key="caution" style={[styles.text, { color: colors.text }]}>
        {stats.caution} caution
      </Text>
    )
  }

  parts.push(
    <Text key="minutes" style={[styles.text, { color: colors.text }]}>
      {stats.minutes} min
    </Text>
  )

  // Add separators between text parts
  const withSeparators = parts.reduce<React.ReactNode[]>((acc, part, i) => {
    if (i > 0) {
      acc.push(
        <Text key={`sep-${i}`} style={[styles.separator, { color: colors.textMuted }]}>
          {' · '}
        </Text>
      )
    }
    acc.push(part)
    return acc
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>{withSeparators}</View>
      <View style={styles.icons}>
        {hasPreparation && <Sun size={16} color="#f59e0b" />}
        {hasClosure && <Moon size={16} color="#6366f1" />}
        {isRestDay && <Coffee size={16} color="#f59e0b" />}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 14,
  },
  separator: {
    fontSize: 14,
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
