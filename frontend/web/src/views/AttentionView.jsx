import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { ChevronDown, ChevronRight, Plus, ArrowRightLeft, GripVertical, MoreHorizontal, Calendar, Clock } from 'lucide-react'
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
import HabitEditDialog from '@/components/attention/HabitEditDialog'
import PracticeEditDialog from '@/components/attention/PracticeEditDialog'
import ActionEditDialog from '@/components/attention/ActionEditDialog'
import TargetEditDialog from '@/components/attention/TargetEditDialog'

// Modal list item component (draggable)
function ModalListItem({ target, habitName, habitColorClasses, onEdit, isOnBoard, position, colorScheme, isCompleted }) {
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

  const bgClass = isOnBoard ? colorScheme?.highlight || '' : ''

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-lg cursor-grab active:cursor-grabbing ${bgClass} ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        {isOnBoard && (
          <span className={`text-xs font-medium ${colorScheme?.number || 'text-muted-foreground'}`}>
            #{position}
          </span>
        )}
        <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
          {target.name}
        </span>
        {habitName && (
          <Badge
            variant="outline"
            className={`text-xs ${isCompleted ? 'opacity-60' : ''} ${habitColorClasses}`}
          >
            {habitName}
          </Badge>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onEdit(target)
        }}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Edit
      </button>
    </div>
  )
}

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

  const hasDate = target.start_date || target.end_date
  const hasDuration = target.planned_duration

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {habitName && (
          <Badge variant="outline" className={`text-xs ${habitColorClasses} ${isCompleted ? 'opacity-50' : ''}`}>
            {habitName}
          </Badge>
        )}
        {hasDate && (
          <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isCompleted ? 'opacity-50' : ''}`}>
            <Calendar className="h-3 w-3" />
            {target.start_date && target.end_date
              ? `${formatDate(target.start_date)} - ${formatDate(target.end_date)}`
              : target.end_date
                ? formatDate(target.end_date)
                : formatDate(target.start_date)}
          </span>
        )}
        {!hasDate && hasDuration && (
          <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isCompleted ? 'opacity-50' : ''}`}>
            <Clock className="h-3 w-3" />
            ~{target.planned_duration}
          </span>
        )}
      </div>
    </div>
  )
}

// Column color schemes for visual distinction
const columnColors = {
  active: {
    header: 'bg-emerald-100 dark:bg-emerald-950/50',
    text: 'text-emerald-800 dark:text-emerald-300',
    badge: 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    dropzone: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    dropzoneHover: 'bg-emerald-100/60 dark:bg-emerald-900/30',
    highlight: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800',
    number: 'text-emerald-600 dark:text-emerald-400',
  },
  planned: {
    header: 'bg-sky-100 dark:bg-sky-950/50',
    text: 'text-sky-800 dark:text-sky-300',
    badge: 'bg-sky-200/80 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300',
    dropzone: 'bg-sky-50/50 dark:bg-sky-950/20',
    dropzoneHover: 'bg-sky-100/60 dark:bg-sky-900/30',
    highlight: 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800',
    number: 'text-sky-600 dark:text-sky-400',
  },
  parked: {
    header: 'bg-slate-100 dark:bg-slate-800/50',
    text: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-200/80 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300',
    dropzone: 'bg-slate-50/50 dark:bg-slate-900/20',
    dropzoneHover: 'bg-slate-100/60 dark:bg-slate-800/30',
    highlight: 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-300 dark:border-slate-700',
    number: 'text-slate-500 dark:text-slate-400',
  },
  done: {
    header: 'bg-violet-100 dark:bg-violet-950/50',
    text: 'text-violet-800 dark:text-violet-300',
    badge: 'bg-violet-200/80 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300',
    dropzone: 'bg-violet-50/50 dark:bg-violet-950/20',
    dropzoneHover: 'bg-violet-100/60 dark:bg-violet-900/30',
    highlight: 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800',
    number: 'text-violet-600 dark:text-violet-400',
  },
}

