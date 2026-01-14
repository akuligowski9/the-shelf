import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChevronDown, Plus, ArrowRightLeft, GripVertical, MoreHorizontal } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { colorPalette, getHabitBadgeClassesByColor } from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'
// import { mockEntries } from '@/data/mockData'  // Removed with calendar
import HabitEditDialog from '@/components/attention/HabitEditDialog'
import PracticeEditDialog from '@/components/attention/PracticeEditDialog'
import ActionEditDialog from '@/components/attention/ActionEditDialog'
import TargetEditDialog from '@/components/attention/TargetEditDialog'
// Calendar removed - may revisit in future iteration
// import AttentionCalendar from '@/components/attention/AttentionCalendar'

// Kanban card component
function KanbanCard({ target, habitName, habitColorClasses, onEdit, isCompleted }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: target.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-medium ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
          {target.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(target)
          }}
          className="text-muted-foreground/60 hover:text-muted-foreground shrink-0"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      {habitName && (
        <Badge variant="outline" className={`mt-2 text-xs ${habitColorClasses} ${isCompleted ? 'opacity-50' : ''}`}>
          {habitName}
        </Badge>
      )}
    </div>
  )
}

// Kanban column component
function KanbanColumn({ id, title, count, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[240px] shrink-0 md:w-auto md:shrink ${className || ''}`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
        {count !== undefined && (
          <span className="text-xs text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div
        className={`flex-1 min-h-[100px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-accent/40' : 'bg-muted/30'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function AttentionView() {
  const location = useLocation()

  // Refs for hash navigation
  const targetsRef = useRef(null)
  const habitsRef = useRef(null)

  // Handle hash navigation
  useEffect(() => {
    const hash = location.hash.replace('#', '')
    if (hash === 'targets' && targetsRef.current) {
      targetsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (hash === 'habits' && habitsRef.current) {
      habitsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  // Shared state from context
  const {
    habits,
    updateHabitColor,
    toggleHabitActive,
    getHabitByName,
    updateHabitName,
    updateHabitTargetMinutes,
    getPracticesForHabit,
    practices,
    togglePracticeActive,
    addPractice,
    updatePracticeName,
    updatePracticeDetails,
    // scheduledPractices,  // Removed with calendar
    // schedulePractice,    // Removed with calendar
    // removeScheduledPractice,  // Removed with calendar
    getActionsForPractice,
    toggleActionActive,
    addAction,
    updateActionName,
    addHabit,
    targets,
    getTargetsByStatus,
    updateTargetStatus,
    addTarget,
    updateTargetName,
    updateTargetHabit,
    updateTargetDates,
    reorderTargets,
    deleteTarget,
  } = useHabits()

  // Track which habit is showing the add practice input
  const [addingPracticeFor, setAddingPracticeFor] = useState(null)
  const [newPracticeName, setNewPracticeName] = useState('')

  // Track which practice is showing the add action input
  const [addingActionFor, setAddingActionFor] = useState(null)
  const [newActionName, setNewActionName] = useState('')

  // Track adding new target/habit
  const [addingTarget, setAddingTarget] = useState(false)
  const [newTargetName, setNewTargetName] = useState('')
  const [addingHabit, setAddingHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')

  // Edit dialogs state
  const [editingHabit, setEditingHabit] = useState(null)
  const [editingPractice, setEditingPractice] = useState(null)
  const [editingPracticeHabitName, setEditingPracticeHabitName] = useState('')
  const [editingAction, setEditingAction] = useState(null)
  const [editingActionPracticeName, setEditingActionPracticeName] = useState('')
  const [editingTarget, setEditingTarget] = useState(null)

  // Done modal state
  const [showDoneModal, setShowDoneModal] = useState(false)

  // Get targets by status from context
  const activeTargets = getTargetsByStatus('active')
  const plannedTargets = getTargetsByStatus('planned')
  const parkedTargets = getTargetsByStatus('parked')
  const completedTargets = getTargetsByStatus('completed')
  const archivedTargets = getTargetsByStatus('archived')

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Track active drag for overlay
  const [activeDragId, setActiveDragId] = useState(null)
  const activeDragTarget = activeDragId
    ? targets.find(t => t.id === activeDragId)
    : null

  // Find which zone a target belongs to (for Kanban board)
  const findZone = (targetId) => {
    if (activeTargets.find(t => t.id === targetId)) return 'active'
    if (plannedTargets.find(t => t.id === targetId)) return 'planned'
    if (parkedTargets.find(t => t.id === targetId)) return 'parked'
    // Both completed and archived show in Done column
    if (completedTargets.find(t => t.id === targetId)) return 'done'
    if (archivedTargets.find(t => t.id === targetId)) return 'done'
    return null
  }

  // Map zone to status (done zone -> completed status)
  const zoneToStatus = (zone) => {
    if (zone === 'done') return 'completed'
    return zone
  }

  // Handle drag start
  const handleDragStart = (event) => {
    setActiveDragId(event.active.id)
  }

  // Handle drag end - reorder or change status
  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Check if dropped on a zone directly
    const zoneIds = ['active', 'planned', 'parked', 'done']
    const droppedOnZone = zoneIds.includes(overId) ? overId : null

    // Find source zone
    const sourceZone = findZone(activeId)

    // Determine target zone (either dropped on zone or on item in zone)
    let targetZone = droppedOnZone || findZone(overId)

    if (!sourceZone || !targetZone) return

    // If moving to different zone, update status
    if (sourceZone !== targetZone) {
      updateTargetStatus(activeId, zoneToStatus(targetZone))
      return
    }

    // Same zone - reorder
    if (activeId !== overId && !droppedOnZone) {
      // Done column combines completed + archived for display
      const doneTargets = [...completedTargets, ...archivedTargets]
      const zoneTargets = {
        active: activeTargets,
        planned: plannedTargets,
        parked: parkedTargets,
        done: doneTargets,
      }[sourceZone]

      const oldIndex = zoneTargets.findIndex(t => t.id === activeId)
      const newIndex = zoneTargets.findIndex(t => t.id === overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(zoneTargets, oldIndex, newIndex)
        reorderTargets(newOrder.map(t => t.id))
      }
    }
  }

  // Get habit color classes by habit name
  const getHabitColorByName = (habitName) => {
    const habit = getHabitByName(habitName)
    if (!habit) return ''
    return getHabitBadgeClassesByColor(habit.color || 'sage')
  }

  const handleAddPractice = (habitId) => {
    if (newPracticeName.trim()) {
      addPractice(habitId, newPracticeName.trim())
      setNewPracticeName('')
      setAddingPracticeFor(null)
    }
  }

  const handleCancelAdd = () => {
    setNewPracticeName('')
    setAddingPracticeFor(null)
  }

  const handleAddAction = (practiceId) => {
    if (newActionName.trim()) {
      addAction(practiceId, newActionName.trim())
      setNewActionName('')
      setAddingActionFor(null)
    }
  }

  const handleCancelAddAction = () => {
    setNewActionName('')
    setAddingActionFor(null)
  }

  const handleAddTarget = () => {
    if (newTargetName.trim()) {
      addTarget(newTargetName.trim(), null, 'planned')
      setNewTargetName('')
      setAddingTarget(false)
    }
  }

  const handleCancelAddTarget = () => {
    setNewTargetName('')
    setAddingTarget(false)
  }

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      addHabit(newHabitName.trim())
      setNewHabitName('')
      setAddingHabit(false)
    }
  }

  const handleCancelAddHabit = () => {
    setNewHabitName('')
    setAddingHabit(false)
  }

  // Helper to get habit name from habit_id
  const getHabitNameById = (habitId) => {
    const habit = habits.find(h => h.id === habitId)
    return habit?.name || null
  }

  // Edit handlers
  const handleSaveHabit = (updates) => {
    if (editingHabit) {
      updateHabitName(editingHabit.id, updates.name)
      updateHabitTargetMinutes(editingHabit.id, updates.target_minutes)
      updateHabitColor(editingHabit.id, updates.color)
    }
  }

  const handleSavePractice = (updates) => {
    if (editingPractice) {
      updatePracticeName(editingPractice.id, updates.name)
      updatePracticeDetails(editingPractice.id, updates.details)
    }
  }

  const handleSaveAction = (updates) => {
    if (editingAction) {
      updateActionName(editingAction.id, updates.name)
    }
  }

  const handleSaveTarget = (updates) => {
    if (editingTarget) {
      updateTargetName(editingTarget.id, updates.name)
      updateTargetHabit(editingTarget.id, updates.habit_id)
      updateTargetStatus(editingTarget.id, updates.status)
      updateTargetDates(editingTarget.id, updates.start_date, updates.end_date, updates.planned_duration)
    }
  }

  const openPracticeEdit = (practice, habitName) => {
    setEditingPractice(practice)
    setEditingPracticeHabitName(habitName)
  }

  const openActionEdit = (action, practiceName) => {
    setEditingAction(action)
    setEditingActionPracticeName(practiceName)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Attention</h1>
        <p className="text-muted-foreground">Manage what gets your attention</p>
      </div>

      {/* Targets */}
      <Card ref={targetsRef}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Targets</CardTitle>
          {addingTarget ? (
            <div className="flex items-center gap-2">
              <Input
                value={newTargetName}
                onChange={(e) => setNewTargetName(e.target.value)}
                placeholder="Target name"
                className="h-8 text-sm w-48"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTarget()
                  if (e.key === 'Escape') handleCancelAddTarget()
                }}
              />
              <Button size="sm" variant="ghost" className="h-8" onClick={handleAddTarget}>
                Add
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={handleCancelAddTarget}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setAddingTarget(true)}>
              Add Target
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2 md:grid md:grid-cols-4 md:overflow-visible">
              {/* Active Column */}
              <KanbanColumn id="active" title="Active" count={activeTargets.length}>
                <SortableContext
                  items={activeTargets.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {activeTargets.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-4">
                      Drag here to activate
                    </p>
                  ) : (
                    activeTargets.map(target => {
                      const habitName = getHabitNameById(target.habit_id)
                      return (
                        <KanbanCard
                          key={target.id}
                          target={target}
                          habitName={habitName}
                          habitColorClasses={getHabitColorByName(habitName)}
                          onEdit={setEditingTarget}
                        />
                      )
                    })
                  )}
                </SortableContext>
              </KanbanColumn>

              {/* Planned Column */}
              <KanbanColumn id="planned" title="Planned" count={plannedTargets.length}>
                <SortableContext
                  items={plannedTargets.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {plannedTargets.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-4">
                      Drag here to plan
                    </p>
                  ) : (
                    plannedTargets.map(target => {
                      const habitName = getHabitNameById(target.habit_id)
                      return (
                        <KanbanCard
                          key={target.id}
                          target={target}
                          habitName={habitName}
                          habitColorClasses={getHabitColorByName(habitName)}
                          onEdit={setEditingTarget}
                        />
                      )
                    })
                  )}
                </SortableContext>
              </KanbanColumn>

              {/* Parking Lot Column */}
              <KanbanColumn id="parked" title="Parking Lot" count={parkedTargets.length}>
                <SortableContext
                  items={parkedTargets.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {parkedTargets.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-4">
                      Drag here to park
                    </p>
                  ) : (
                    parkedTargets.map(target => {
                      const habitName = getHabitNameById(target.habit_id)
                      return (
                        <KanbanCard
                          key={target.id}
                          target={target}
                          habitName={habitName}
                          habitColorClasses={getHabitColorByName(habitName)}
                          onEdit={setEditingTarget}
                        />
                      )
                    })
                  )}
                </SortableContext>
              </KanbanColumn>

              {/* Done Column */}
              <KanbanColumn
                id="done"
                title="Done"
                count={completedTargets.length + archivedTargets.length}
              >
                <SortableContext
                  items={[...completedTargets, ...archivedTargets].map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {completedTargets.length === 0 && archivedTargets.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-4">
                      Drag here to complete
                    </p>
                  ) : (
                    <>
                      {/* Show top 3 completed */}
                      {completedTargets.slice(0, 3).map(target => {
                        const habitName = getHabitNameById(target.habit_id)
                        return (
                          <KanbanCard
                            key={target.id}
                            target={target}
                            habitName={habitName}
                            habitColorClasses={getHabitColorByName(habitName)}
                            onEdit={setEditingTarget}
                            isCompleted={true}
                          />
                        )
                      })}
                      {/* See all button */}
                      {(completedTargets.length > 3 || archivedTargets.length > 0) && (
                        <button
                          onClick={() => setShowDoneModal(true)}
                          className="w-full text-xs text-muted-foreground hover:text-foreground py-2 text-center border border-dashed rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          See all ({completedTargets.length + archivedTargets.length})
                        </button>
                      )}
                    </>
                  )}
                </SortableContext>
              </KanbanColumn>
            </div>

            {/* Drag overlay */}
            <DragOverlay>
              {activeDragTarget && (
                <div className="bg-card border rounded-lg p-3 shadow-lg opacity-95 min-w-[180px]">
                  <span className="text-sm font-medium">{activeDragTarget.name}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      {/* Done Modal */}
      <Dialog open={showDoneModal} onOpenChange={setShowDoneModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Done</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Completed Section */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                Completed ({completedTargets.length})
              </h4>
              {completedTargets.length === 0 ? (
                <p className="text-sm text-muted-foreground/60">No completed targets</p>
              ) : (
                <div className="space-y-2">
                  {completedTargets.map(target => {
                    const habitName = getHabitNameById(target.habit_id)
                    return (
                      <div
                        key={target.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <span className="text-sm line-through text-muted-foreground">
                            {target.name}
                          </span>
                          {habitName && (
                            <Badge
                              variant="outline"
                              className={`ml-2 text-xs opacity-60 ${getHabitColorByName(habitName)}`}
                            >
                              {habitName}
                            </Badge>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setShowDoneModal(false)
                            setEditingTarget(target)
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Archived Section */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                Archived ({archivedTargets.length})
              </h4>
              {archivedTargets.length === 0 ? (
                <p className="text-sm text-muted-foreground/60">No archived targets</p>
              ) : (
                <div className="space-y-2">
                  {archivedTargets.map(target => {
                    const habitName = getHabitNameById(target.habit_id)
                    return (
                      <div
                        key={target.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                      >
                        <div>
                          <span className="text-sm text-muted-foreground">
                            {target.name}
                          </span>
                          {habitName && (
                            <Badge
                              variant="outline"
                              className={`ml-2 text-xs opacity-60 ${getHabitColorByName(habitName)}`}
                            >
                              {habitName}
                            </Badge>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setShowDoneModal(false)
                            setEditingTarget(target)
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Habits */}
      <Card ref={habitsRef}>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Habits</CardTitle>
          {addingHabit ? (
            <div className="flex items-center gap-2">
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name"
                className="h-8 text-sm w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddHabit()
                  if (e.key === 'Escape') handleCancelAddHabit()
                }}
              />
              <Button size="sm" variant="ghost" className="h-8" onClick={handleAddHabit}>
                Add
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={handleCancelAddHabit}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setAddingHabit(true)}>
              Add Habit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-1">
          {habits.map(habit => {
            const habitColor = colorPalette[habit.color] || colorPalette.forest
            const practices = getPracticesForHabit(habit.id)
            const activePractices = practices.filter(p => p.active)

            return (
              <Collapsible key={habit.id}>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    {/* Color picker dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`w-4 h-4 rounded-full ${habitColor.dot} hover:ring-2 hover:ring-offset-2 hover:ring-border transition-all cursor-pointer`}
                          title="Change color"
                        />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[140px]">
                        {Object.entries(colorPalette).map(([key, color]) => (
                          <DropdownMenuItem
                            key={key}
                            onClick={() => updateHabitColor(habit.id, key)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div className={`w-3 h-3 rounded-full ${color.dot}`} />
                            <span>{color.name}</span>
                            {habit.color === key && (
                              <span className="ml-auto text-xs text-muted-foreground">✓</span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <CollapsibleTrigger className="flex items-center gap-2 hover:text-foreground/80 [&[data-state=open]>svg]:rotate-180">
                      <span className={habit.active ? '' : 'text-muted-foreground'}>
                        {habit.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({activePractices.length}/{practices.length})
                      </span>
                      <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                    </CollapsibleTrigger>
                  </div>
                  <button
                    onClick={() => setEditingHabit(habit)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Edit
                  </button>
                </div>

                <CollapsibleContent>
                  <div className="ml-7 pl-3 border-l border-border space-y-1 pb-2">
                    {practices.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-1">No practices yet</p>
                    ) : (
                      practices.map(practice => {
                        const actions = getActionsForPractice(practice.id)
                        const activeActions = actions.filter(a => a.active)
                        const showActions = habit.track_actions

                        return (
                          <Collapsible key={practice.id}>
                            <div className="flex items-center justify-between py-1">
                              <CollapsibleTrigger className="flex items-center gap-2 hover:text-foreground/80 [&[data-state=open]>svg]:rotate-180">
                                <span className={practice.active ? 'text-sm' : 'text-sm text-muted-foreground'}>
                                  {practice.name}
                                </span>
                                {showActions && (
                                  <>
                                    <span className="text-xs text-muted-foreground">
                                      ({activeActions.length}/{actions.length})
                                    </span>
                                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                                  </>
                                )}
                              </CollapsibleTrigger>
                              <button
                                onClick={() => openPracticeEdit(practice, habit.name)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                Edit
                              </button>
                            </div>

                            {habit.track_actions && (
                              <CollapsibleContent>
                                <div className="ml-4 pl-3 border-l border-border/50 space-y-1 pb-1">
                                  {actions.map(action => (
                                    <div
                                      key={action.id}
                                      className="flex items-center justify-between py-0.5"
                                    >
                                      <span className={action.active ? 'text-xs' : 'text-xs text-muted-foreground'}>
                                        {action.name}
                                      </span>
                                      <button
                                        onClick={() => openActionEdit(action, practice.name)}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ))}

                                  {/* Add Action Input */}
                                  {addingActionFor === practice.id ? (
                                    <div className="flex items-center gap-2 pt-1">
                                      <Input
                                        value={newActionName}
                                        onChange={(e) => setNewActionName(e.target.value)}
                                        placeholder="Action name"
                                        className="h-6 text-xs"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleAddAction(practice.id)
                                          if (e.key === 'Escape') handleCancelAddAction()
                                        }}
                                      />
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => handleAddAction(practice.id)}
                                      >
                                        Add
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2 text-xs"
                                        onClick={handleCancelAddAction}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setAddingActionFor(practice.id)}
                                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-0.5"
                                    >
                                      <Plus className="h-2.5 w-2.5" />
                                      Add Action
                                    </button>
                                  )}
                                </div>
                              </CollapsibleContent>
                            )}
                          </Collapsible>
                        )
                      })
                    )}

                    {/* Add Practice Input */}
                    {addingPracticeFor === habit.id ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          value={newPracticeName}
                          onChange={(e) => setNewPracticeName(e.target.value)}
                          placeholder="Practice name"
                          className="h-7 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddPractice(habit.id)
                            if (e.key === 'Escape') handleCancelAdd()
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => handleAddPractice(habit.id)}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={handleCancelAdd}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingPracticeFor(habit.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Practice
                      </button>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </CardContent>
      </Card>

      {/* Enter Transition - subtle link below habits */}
      <div className="flex justify-center">
        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
          <ArrowRightLeft className="h-4 w-4" />
          Enter Transition
        </button>
      </div>

      {/* Edit Dialogs */}
      <HabitEditDialog
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onToggleActive={() => editingHabit && toggleHabitActive(editingHabit.id)}
      />

      <PracticeEditDialog
        open={!!editingPractice}
        onOpenChange={(open) => !open && setEditingPractice(null)}
        practice={editingPractice}
        habitName={editingPracticeHabitName}
        onSave={handleSavePractice}
        onToggleActive={() => editingPractice && togglePracticeActive(editingPractice.id)}
      />

      <ActionEditDialog
        open={!!editingAction}
        onOpenChange={(open) => !open && setEditingAction(null)}
        action={editingAction}
        practiceName={editingActionPracticeName}
        onSave={handleSaveAction}
        onToggleActive={() => editingAction && toggleActionActive(editingAction.id)}
      />

      <TargetEditDialog
        open={!!editingTarget}
        onOpenChange={(open) => !open && setEditingTarget(null)}
        target={editingTarget}
        habits={habits}
        onSave={handleSaveTarget}
        onDelete={deleteTarget}
      />
    </div>
  )
}
