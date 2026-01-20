import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useThemeStore } from '@/stores'
import { Card, CardContent } from '@/components/ui'

interface StatItem {
  value: string | number
  label: string
  subLabel?: string
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4 | 5
}

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  const { colors } = useThemeStore()

  return (
    <View style={[styles.grid, { gap: columns <= 3 ? 12 : 8 }]}>
      {stats.map((stat, index) => (
        <View
          key={index}
          style={[
            styles.statItem,
            { width: `${100 / columns - 2}%` },
          ]}
        >
          <Text style={[styles.statValue, { color: colors.text }]}>
            {stat.value}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {stat.label}
          </Text>
          {stat.subLabel && (
            <Text style={[styles.statSubLabel, { color: colors.textMuted }]}>
              {stat.subLabel}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}

interface StatsCardProps {
  title: string
  stats: StatItem[]
  columns?: 2 | 3 | 4 | 5
}

export function StatsCard({ title, stats, columns = 3 }: StatsCardProps) {
  const { colors } = useThemeStore()

  return (
    <Card>
      <CardContent style={styles.cardContent}>
        <Text style={[styles.cardTitle, { color: colors.textMuted }]}>
          {title}
        </Text>
        <StatsGrid stats={stats} columns={columns} />
      </CardContent>
    </Card>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    marginTop: 1,
    textAlign: 'center',
  },
  cardContent: {
    paddingTop: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
})
