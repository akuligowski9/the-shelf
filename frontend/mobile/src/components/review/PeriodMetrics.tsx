import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Clock, Activity, AlertCircle, Coffee, Leaf } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { Card, CardContent } from '@/components/ui'

interface MetricsData {
  totalHours: number
  habitEntries: number
  lifeEntries: number
  cautionEntries: number
  restDays: number
}

interface PeriodMetricsProps {
  metrics: MetricsData
  periodLabel: string
}

export function PeriodMetrics({ metrics, periodLabel }: PeriodMetricsProps) {
  const { colors } = useThemeStore()

  const statItems = [
    {
      icon: Clock,
      iconColor: colors.primary,
      iconBg: `${colors.primary}20`,
      value: `${metrics.totalHours}h`,
      label: 'Total time',
    },
    {
      icon: Activity,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59, 130, 246, 0.1)',
      value: metrics.habitEntries,
      label: 'Habits',
    },
    {
      icon: AlertCircle,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.1)',
      value: metrics.cautionEntries,
      label: 'Cautions',
    },
    {
      icon: Leaf,
      iconColor: '#06b6d4',
      iconBg: 'rgba(6, 182, 212, 0.1)',
      value: metrics.lifeEntries,
      label: 'Life',
    },
    {
      icon: Coffee,
      iconColor: colors.textMuted,
      iconBg: colors.card,
      value: metrics.restDays,
      label: 'Rest days',
    },
  ]

  return (
    <Card>
      <CardContent>
        <Text style={[styles.title, { color: colors.text }]}>Period Summary</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          What happened during {periodLabel}
        </Text>

        <View style={styles.statsGrid}>
          {statItems.map((item, index) => {
            const Icon = item.icon
            return (
              <View key={index} style={styles.statItem}>
                <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
                  <Icon size={16} color={item.iconColor} />
                </View>
                <View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {item.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {item.label}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>
      </CardContent>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '45%',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
  },
})
