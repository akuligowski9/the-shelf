import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Plus } from 'lucide-react-native'
import { useThemeStore, useHabitsStore } from '@/stores'
import { Card, CardContent } from '@/components/ui'
import {
  KanbanCard,
  KanbanColumn,
  HabitTreeItem,
  HabitEditSheet,
  TargetEditSheet,
  PracticeEditSheet,
  ActionEditSheet,
  AddInputSheet,
} from '@/components/attention'
import type { Habit, Practice, Action, Target } from '@shared/types'

const COLUMN_LIMIT = 5

export default function AttentionScreen() {
  const { colors } = useThemeStore()
  const {
    habits,
    targets,
    practices,
    loadInitialData,
    addHabit,
    updateHabit,
    toggleHabitActive,
    addTarget,
    updateTarget,
    updateTargetStatus,
    deleteTarget,
    addPractice,
    updatePractice,
    togglePracticeActive,
    addAction,
    updateAction,
    deleteAction,
    getTargetsByStatus,
  } = useHabitsStore()

  const [refreshing, setRefreshing] = useState(false)

  // Add input states
  const [addingTarget, setAddingTarget] = useState(false)
  const [addingHabit, setAddingHabit] = useState(false)
  const [addingPracticeFor, setAddingPracticeFor] = useState<number | null>(null)
  const [addingActionFor, setAddingActionFor] = useState<number | null>(null)

  // Edit sheet states
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingTarget, setEditingTarget] = useState<Target | null>(null)
  const [editingPractice, setEditingPractice] = useState<{
    practice: Practice
    habitName: string
  } | null>(null)
  const [editingAction, setEditingAction] = useState<{
    action: Action
    practiceName: string
  } | null>(null)

  // Load data
  useEffect(() => {
    loadInitialData()
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadInitialData()
    setRefreshing(false)
  }, [loadInitialData])

  // Group targets by status
  const groupedTargets = useMemo(() => {
    const sortByPriority = (a: any, b: any) =>
      (a.sort_order ?? 999) - (b.sort_order ?? 999)

    return {
      active: getTargetsByStatus('active').sort(sortByPriority),
      planned: getTargetsByStatus('planned').sort(sortByPriority),
      parked: getTargetsByStatus('parked').sort(sortByPriority),
      completed: getTargetsByStatus('completed'),
      archived: getTargetsByStatus('archived'),
    }
  }, [targets, getTargetsByStatus])

  // Get habit for target
  const getHabitForTarget = (target: Target) => {
    return habits.find((h) => h.id === (target as any).habit_id)
  }

  // Habits (excluding caution)
  const normalHabits = useMemo(
    () => habits.filter((h) => (h as any).type !== 'caution'),
    [habits]
  )

  // Caution behaviors
  const cautionHabit = useMemo(
    () => habits.find((h) => (h as any).type === 'caution'),
    [habits]
  )

  // Handle add target
  const handleAddTarget = (name: string) => {
    addTarget(name, null, 'planned')
    setAddingTarget(false)
  }

  // Handle add habit
  const handleAddHabit = (name: string) => {
    addHabit(name)
    setAddingHabit(false)
  }

  // Handle add practice
  const handleAddPractice = (name: string) => {
    if (addingPracticeFor) {
      addPractice(addingPracticeFor, name)
      setAddingPracticeFor(null)
    }
  }

  // Handle add action
  const handleAddAction = (name: string) => {
    if (addingActionFor) {
      addAction(addingActionFor, name)
      setAddingActionFor(null)
    }
  }

  // Handle save habit
  const handleSaveHabit = (updates: any) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, updates)
    }
  }

  // Handle save target
  const handleSaveTarget = (updates: any) => {
    if (editingTarget) {
      updateTarget(editingTarget.id, updates)
    }
  }

  // Handle save practice
  const handleSavePractice = (updates: any) => {
    if (editingPractice) {
      updatePractice(editingPractice.practice.id, updates)
    }
  }

  // Handle save action
  const handleSaveAction = (updates: any) => {
    if (editingAction) {
      updateAction(editingAction.action.id, updates)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Attention</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Manage what gets your attention
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Targets Section */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Targets</Text>
            <TouchableOpacity
              onPress={() => setAddingTarget(true)}
              style={[styles.addButton, { borderColor: colors.border }]}
            >
              <Plus size={14} color={colors.text} />
              <Text style={[styles.addButtonText, { color: colors.text }]}>
                Add Target
              </Text>
            </TouchableOpacity>
          </View>

          <CardContent>
            {/* Kanban Board - Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.kanbanScroll}
              contentContainerStyle={styles.kanbanContent}
            >
              {/* Active Column */}
              <KanbanColumn
                id="active"
                title="Active"
                count={groupedTargets.active.length}
                showSeeAll={groupedTargets.active.length > COLUMN_LIMIT}
              >
                {groupedTargets.active.length === 0 ? (
                  <Text style={[styles.emptyColumnText, { color: colors.textMuted }]}>
                    Drag here to activate
                  </Text>
                ) : (
                  groupedTargets.active.slice(0, COLUMN_LIMIT).map((target) => (
                    <KanbanCard
                      key={target.id}
                      target={target}
                      habit={getHabitForTarget(target)}
                      onEdit={() => setEditingTarget(target)}
                    />
                  ))
                )}
              </KanbanColumn>

              {/* Planned Column */}
              <KanbanColumn
                id="planned"
                title="Planned"
                count={groupedTargets.planned.length}
                showSeeAll={groupedTargets.planned.length > COLUMN_LIMIT}
              >
                {groupedTargets.planned.length === 0 ? (
                  <Text style={[styles.emptyColumnText, { color: colors.textMuted }]}>
                    Drag here to plan
                  </Text>
                ) : (
                  groupedTargets.planned.slice(0, COLUMN_LIMIT).map((target) => (
                    <KanbanCard
                      key={target.id}
                      target={target}
                      habit={getHabitForTarget(target)}
                      onEdit={() => setEditingTarget(target)}
                    />
                  ))
                )}
              </KanbanColumn>

              {/* Parked Column */}
              <KanbanColumn
                id="parked"
                title="Parking Lot"
                count={groupedTargets.parked.length}
                showSeeAll={groupedTargets.parked.length > COLUMN_LIMIT}
              >
                {groupedTargets.parked.length === 0 ? (
                  <Text style={[styles.emptyColumnText, { color: colors.textMuted }]}>
                    Drag here to park
                  </Text>
                ) : (
                  groupedTargets.parked.slice(0, COLUMN_LIMIT).map((target) => (
                    <KanbanCard
                      key={target.id}
                      target={target}
                      habit={getHabitForTarget(target)}
                      onEdit={() => setEditingTarget(target)}
                    />
                  ))
                )}
              </KanbanColumn>

              {/* Done Column */}
              <KanbanColumn
                id="done"
                title="Done"
                count={groupedTargets.completed.length + groupedTargets.archived.length}
                showSeeAll={
                  groupedTargets.completed.length + groupedTargets.archived.length >
                  COLUMN_LIMIT
                }
              >
                {groupedTargets.completed.length === 0 &&
                groupedTargets.archived.length === 0 ? (
                  <Text style={[styles.emptyColumnText, { color: colors.textMuted }]}>
                    Drag here to complete
                  </Text>
                ) : (
                  groupedTargets.completed.slice(0, COLUMN_LIMIT).map((target) => (
                    <KanbanCard
                      key={target.id}
                      target={target}
                      habit={getHabitForTarget(target)}
                      onEdit={() => setEditingTarget(target)}
                      isCompleted
                    />
                  ))
                )}
              </KanbanColumn>
            </ScrollView>
          </CardContent>
        </Card>

        {/* Habits Section */}
        <Card>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Habits</Text>
            <TouchableOpacity
              onPress={() => setAddingHabit(true)}
              style={[styles.addButton, { borderColor: colors.border }]}
            >
              <Plus size={14} color={colors.text} />
              <Text style={[styles.addButtonText, { color: colors.text }]}>
                Add Habit
              </Text>
            </TouchableOpacity>
          </View>

          <CardContent>
            {normalHabits.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                No habits yet. Add your first habit to get started.
              </Text>
            ) : (
              <View style={styles.habitsList}>
                {normalHabits.map((habit) => (
                  <HabitTreeItem
                    key={habit.id}
                    habit={habit}
                    onEditHabit={setEditingHabit}
                    onEditPractice={(practice, habitName) =>
                      setEditingPractice({ practice, habitName })
                    }
                    onEditAction={(action, practiceName) =>
                      setEditingAction({ action, practiceName })
                    }
                    onAddPractice={setAddingPracticeFor}
                    onAddAction={setAddingActionFor}
                  />
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Caution Behaviors Section */}
        {cautionHabit && (
          <Card>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Caution Behaviors
              </Text>
            </View>
            <CardContent>
              <Text style={[styles.cautionNote, { color: colors.textMuted }]}>
                Behaviors to be mindful of and track
              </Text>
              {/* Would list caution behaviors here */}
            </CardContent>
          </Card>
        )}
      </ScrollView>

      {/* Add Input Sheets */}
      <AddInputSheet
        title="Add Target"
        placeholder="Target name"
        visible={addingTarget}
        onClose={() => setAddingTarget(false)}
        onSubmit={handleAddTarget}
      />

      <AddInputSheet
        title="Add Habit"
        placeholder="Habit name"
        visible={addingHabit}
        onClose={() => setAddingHabit(false)}
        onSubmit={handleAddHabit}
      />

      <AddInputSheet
        title="Add Practice"
        placeholder="Practice name"
        visible={addingPracticeFor !== null}
        onClose={() => setAddingPracticeFor(null)}
        onSubmit={handleAddPractice}
      />

      <AddInputSheet
        title="Add Action"
        placeholder="Action name"
        visible={addingActionFor !== null}
        onClose={() => setAddingActionFor(null)}
        onSubmit={handleAddAction}
      />

      {/* Edit Sheets */}
      {editingHabit && (
        <HabitEditSheet
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSave={handleSaveHabit}
          onToggleActive={() => toggleHabitActive(editingHabit.id)}
        />
      )}

      {editingTarget && (
        <TargetEditSheet
          target={editingTarget}
          habits={normalHabits}
          onClose={() => setEditingTarget(null)}
          onSave={handleSaveTarget}
          onDelete={deleteTarget}
        />
      )}

      {editingPractice && (
        <PracticeEditSheet
          practice={editingPractice.practice}
          habitName={editingPractice.habitName}
          onClose={() => setEditingPractice(null)}
          onSave={handleSavePractice}
          onToggleActive={() =>
            togglePracticeActive(editingPractice.practice.id)
          }
        />
      )}

      {editingAction && (
        <ActionEditSheet
          action={editingAction.action}
          practiceName={editingAction.practiceName}
          onClose={() => setEditingAction(null)}
          onSave={handleSaveAction}
          onDelete={deleteAction}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  kanbanScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  kanbanContent: {
    paddingRight: 16,
  },
  emptyColumnText: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
  habitsList: {
    gap: 0,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  cautionNote: {
    fontSize: 13,
    marginBottom: 12,
  },
})