// Kanban column component
function KanbanColumn({ id, title, count, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const colors = columnColors[id] || columnColors.planned

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[240px] shrink-0 md:w-auto md:shrink ${className || ''}`}
    >
      <div className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg ${colors.header}`}>
        <h4 className={`text-sm font-semibold ${colors.text}`}>{title}</h4>
        {count !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
            {count}
          </span>
        )}
      </div>
      <div
        className={`flex-1 min-h-[100px] p-2 rounded-lg transition-colors ${
          isOver ? colors.dropzoneHover : colors.dropzone
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
    updateHabitTrackActions,
    getPracticesForHabit,
    practices,
    togglePracticeActive,
    addPractice,
    updatePracticeName,
    updatePracticeDetails,
    getActionsForPractice,
    addAction,
    updateActionName,
    deleteAction,
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
    getWarmUpTemplatesForHabit,
    getCoolDownTemplatesForHabit,
    // Transitions
    inTransition,
    transitionChanges,
    cascadeChanges,
    startTransition,
    completeTransition,
    cancelTransition,
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

  // Track adding new caution behavior
  const [addingBehavior, setAddingBehavior] = useState(false)
  const [showAllBehaviors, setShowAllBehaviors] = useState(false)
  const [newBehaviorName, setNewBehaviorName] = useState('')
  const [editingBehavior, setEditingBehavior] = useState(null)

  // Edit dialogs state
  const [editingHabit, setEditingHabit] = useState(null)
  const [editingPractice, setEditingPractice] = useState(null)
  const [editingPracticeHabitName, setEditingPracticeHabitName] = useState('')
  const [editingAction, setEditingAction] = useState(null)
  const [editingActionPracticeName, setEditingActionPracticeName] = useState('')
  const [editingTarget, setEditingTarget] = useState(null)

  // Modal states
  const [showDoneModal, setShowDoneModal] = useState(false)
  const [showPlannedModal, setShowPlannedModal] = useState(false)
  const [showActiveModal, setShowActiveModal] = useState(false)
  const [showParkedModal, setShowParkedModal] = useState(false)
  const [showCompleteTransitionDialog, setShowCompleteTransitionDialog] = useState(false)
  const [transitionNote, setTransitionNote] = useState('')

  // Column limits
  const COLUMN_LIMIT = 5

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

  // Caution Behaviors handlers
  const cautionHabit = habits.find(h => h.type === 'caution')
  const cautionBehaviors = cautionHabit ? getPracticesForHabit(cautionHabit.id) : []

  const handleAddBehavior = () => {
    if (newBehaviorName.trim() && cautionHabit) {
      addPractice(cautionHabit.id, newBehaviorName.trim())
      setNewBehaviorName('')
      setAddingBehavior(false)
    }
  }

  const handleCancelAddBehavior = () => {
    setNewBehaviorName('')
    setAddingBehavior(false)
  }

  const handleSaveBehavior = (updates) => {
    if (editingBehavior) {
      updatePracticeName(editingBehavior.id, updates.name)
    }
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
      updateHabitTrackActions(editingHabit.id, updates.track_actions)
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
                    <>
                      {activeTargets.slice(0, COLUMN_LIMIT).map(target => {
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
                      })}
                      {activeTargets.length > COLUMN_LIMIT && (
                        <button
                          onClick={() => setShowActiveModal(true)}
                          className="w-full text-xs text-muted-foreground hover:text-foreground py-2 text-center border border-dashed rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          See all ({activeTargets.length})
                        </button>
                      )}
                    </>
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
                    <>
                      {plannedTargets.slice(0, COLUMN_LIMIT).map(target => {
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
                      })}
                      {plannedTargets.length > COLUMN_LIMIT && (
                        <button
                          onClick={() => setShowPlannedModal(true)}
                          className="w-full text-xs text-muted-foreground hover:text-foreground py-2 text-center border border-dashed rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          See all ({plannedTargets.length})
                        </button>
                      )}
                    </>
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
                    <>
                      {parkedTargets.slice(0, COLUMN_LIMIT).map(target => {
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
                      })}
                      {parkedTargets.length > COLUMN_LIMIT && (
                        <button
                          onClick={() => setShowParkedModal(true)}
                          className="w-full text-xs text-muted-foreground hover:text-foreground py-2 text-center border border-dashed rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          See all ({parkedTargets.length})
                        </button>
                      )}
                    </>
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
                      {/* Show top completed */}
                      {completedTargets.slice(0, COLUMN_LIMIT).map(target => {
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
                      {(completedTargets.length > COLUMN_LIMIT || archivedTargets.length > 0) && (
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

      {/* Active Modal */}
      <Dialog open={showActiveModal} onOpenChange={setShowActiveModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={columnColors.active.text}>
              Active ({activeTargets.length})
            </DialogTitle>
          </DialogHeader>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event
              if (over && active.id !== over.id) {
                const oldIndex = activeTargets.findIndex(t => t.id === active.id)
                const newIndex = activeTargets.findIndex(t => t.id === over.id)
                if (oldIndex !== -1 && newIndex !== -1) {
                  const newOrder = arrayMove(activeTargets, oldIndex, newIndex)
                  reorderTargets(newOrder.map(t => t.id))
                }
              }
            }}
          >
            <SortableContext
              items={activeTargets.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {activeTargets.map((target, index) => {
                  const habitName = getHabitNameById(target.habit_id)
                  return (
                    <ModalListItem
                      key={target.id}
                      target={target}
                      habitName={habitName}
                      habitColorClasses={getHabitColorByName(habitName)}
                      onEdit={(t) => {
                        setShowActiveModal(false)
                        setEditingTarget(t)
                      }}
                      isOnBoard={index < COLUMN_LIMIT}
                      position={index + 1}
                      colorScheme={columnColors.active}
                    />
                  )
                })}
                {activeTargets.length > COLUMN_LIMIT && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Items 1-{COLUMN_LIMIT} are visible on the board
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </DialogContent>
      </Dialog>

      {/* Planned Modal */}
      <Dialog open={showPlannedModal} onOpenChange={setShowPlannedModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={columnColors.planned.text}>
              Planned ({plannedTargets.length})
            </DialogTitle>
          </DialogHeader>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event
              if (over && active.id !== over.id) {
                const oldIndex = plannedTargets.findIndex(t => t.id === active.id)
                const newIndex = plannedTargets.findIndex(t => t.id === over.id)
                if (oldIndex !== -1 && newIndex !== -1) {
                  const newOrder = arrayMove(plannedTargets, oldIndex, newIndex)
                  reorderTargets(newOrder.map(t => t.id))
                }
              }
            }}
          >
            <SortableContext
              items={plannedTargets.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {plannedTargets.map((target, index) => {
                  const habitName = getHabitNameById(target.habit_id)
                  return (
                    <ModalListItem
                      key={target.id}
                      target={target}
                      habitName={habitName}
                      habitColorClasses={getHabitColorByName(habitName)}
                      onEdit={(t) => {
                        setShowPlannedModal(false)
                        setEditingTarget(t)
                      }}
                      isOnBoard={index < COLUMN_LIMIT}
                      position={index + 1}
                      colorScheme={columnColors.planned}
                    />
                  )
                })}
                {plannedTargets.length > COLUMN_LIMIT && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Items 1-{COLUMN_LIMIT} are visible on the board
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </DialogContent>
      </Dialog>

      {/* Parked Modal */}
      <Dialog open={showParkedModal} onOpenChange={setShowParkedModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={columnColors.parked.text}>
              Parking Lot ({parkedTargets.length})
            </DialogTitle>
          </DialogHeader>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event
              if (over && active.id !== over.id) {
                const oldIndex = parkedTargets.findIndex(t => t.id === active.id)
                const newIndex = parkedTargets.findIndex(t => t.id === over.id)
                if (oldIndex !== -1 && newIndex !== -1) {
                  const newOrder = arrayMove(parkedTargets, oldIndex, newIndex)
                  reorderTargets(newOrder.map(t => t.id))
                }
              }
            }}
          >
            <SortableContext
              items={parkedTargets.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {parkedTargets.map((target, index) => {
                  const habitName = getHabitNameById(target.habit_id)
                  return (
                    <ModalListItem
                      key={target.id}
                      target={target}
                      habitName={habitName}
                      habitColorClasses={getHabitColorByName(habitName)}
                      onEdit={(t) => {
                        setShowParkedModal(false)
                        setEditingTarget(t)
                      }}
                      isOnBoard={index < COLUMN_LIMIT}
                      position={index + 1}
                      colorScheme={columnColors.parked}
                    />
                  )
                })}
                {parkedTargets.length > COLUMN_LIMIT && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Items 1-{COLUMN_LIMIT} are visible on the board
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </DialogContent>
      </Dialog>

      {/* Done Modal */}
      <Dialog open={showDoneModal} onOpenChange={setShowDoneModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={columnColors.done.text}>Done</DialogTitle>
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(event) => {
                    const { active, over } = event
                    if (over && active.id !== over.id) {
                      const oldIndex = completedTargets.findIndex(t => t.id === active.id)
                      const newIndex = completedTargets.findIndex(t => t.id === over.id)
                      if (oldIndex !== -1 && newIndex !== -1) {
                        const newOrder = arrayMove(completedTargets, oldIndex, newIndex)
                        reorderTargets(newOrder.map(t => t.id))
                      }
                    }
                  }}
                >
                  <SortableContext
                    items={completedTargets.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {completedTargets.map((target, index) => {
                        const habitName = getHabitNameById(target.habit_id)
                        return (
                          <ModalListItem
                            key={target.id}
                            target={target}
                            habitName={habitName}
                            habitColorClasses={getHabitColorByName(habitName)}
                            onEdit={(t) => {
                              setShowDoneModal(false)
                              setEditingTarget(t)
                            }}
                            isOnBoard={index < COLUMN_LIMIT}
                            position={index + 1}
                            colorScheme={columnColors.done}
                            isCompleted={true}
                          />
                        )
                      })}
                      {completedTargets.length > COLUMN_LIMIT && (
                        <p className="text-xs text-muted-foreground text-center pt-2">
                          Items 1-{COLUMN_LIMIT} are visible on the board
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {target.name}
                          </span>
                          {habitName && (
                            <Badge
                              variant="outline"
                              className={`text-xs opacity-60 ${getHabitColorByName(habitName)}`}
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

      {/* Habits - Tree View */}
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
        <CardContent>
          <div className="space-y-0.5">
            {habits.filter(h => h.type !== 'caution').map(habit => {
              const habitColor = colorPalette[habit.color] || colorPalette.forest
              const practices = getPracticesForHabit(habit.id)
              const allActions = habit.track_actions ? practices.flatMap(p => getActionsForPractice(p.id)) : []
              const warmUps = getWarmUpTemplatesForHabit(habit.id)
              const coolDowns = getCoolDownTemplatesForHabit(habit.id)

              return (
                <Collapsible key={habit.id}>
                  {/* Habit Level */}
                  <div className="flex items-center group">
                    <CollapsibleTrigger className="flex items-center gap-2 py-1.5 hover:text-foreground/80 flex-1 [&[data-state=open]>svg]:rotate-90">
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
                      <div className={`w-3 h-3 rounded-full ${habitColor.dot}`} />
                      <span className={habit.active ? 'text-sm font-medium' : 'text-sm font-medium text-muted-foreground'}>
                        {habit.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {practices.length}p
                        {habit.track_actions && <> · {allActions.length}a</>}
                        {warmUps.length > 0 && <> · <span className="text-amber-500">↑</span>{warmUps.length}</>}
                        {coolDowns.length > 0 && <> · <span className="text-blue-500">↓</span>{coolDowns.length}</>}
                      </span>
                    </CollapsibleTrigger>
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-2"
                    >
                      Edit
                    </button>
                  </div>

                  <CollapsibleContent>
                    <div className="ml-4 pl-3 border-l border-border/50">
                      {practices.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-1.5 pl-5">No practices</p>
                      ) : (
                        practices.map(practice => {
                          const actions = habit.track_actions ? getActionsForPractice(practice.id) : []

                          // If no actions tracking, just show practice as a simple row
                          if (!habit.track_actions) {
                            return (
                              <div key={practice.id} className="flex items-center group py-1 pl-5">
                                <span className={practice.active ? 'text-sm flex-1' : 'text-sm flex-1 text-muted-foreground'}>
                                  {practice.name}
                                </span>
                                <button
                                  onClick={() => openPracticeEdit(practice, habit.name)}
                                  className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-2"
                                >
                                  Edit
                                </button>
                              </div>
                            )
                          }

                          // With actions tracking, show expandable practice
                          return (
                            <Collapsible key={practice.id}>
                              {/* Practice Level */}
                              <div className="flex items-center group">
                                <CollapsibleTrigger className="flex items-center gap-2 py-1 hover:text-foreground/80 flex-1 [&[data-state=open]>svg]:rotate-90">
                                  <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                                  <span className={practice.active ? 'text-sm' : 'text-sm text-muted-foreground'}>
                                    {practice.name}
                                  </span>
                                  {actions.length > 0 && (
                                    <span className="text-xs text-muted-foreground">{actions.length}</span>
                                  )}
                                </CollapsibleTrigger>
                                <button
                                  onClick={() => openPracticeEdit(practice, habit.name)}
                                  className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-2"
                                >
                                  Edit
                                </button>
                              </div>

                              <CollapsibleContent>
                                <div className="ml-3 pl-3 border-l border-border/30 py-1">
                                  {/* Actions as chips */}
                                  <div className="flex flex-wrap gap-1 pl-2">
                                    {actions.map(action => (
                                      <button
                                        key={action.id}
                                        onClick={() => openActionEdit(action, practice.name)}
                                        className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                                          action.active
                                            ? 'bg-background hover:bg-muted border-border'
                                            : 'bg-muted/30 text-muted-foreground hover:bg-muted border-transparent'
                                        }`}
                                      >
                                        {action.name}
                                      </button>
                                    ))}
                                    {/* Add Action */}
                                    {addingActionFor === practice.id ? (
                                      <div className="flex items-center gap-1">
                                        <Input
                                          value={newActionName}
                                          onChange={(e) => setNewActionName(e.target.value)}
                                          placeholder="Action"
                                          className="h-5 text-xs w-20 px-1.5"
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddAction(practice.id)
                                            if (e.key === 'Escape') handleCancelAddAction()
                                          }}
                                        />
                                        <button
                                          onClick={() => handleAddAction(practice.id)}
                                          className="text-xs text-muted-foreground hover:text-foreground"
                                        >
                                          ✓
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setAddingActionFor(practice.id)}
                                        className="text-xs px-1.5 py-0.5 text-muted-foreground hover:text-foreground"
                                      >
                                        +
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        })
                      )}

                      {/* Add Practice */}
                      {addingPracticeFor === habit.id ? (
                        <div className="flex items-center gap-2 py-1 pl-5">
                          <Input
                            value={newPracticeName}
                            onChange={(e) => setNewPracticeName(e.target.value)}
                            placeholder="Practice name"
                            className="h-6 text-sm w-32"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddPractice(habit.id)
                              if (e.key === 'Escape') handleCancelAdd()
                            }}
                          />
                          <button
                            onClick={() => handleAddPractice(habit.id)}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Add
                          </button>
                          <button
                            onClick={handleCancelAdd}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingPracticeFor(habit.id)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 pl-5"
                        >
                          <Plus className="h-3 w-3" />
                          Practice
                        </button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Caution Behaviors */}
      {cautionHabit && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Caution Behaviors</CardTitle>
              <span className="text-sm text-muted-foreground">
                {cautionBehaviors.filter(b => !b.active).length} inactive
              </span>
            </div>
            {addingBehavior ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newBehaviorName}
                  onChange={(e) => setNewBehaviorName(e.target.value)}
                  placeholder="Behavior name"
                  className="h-8 text-sm w-48"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddBehavior()
                    if (e.key === 'Escape') handleCancelAddBehavior()
                  }}
                />
                <Button size="sm" variant="ghost" className="h-8" onClick={handleAddBehavior}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={handleCancelAddBehavior}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAddingBehavior(true)}>
                Add Behavior
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {cautionBehaviors.length === 0 ? (
              <p className="text-sm text-muted-foreground">No caution behaviors defined</p>
            ) : (
              <div className="space-y-0.5">
                {cautionBehaviors
                  .slice(0, showAllBehaviors ? undefined : 10)
                  .map(behavior => (
                  <div key={behavior.id} className="flex items-center group py-1.5 pl-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 mr-3" />
                    <span className={behavior.active ? 'text-sm flex-1' : 'text-sm flex-1 text-muted-foreground'}>
                      {behavior.name}
                    </span>
                    <button
                      onClick={() => setEditingBehavior(behavior)}
                      className="text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity px-2"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                {cautionBehaviors.length > 10 && (
                  <button
                    onClick={() => setShowAllBehaviors(!showAllBehaviors)}
                    className="text-xs text-muted-foreground hover:text-foreground pt-2 pl-2"
                  >
                    {showAllBehaviors ? 'Show less' : `+${cautionBehaviors.length - 10} more → View all`}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Caution Behavior Edit Dialog */}
      <Dialog open={!!editingBehavior} onOpenChange={(open) => !open && setEditingBehavior(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Behavior</DialogTitle>
          </DialogHeader>
          {editingBehavior && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="behavior-name">Name</Label>
                <Input
                  id="behavior-name"
                  defaultValue={editingBehavior.name}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newName = e.target.value.trim()
                      if (newName && newName !== editingBehavior.name) {
                        updatePracticeName(editingBehavior.id, newName)
                      }
                      setEditingBehavior(null)
                    }
                  }}
                />
              </div>
              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    togglePracticeActive(editingBehavior.id)
                    setEditingBehavior(null)
                  }}
                >
                  {editingBehavior.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    const input = document.getElementById('behavior-name')
                    const newName = input?.value?.trim()
                    if (newName && newName !== editingBehavior.name) {
                      updatePracticeName(editingBehavior.id, newName)
                    }
                    setEditingBehavior(null)
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transition Window */}
      {!inTransition ? (
        <div className="flex justify-center">
          <button
            onClick={startTransition}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Enter Transition
          </button>
        </div>
      ) : (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Transition Window</CardTitle>
              </div>
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust which habits are active. All changes will be recorded as one transition.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Habit toggles */}
            <div className="space-y-2">
              {habits.filter(h => h.type !== 'caution').map(habit => {
                const habitColor = colorPalette[habit.color] || colorPalette.forest
                const change = transitionChanges.find(c => c.habitId === habit.id)
                return (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      change ? 'bg-amber-500/10' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${habitColor.dot}`} />
                      <span className="text-sm font-medium">{habit.name}</span>
                      {change && (
                        <span className="text-xs text-amber-600">
                          ({change.from} → {change.to})
                        </span>
                      )}
                    </div>
                    <Button
                      variant={habit.active ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleHabitActive(habit.id)}
                      className={habit.active ? 'bg-primary' : ''}
                    >
                      {habit.active ? 'Active' : 'Inactive'}
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Changes summary */}
            {(transitionChanges.length > 0 || cascadeChanges.targets.length > 0 || cascadeChanges.practices.length > 0) && (
              <div className="text-sm text-muted-foreground border-t pt-3 space-y-2">
                {transitionChanges.length > 0 && (
                  <div>
                    <span className="font-medium">{transitionChanges.length} habit change{transitionChanges.length !== 1 ? 's' : ''}</span>
                    {' '}will be recorded
                  </div>
                )}
                {cascadeChanges.targets.length > 0 && (
                  <div className="text-xs">
                    <span className="text-amber-600">→</span> {cascadeChanges.targets.length} target{cascadeChanges.targets.length !== 1 ? 's' : ''} moved to Parked
                  </div>
                )}
                {cascadeChanges.practices.length > 0 && (
                  <div className="text-xs">
                    <span className="text-amber-600">→</span> {cascadeChanges.practices.length} practice{cascadeChanges.practices.length !== 1 ? 's' : ''} deactivated
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  cancelTransition()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setTransitionNote('')
                  setShowCompleteTransitionDialog(true)
                }}
                className="flex-1"
                disabled={transitionChanges.length === 0}
              >
                Complete Transition
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialogs */}
      <HabitEditDialog
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        habit={editingHabit}
        onSave={handleSaveHabit}
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
        onDelete={deleteAction}
      />

      <TargetEditDialog
        open={!!editingTarget}
        onOpenChange={(open) => !open && setEditingTarget(null)}
        target={editingTarget}
        habits={habits}
        onSave={handleSaveTarget}
        onDelete={deleteTarget}
      />

      {/* Complete Transition Dialog */}
      <Dialog open={showCompleteTransitionDialog} onOpenChange={setShowCompleteTransitionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Transition</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Summary of habit changes */}
            <div className="space-y-2">
              <Label>Habit Changes</Label>
              <div className="text-sm space-y-1 p-3 bg-muted/50 rounded-md">
                {transitionChanges.map((change, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-medium">{change.habitName}</span>
                    <span className="text-muted-foreground">
                      {change.from} → {change.to}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cascade effects summary */}
            {(cascadeChanges.targets.length > 0 || cascadeChanges.practices.length > 0) && (
              <div className="space-y-2">
                <Label>Cascade Effects</Label>
                <div className="text-sm space-y-2 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
                  {cascadeChanges.targets.length > 0 && (
                    <div>
                      <div className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                        {cascadeChanges.targets.length} target{cascadeChanges.targets.length !== 1 ? 's' : ''} moved to Parked:
                      </div>
                      <ul className="text-muted-foreground text-xs space-y-0.5 ml-3">
                        {cascadeChanges.targets.map(({ id, originalStatus }) => {
                          const target = targets.find(t => t.id === id)
                          return (
                            <li key={id}>
                              {target?.name || `Target ${id}`}
                              <span className="text-muted-foreground/60"> ({originalStatus} → parked)</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {cascadeChanges.practices.length > 0 && (
                    <div>
                      <div className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                        {cascadeChanges.practices.length} practice{cascadeChanges.practices.length !== 1 ? 's' : ''} deactivated:
                      </div>
                      <ul className="text-muted-foreground text-xs space-y-0.5 ml-3">
                        {cascadeChanges.practices.map(practiceId => {
                          const practice = practices.find(p => p.id === practiceId)
                          return (
                            <li key={practiceId}>
                              {practice?.name || `Practice ${practiceId}`}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional note */}
            <div className="space-y-2">
              <Label htmlFor="transition-note">Note (optional)</Label>
              <Textarea
                id="transition-note"
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                placeholder="Why are you making this change?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteTransitionDialog(false)}>
              Back
            </Button>
            <Button onClick={() => {
              completeTransition(transitionNote)
              setShowCompleteTransitionDialog(false)
              setTransitionNote('')
            }}>
              Save Transition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
