import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MoreHorizontal, Calendar, Clock, GripVertical } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { Badge } from '@/components/ui'
import type { Target, Habit } from '@shared/types'

interface KanbanCardProps {
  target: Target
  habit?: Habit
  onEdit?: () => void
  onLongPress?: () => void
  isCompleted?: boolean
  isActive?: boolean
}

export function KanbanCard({
  target,
  habit,
  onEdit,
  onLongPress,
  isCompleted,
  isActive,
}: KanbanCardProps) {
  const { colors } = useThemeStore()

  const hasDate = (target as any).start_date || (target as any).end_date
  const hasDuration = (target as any).planned_duration

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <TouchableOpacity
      onPress={onEdit}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: isActive ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.name,
            { color: isCompleted ? colors.textMuted : colors.text },
            isCompleted && styles.strikethrough,
          ]}
          numberOfLines={2}
        >
          {target.name}
        </Text>
        <TouchableOpacity
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        {habit && (
          <Badge
            variant="habit"
            color={habit.color || 'sage'}
            style={isCompleted ? { opacity: 0.5 } : undefined}
          >
            {habit.name}
          </Badge>
        )}
        {hasDate && (
          <View style={[styles.metaItem, isCompleted && { opacity: 0.5 }]}>
            <Calendar size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {(target as any).start_date && (target as any).end_date
                ? `${formatDate((target as any).start_date)} - ${formatDate((target as any).end_date)}`
                : (target as any).end_date
                  ? formatDate((target as any).end_date)
                  : formatDate((target as any).start_date)}
            </Text>
          </View>
        )}
        {!hasDate && hasDuration && (
          <View style={[styles.metaItem, isCompleted && { opacity: 0.5 }]}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              ~{(target as any).planned_duration}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
})
