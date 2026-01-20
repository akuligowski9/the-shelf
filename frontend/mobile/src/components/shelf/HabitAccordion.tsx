import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ChevronDown, ChevronRight } from 'lucide-react-native'
import Animated, {
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated'
import { useThemeStore, useHabitsStore } from '@/stores'
import { Badge } from '@/components/ui'
import type { Habit, Practice, Action } from '@shared/types'

interface HabitAccordionProps {
  habit: Habit
}

export function HabitAccordion({ habit }: HabitAccordionProps) {
  const { colors } = useThemeStore()
  const { getPracticesForHabit, getActionsForPractice } = useHabitsStore()
  const [expanded, setExpanded] = useState(false)

  const practices = getPracticesForHabit(habit.id).filter((p) => p.active)
  const tracksActions = (habit as any).track_actions
  const actionCount = tracksActions
    ? practices.reduce(
        (acc, p) => acc + getActionsForPractice(p.id).filter((a) => a.active).length,
        0
      )
    : 0

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Badge variant="habit" color={habit.color || 'forest'}>
            {habit.name}
          </Badge>
          <Text style={[styles.practiceCount, { color: colors.textMuted }]}>
            {practices.length} {practices.length === 1 ? 'practice' : 'practices'}
            {actionCount > 0 && ` · ${actionCount} actions`}
          </Text>
        </View>
        {expanded ? (
          <ChevronDown size={18} color={colors.textMuted} />
        ) : (
          <ChevronRight size={18} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {practices.length === 0 ? (
            <Text style={[styles.noPractices, { color: colors.textMuted }]}>
              No practices yet
            </Text>
          ) : (
            practices.map((practice) => (
              <PracticeItem
                key={practice.id}
                practice={practice}
                tracksActions={tracksActions}
              />
            ))
          )}
        </View>
      )}
    </View>
  )
}

interface PracticeItemProps {
  practice: Practice
  tracksActions: boolean
}

function PracticeItem({ practice, tracksActions }: PracticeItemProps) {
  const { colors } = useThemeStore()
  const { getActionsForPractice } = useHabitsStore()
  const [expanded, setExpanded] = useState(false)

  const actions = tracksActions
    ? getActionsForPractice(practice.id).filter((a) => a.active)
    : []

  if (actions.length === 0) {
    return (
      <Text style={[styles.practiceName, { color: colors.text }]}>
        {practice.name}
      </Text>
    )
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.practiceHeader}
        activeOpacity={0.7}
      >
        {expanded ? (
          <ChevronDown size={14} color={colors.textMuted} />
        ) : (
          <ChevronRight size={14} color={colors.textMuted} />
        )}
        <Text style={[styles.practiceNameBold, { color: colors.text }]}>
          {practice.name}
        </Text>
        <Text style={[styles.actionCount, { color: colors.textMuted }]}>
          ({actions.length})
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.actionsList}>
          {actions.map((action) => (
            <View key={action.id} style={styles.actionItem}>
              <View
                style={[styles.actionDot, { backgroundColor: colors.textMuted }]}
              />
              <Text style={[styles.actionName, { color: colors.textMuted }]}>
                {action.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  practiceCount: {
    fontSize: 12,
  },
  content: {
    paddingLeft: 8,
    paddingTop: 4,
    gap: 8,
  },
  noPractices: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  practiceName: {
    fontSize: 14,
    paddingVertical: 4,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  practiceNameBold: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionCount: {
    fontSize: 12,
  },
  actionsList: {
    marginLeft: 20,
    paddingTop: 4,
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  actionName: {
    fontSize: 13,
  },
})
