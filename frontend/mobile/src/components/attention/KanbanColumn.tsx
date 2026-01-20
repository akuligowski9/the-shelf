import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useThemeStore } from '@/stores'
import { statusColors } from '@shared/colors'

interface KanbanColumnProps {
  id: 'active' | 'planned' | 'parked' | 'done'
  title: string
  count: number
  children: React.ReactNode
  onSeeAll?: () => void
  showSeeAll?: boolean
}

export function KanbanColumn({
  id,
  title,
  count,
  children,
  onSeeAll,
  showSeeAll,
}: KanbanColumnProps) {
  const { colors, isDark } = useThemeStore()

  const columnConfig = {
    active: {
      main: statusColors.active.main,
      bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
      headerBg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.12)',
    },
    planned: {
      main: statusColors.planned.main,
      bg: isDark ? 'rgba(14, 165, 233, 0.1)' : 'rgba(14, 165, 233, 0.08)',
      headerBg: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.12)',
    },
    parked: {
      main: statusColors.parked.main,
      bg: isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.08)',
      headerBg: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.12)',
    },
    done: {
      main: statusColors.completed.main,
      bg: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.08)',
      headerBg: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.12)',
    },
  }

  const config = columnConfig[id]

  return (
    <View style={styles.column}>
      <View style={[styles.header, { backgroundColor: config.headerBg }]}>
        <Text style={[styles.title, { color: config.main }]}>{title}</Text>
        <View style={[styles.countBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.count, { color: config.main }]}>{count}</Text>
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: config.bg }]}>
        {children}

        {showSeeAll && onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            style={[styles.seeAllButton, { borderColor: colors.border }]}
          >
            <Text style={[styles.seeAllText, { color: colors.textMuted }]}>
              See all ({count})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  column: {
    width: 220,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    minHeight: 120,
    padding: 8,
    borderRadius: 8,
  },
  seeAllButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 12,
  },
})
