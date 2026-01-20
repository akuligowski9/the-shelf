import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Star, Sunrise, Sunset, Target } from 'lucide-react-native'
import { useThemeStore } from '@/stores'
import { Badge } from '@/components/ui'
import { getHabitColor, entryTypeColors } from '@shared/colors'
import type { Entry } from '@shared/types'

interface EntryCardProps {
  entry: Entry
  onPress?: () => void
  onToggleHighlight?: () => void
}

export function EntryCard({ entry, onPress, onToggleHighlight }: EntryCardProps) {
  const { colors, isDark } = useThemeStore()

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getEntryLabel = () => {
    if (entry.type === 'habit' && entry.habit) {
      return entry.habit.name
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1)
  }

  const getBorderColor = () => {
    if (entry.type === 'habit') return colors.primary
    if (entry.type === 'life') return '#3b82f6'
    if (entry.type === 'caution') return '#ef4444'
    return colors.border
  }

  const getBadgeColor = () => {
    if (entry.type === 'habit' && entry.habit?.color) {
      return entry.habit.color
    }
    return undefined
  }

  const getBadgeVariant = (): 'habit' | 'default' | 'secondary' => {
    if (entry.type === 'habit') return 'habit'
    if (entry.type === 'life' || entry.type === 'caution') return 'default'
    return 'secondary'
  }

  const getBadgeStyle = () => {
    if (entry.type === 'life') {
      return {
        backgroundColor: isDark ? entryTypeColors.life.darkLight : entryTypeColors.life.light,
        borderColor: entryTypeColors.life.main,
        borderWidth: 1,
      }
    }
    if (entry.type === 'caution') {
      return {
        backgroundColor: isDark ? entryTypeColors.caution.darkLight : entryTypeColors.caution.light,
        borderColor: entryTypeColors.caution.main,
        borderWidth: 1,
      }
    }
    return {}
  }

  const getBadgeTextStyle = () => {
    if (entry.type === 'life') {
      return { color: entryTypeColors.life.main }
    }
    if (entry.type === 'caution') {
      return { color: entryTypeColors.caution.main }
    }
    return {}
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: entry.is_highlight
            ? isDark
              ? colors.primary + '15'
              : colors.primary + '10'
            : colors.card,
          borderLeftColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.badges}>
            <Badge
              variant={getBadgeVariant()}
              color={getBadgeColor()}
              style={getBadgeStyle()}
              textStyle={getBadgeTextStyle()}
            >
              {getEntryLabel()}
            </Badge>
            {entry.practice && (
              <Text style={[styles.practice, { color: colors.text }]}>
                {entry.practice.name}
              </Text>
            )}
            {entry.is_highlight && (
              <Star
                size={14}
                color={colors.primary}
                fill={colors.primary}
              />
            )}
            {(entry as any).warm_up_at && (
              <Sunrise size={12} color={colors.textMuted} />
            )}
          </View>
        </View>

        {entry.target && (
          <View style={styles.targetRow}>
            <Target size={14} color={colors.textMuted} />
            <Text style={[styles.targetText, { color: colors.text }]}>
              {entry.target.name}
            </Text>
          </View>
        )}

        {entry.actions && entry.actions.length > 0 && (
          <Text style={[styles.actionsText, { color: colors.text }]}>
            {(entry.actions as any).join(', ')}
          </Text>
        )}

        {entry.note && (
          <Text style={[styles.note, { color: colors.text }]}>{entry.note}</Text>
        )}

        {((entry as any).warm_up_note || (entry as any).cool_down_note) && (
          <View style={[styles.sessionNotes, { borderTopColor: colors.border }]}>
            {(entry as any).warm_up_note && (
              <View style={styles.sessionNote}>
                <Sunrise size={12} color={colors.textMuted} />
                <Text style={[styles.sessionNoteText, { color: colors.textMuted }]}>
                  {(entry as any).warm_up_note}
                </Text>
              </View>
            )}
            {(entry as any).cool_down_note && (
              <View style={styles.sessionNote}>
                <Sunset size={12} color={colors.textMuted} />
                <Text style={[styles.sessionNoteText, { color: colors.textMuted }]}>
                  {(entry as any).cool_down_note}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.meta}>
        <Text style={[styles.time, { color: colors.text }]}>
          {formatTime((entry as any).occurred_at || entry.created_at)}
        </Text>
        {entry.duration_minutes && (
          <Text style={[styles.duration, { color: colors.text }]}>
            {entry.duration_minutes} min
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  practice: {
    fontSize: 14,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetText: {
    fontSize: 13,
  },
  actionsText: {
    fontSize: 13,
  },
  note: {
    fontSize: 13,
  },
  sessionNotes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 4,
  },
  sessionNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  sessionNoteText: {
    fontSize: 12,
    flex: 1,
  },
  meta: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 13,
  },
  duration: {
    fontSize: 13,
  },
})
