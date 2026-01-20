import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Calendar, Clock, GripVertical } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { Badge } from '@/components/ui'
import type { Target, Habit } from '@shared/types'

interface TargetCardProps {
  target: Target
  habit?: Habit
  progress?: { minutes: number; sessions: number }
  onPress?: () => void
  drag?: () => void
  isActive?: boolean
}

export function TargetCard({
  target,
  habit,
  progress,
  onPress,
  drag,
  isActive,
}: TargetCardProps) {
  const { colors, isDark } = useThemeStore()

  const formatProgress = (minutes: number) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const hasDeadline = (target as any).end_date
  const hasDuration = (target as any).planned_duration

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={drag}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderLeftColor: colors.primary,
          opacity: isActive ? 0.5 : 1,
        },
      ]}
    >
      {/* Drag handle */}
      <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
        <GripVertical size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Target name */}
        <Text style={[styles.name, { color: colors.text }]}>{target.name}</Text>

        {/* Habit badge + dates */}
        <View style={styles.meta}>
          {habit && (
            <Badge variant="habit" color={habit.color || 'sage'}>
              {habit.name}
            </Badge>
          )}
          {hasDeadline && (
            <View style={styles.metaItem}>
              <Calendar size={12} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {new Date((target as any).end_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          )}
          {hasDuration && !hasDeadline && (
            <View style={styles.metaItem}>
              <Clock size={12} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                ~{(target as any).planned_duration}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {progress ? (
          <>
            <Text style={[styles.progressMinutes, { color: colors.text }]}>
              {formatProgress(progress.minutes)}
            </Text>
            <Text style={[styles.progressSessions, { color: colors.textMuted }]}>
              {progress.sessions} {progress.sessions === 1 ? 'session' : 'sessions'}
            </Text>
          </>
        ) : (
          <Text style={[styles.noSessions, { color: colors.textMuted }]}>
            No sessions yet
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

interface CompactTargetCardProps {
  target: Target
  habit?: Habit
  progress?: { minutes: number; sessions: number }
  onPress?: () => void
  drag?: () => void
  isActive?: boolean
}

export function CompactTargetCard({
  target,
  habit,
  progress,
  onPress,
  drag,
  isActive,
}: CompactTargetCardProps) {
  const { colors } = useThemeStore()

  const formatProgress = (minutes: number) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={drag}
      activeOpacity={0.7}
      style={[
        styles.compactCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: isActive ? 0.5 : 1,
        },
      ]}
    >
      <TouchableOpacity onPressIn={drag} style={styles.compactDragHandle}>
        <GripVertical size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {habit && (
        <Badge
          variant="habit"
          color={habit.color || 'sage'}
          style={styles.compactBadge}
        >
          {habit.name}
        </Badge>
      )}

      <Text
        style={[styles.compactName, { color: colors.text }]}
        numberOfLines={1}
      >
        {target.name}
      </Text>

      {progress && (
        <Text style={[styles.compactProgress, { color: colors.textMuted }]}>
          {formatProgress(progress.minutes)}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dragHandle: {
    marginTop: 2,
    padding: 4,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  progress: {
    alignItems: 'flex-end',
  },
  progressMinutes: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressSessions: {
    fontSize: 11,
  },
  noSessions: {
    fontSize: 11,
  },
  // Compact styles
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactDragHandle: {
    padding: 2,
  },
  compactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compactName: {
    flex: 1,
    fontSize: 13,
  },
  compactProgress: {
    fontSize: 12,
  },
})
