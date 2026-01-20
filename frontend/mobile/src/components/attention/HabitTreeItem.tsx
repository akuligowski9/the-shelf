import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react-native'
import { useThemeStore, useHabitsStore } from '@/stores'
import { Badge } from '@/components/ui'
import { habitColors } from '@shared/colors'
import type { Habit, Practice, Action } from '@shared/types'

interface HabitTreeItemProps {
  habit: Habit
  onEditHabit: (habit: Habit) => void
  onEditPractice: (practice: Practice, habitName: string) => void
  onEditAction: (action: Action, practiceName: string) => void
  onAddPractice: (habitId: number) => void
  onAddAction: (practiceId: number) => void
}

export function HabitTreeItem({
  habit,
  onEditHabit,
  onEditPractice,
  onEditAction,
  onAddPractice,
  onAddAction,
}: HabitTreeItemProps) {
  const { colors } = useThemeStore()
  const { getPracticesForHabit, getActionsForPractice } = useHabitsStore()
  const [expanded, setExpanded] = useState(false)

  const practices = getPracticesForHabit(habit.id)
  const tracksActions = (habit as any).track_actions
  const habitColor = habitColors[habit.color || 'forest'] || habitColors.forest

  const allActions = tracksActions
    ? practices.flatMap((p) => getActionsForPractice(p.id))
    : []

  return (
    <View style={styles.container}>
      {/* Habit header */}
      <View style={styles.habitRow}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.habitHeader}
          activeOpacity={0.7}
        >
          {expanded ? (
            <ChevronDown size={14} color={colors.textMuted} />
          ) : (
            <ChevronRight size={14} color={colors.textMuted} />
          )}
          <View
            style={[styles.colorDot, { backgroundColor: habitColor.main }]}
          />
          <Text
            style={[
              styles.habitName,
              { color: habit.active ? colors.text : colors.textMuted },
            ]}
          >
            {habit.name}
          </Text>
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {practices.length}p
            {tracksActions && ` · ${allActions.length}a`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onEditHabit(habit)}>
          <Text style={[styles.editText, { color: colors.textMuted }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Practices list */}
      {expanded && (
        <View style={[styles.practicesContainer, { borderLeftColor: colors.border }]}>
          {practices.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No practices
            </Text>
          ) : (
            practices.map((practice) => (
              <PracticeTreeItem
                key={practice.id}
                practice={practice}
                habitName={habit.name}
                tracksActions={tracksActions}
                onEdit={onEditPractice}
                onEditAction={onEditAction}
                onAddAction={onAddAction}
              />
            ))
          )}

          <TouchableOpacity
            onPress={() => onAddPractice(habit.id)}
            style={styles.addButton}
          >
            <Plus size={12} color={colors.textMuted} />
            <Text style={[styles.addText, { color: colors.textMuted }]}>
              Practice
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

interface PracticeTreeItemProps {
  practice: Practice
  habitName: string
  tracksActions: boolean
  onEdit: (practice: Practice, habitName: string) => void
  onEditAction: (action: Action, practiceName: string) => void
  onAddAction: (practiceId: number) => void
}

function PracticeTreeItem({
  practice,
  habitName,
  tracksActions,
  onEdit,
  onEditAction,
  onAddAction,
}: PracticeTreeItemProps) {
  const { colors } = useThemeStore()
  const { getActionsForPractice } = useHabitsStore()
  const [expanded, setExpanded] = useState(false)

  const actions = tracksActions ? getActionsForPractice(practice.id) : []

  // Simple practice without actions
  if (!tracksActions || actions.length === 0) {
    return (
      <View style={styles.practiceRow}>
        <Text
          style={[
            styles.practiceName,
            { color: practice.active ? colors.text : colors.textMuted },
          ]}
        >
          {practice.name}
        </Text>
        <TouchableOpacity onPress={() => onEdit(practice, habitName)}>
          <Text style={[styles.editText, { color: colors.textMuted }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Practice with actions (expandable)
  return (
    <View>
      <View style={styles.practiceRow}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.practiceHeader}
          activeOpacity={0.7}
        >
          {expanded ? (
            <ChevronDown size={12} color={colors.textMuted} />
          ) : (
            <ChevronRight size={12} color={colors.textMuted} />
          )}
          <Text
            style={[
              styles.practiceName,
              { color: practice.active ? colors.text : colors.textMuted },
            ]}
          >
            {practice.name}
          </Text>
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {actions.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(practice, habitName)}>
          <Text style={[styles.editText, { color: colors.textMuted }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={[styles.actionsContainer, { borderLeftColor: colors.border }]}>
          <View style={styles.actionChips}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => onEditAction(action, practice.name)}
                style={[
                  styles.actionChip,
                  {
                    backgroundColor: action.active
                      ? colors.card
                      : colors.background,
                    borderColor: action.active ? colors.border : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.actionChipText,
                    { color: action.active ? colors.text : colors.textMuted },
                  ]}
                >
                  {action.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => onAddAction(practice.id)}
              style={styles.addActionButton}
            >
              <Text style={[styles.addText, { color: colors.textMuted }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  habitName: {
    fontSize: 14,
    fontWeight: '500',
  },
  countText: {
    fontSize: 12,
  },
  editText: {
    fontSize: 12,
    paddingHorizontal: 8,
  },
  practicesContainer: {
    marginLeft: 14,
    paddingLeft: 12,
    borderLeftWidth: 1,
    marginTop: 4,
    gap: 4,
  },
  emptyText: {
    fontSize: 12,
    paddingVertical: 4,
    paddingLeft: 20,
    fontStyle: 'italic',
  },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingLeft: 20,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  practiceName: {
    fontSize: 13,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingLeft: 20,
  },
  addText: {
    fontSize: 12,
  },
  actionsContainer: {
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    paddingVertical: 4,
  },
  actionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingLeft: 8,
  },
  actionChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  actionChipText: {
    fontSize: 12,
  },
  addActionButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
})
