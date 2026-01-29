import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Sun, Moon, ChevronRight, ChevronDown, Calendar, Clock, GripVertical, Bookmark, ExternalLink } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  rectIntersection,
  pointerWithin,
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
import {
  getHabitBadgeClassesByColor,
  getDayPromptIconClass,
  statusColors,
} from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'
import { useEntries } from '@/context/EntriesContext'
import { getPreparation, getClosure } from '@/lib/api'
import { formatDateKey } from '@/data/mockData'

// Sortable target card component
function SortableTargetCard({ target, habits, progress, formatProgress }) {
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

  const habit = habits.find(h => h.id === target.habit_id)
  const hasDeadline = target.end_date
  const hasDuration = target.planned_duration

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border-l-4 border-l-primary/60"
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            aria-label="Reorder target"
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
            <div className="space-y-2 flex-1 min-w-0">
              {/* Target name */}
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{target.name}</h3>
                {target.github_issue_url && (
                  <a
                    href={target.github_issue_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="View GitHub Issue"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Habit badge + dates/duration */}
              <div className="flex items-center gap-2 flex-wrap">
                {habit && (
                  <Badge
                    variant="outline"
                    className={getHabitBadgeClassesByColor(habit.color || 'sage')}
                  >
                    {habit.name}
                  </Badge>
                )}
                {hasDeadline && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(target.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {hasDuration && !hasDeadline && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    ~{target.planned_duration}
                  </span>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="text-right shrink-0">
              {progress ? (
                <>
                  <p className="font-semibold text-lg">{formatProgress(progress.minutes)}</p>
                  <p className="text-xs text-muted-foreground">
                    {progress.sessions} {progress.sessions === 1 ? 'session' : 'sessions'}
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No sessions yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact sortable card for Planned/Parked targets
function CompactSortableCard({ target, habits, progress, formatProgress }) {
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

  const habit = habits.find(h => h.id === target.habit_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 rounded-md border bg-secondary hover:bg-accent/50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Reorder target"
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {habit && (
        <Badge
          variant="outline"
          className={`text-xs shrink-0 ${getHabitBadgeClassesByColor(habit.color || 'sage')}`}
        >
          {habit.name}
        </Badge>
      )}
      <span className="text-sm truncate flex-1">{target.name}</span>
      {progress && formatProgress && (
        <span className="text-xs text-muted-foreground shrink-0">
          {formatProgress(progress.minutes)}
        </span>
      )}
    </div>
  )
}

// Droppable zone wrapper
function DroppableZone({ id, children, className }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-primary/50 ring-offset-2' : ''} transition-all`}
    >
      {children}
    </div>
  )
}

export default function ShelfView() {
  const navigate = useNavigate()

  // Use shared habits and targets from context
  const { habits, activeHabits, targets: contextTargets, reorderTargets, updateTargetStatus, getPracticesForHabit, getActionsForPractice } = useHabits()
  const { entries: allEntries } = useEntries()

  // Today's date key
  const today = new Date()
  const todayKey = formatDateKey(today)

  // Preparation and closure state (fetched from API)
  const [dayPreparation, setDayPreparation] = useState(null)
  const [dayClosure, setDayClosure] = useState(null)

  // Fetch preparation and closure for today
  useEffect(() => {
    getPreparation('day', todayKey)
      .then(prep => setDayPreparation(prep))
      .catch(() => setDayPreparation(null))

    getClosure('day', todayKey)
      .then(closure => setDayClosure(closure))
      .catch(() => setDayClosure(null))
  }, [todayKey])

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayEntries = allEntries.filter(entry => {
      const entryDate = entry.occurred_at.split('T')[0]
      return entryDate === todayKey && !entry.archived_at
    })
    return {
      habits: todayEntries.filter(e => e.type === 'habit').length,
      life: todayEntries.filter(e => e.type === 'life').length,
      caution: todayEntries.filter(e => e.type === 'caution').length,
      transitions: todayEntries.filter(e => e.type === 'transition').length,
      minutes: todayEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
      highlights: todayEntries.filter(e => e.is_highlight),
    }
  }, [todayKey])

  // Calculate this week's stats (last 7 days)
  const weekStats = useMemo(() => {
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.occurred_at)
      return entryDate >= weekAgo && !entry.archived_at
    })
    return {
      habits: weekEntries.filter(e => e.type === 'habit').length,
      life: weekEntries.filter(e => e.type === 'life').length,
      caution: weekEntries.filter(e => e.type === 'caution').length,
      transitions: weekEntries.filter(e => e.type === 'transition').length,
      highlights: weekEntries.filter(e => e.is_highlight).length,
      minutes: weekEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
    }
  }, [today])

  // Calculate this month's stats
  const monthStats = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.occurred_at)
      return entryDate >= monthStart && !entry.archived_at
    })
    return {
      habits: monthEntries.filter(e => e.type === 'habit').length,
      life: monthEntries.filter(e => e.type === 'life').length,
      caution: monthEntries.filter(e => e.type === 'caution').length,
      transitions: monthEntries.filter(e => e.type === 'transition').length,
      highlights: monthEntries.filter(e => e.is_highlight).length,
      minutes: monthEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
    }
  }, [today])

  // Get recent highlights
  const recentHighlights = useMemo(() => {
    return allEntries
      .filter(e => e.is_highlight && !e.archived_at)
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      .slice(0, 3)
  }, [allEntries])

  // Calculate progress for each target based on entries linked to that target
  const targetProgress = useMemo(() => {
    const progress = {}
    contextTargets.forEach(target => {
      // Count entries explicitly linked to this target via target_id
      const relevantEntries = allEntries.filter(entry => {
        if (entry.archived_at) return false
        return entry.target_id === target.id
      })

      if (relevantEntries.length > 0) {
        progress[target.id] = {
          minutes: relevantEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0),
          sessions: relevantEntries.length
        }
      }
    })
    return progress
  }, [allEntries, contextTargets])

  // Get shelf sort preference from localStorage
  const getShelfSort = () => {
    try {
      return localStorage.getItem('shelf_target_sort') || 'priority'
    } catch (e) {
      return 'priority'
    }
  }
  const shelfSort = getShelfSort()

  // Group targets by status with configurable sorting (setting only affects planned/parked)
  const targets = useMemo(() => {
    const sortByPriority = (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)

    const getBacklogSortFn = (sortType) => {
      switch (sortType) {
        case 'deadline':
          return (a, b) => {
            // Targets with deadlines come first, sorted by date
            const aDate = a.end_date ? new Date(a.end_date) : null
            const bDate = b.end_date ? new Date(b.end_date) : null
            if (aDate && bDate) return aDate - bDate
            if (aDate) return -1
            if (bDate) return 1
            return (a.sort_order ?? 999) - (b.sort_order ?? 999)
          }
        case 'recent':
          return (a, b) => {
            // Higher ID = more recently added (simple heuristic)
            return b.id - a.id
          }
        case 'priority':
        default:
          return sortByPriority
      }
    }

    const backlogSortFn = getBacklogSortFn(shelfSort)
    return {
      // Active always sorted by priority (drag order)
      active: contextTargets.filter(t => t.status === 'active').sort(sortByPriority),
      // Planned/Parked sorted by user's setting
      planned: contextTargets.filter(t => t.status === 'planned').sort(backlogSortFn),
      parked: contextTargets.filter(t => t.status === 'parked').sort(backlogSortFn),
      // Completed/Archived sorted by recent first
      completed: contextTargets.filter(t => t.status === 'completed').sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
      archived: contextTargets.filter(t => t.status === 'archived').sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)),
    }
  }, [contextTargets, shelfSort])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // Small drag threshold
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Track active drag for overlay
  const [activeDragId, setActiveDragId] = useState(null)
  const [showAllActive, setShowAllActive] = useState(false)
  const activeDragTarget = activeDragId
    ? contextTargets.find(t => t.id === activeDragId)
    : null

  // Find which zone a target belongs to
  const findZone = (targetId) => {
    if (targets.active.find(t => t.id === targetId)) return 'active'
    if (targets.planned.find(t => t.id === targetId)) return 'planned'
    if (targets.parked.find(t => t.id === targetId)) return 'parked'
    if (targets.completed.find(t => t.id === targetId)) return 'completed'
    if (targets.archived.find(t => t.id === targetId)) return 'archived'
    return null
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
    const zoneIds = ['active', 'planned', 'parked', 'completed', 'archived']
    const droppedOnZone = zoneIds.includes(overId) ? overId : null

    // Find source zone
    const sourceZone = findZone(activeId)

    // Determine target zone (either dropped on zone or on item in zone)
    let targetZone = droppedOnZone || findZone(overId)

    if (!sourceZone || !targetZone) return

    // If moving to different zone, update status
    if (sourceZone !== targetZone) {
      updateTargetStatus(activeId, targetZone)
      return
    }

    // Same zone - reorder
    if (activeId !== overId && !droppedOnZone) {
      const zoneTargets = targets[sourceZone]
      const oldIndex = zoneTargets.findIndex(t => t.id === activeId)
      const newIndex = zoneTargets.findIndex(t => t.id === overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(zoneTargets, oldIndex, newIndex)
        reorderTargets(newOrder.map(t => t.id))
      }
    }
  }

  const goToToday = () => {
    navigate('/today')
  }

  // Format minutes as hours/minutes
  const formatProgress = (minutes) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">The Shelf</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => navigate('/attention#targets')}
        >
          Manage Targets
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Targets - Drag between zones */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Active Targets - Cards on the Shelf */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-2 h-2 rounded-full ${statusColors.active.dot}`}></span>
            <span className={`text-sm font-medium ${statusColors.active.text}`}>Active</span>
            <span className="text-sm text-muted-foreground/60">({targets.active.length})</span>
          </div>

          <DroppableZone id="active" className="min-h-[80px] rounded-lg">
            <SortableContext
              items={targets.active.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {targets.active.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No active targets</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">
                      Drag a target here to activate it
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {(showAllActive ? targets.active : targets.active.slice(0, 5)).map(t => (
                    <SortableTargetCard
                      key={t.id}
                      target={t}
                      habits={habits}
                      progress={targetProgress[t.id]}
                      formatProgress={formatProgress}
                    />
                  ))}
                  {targets.active.length > 5 && (
                    <button
                      onClick={() => setShowAllActive(!showAllActive)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors text-left py-2"
                    >
                      {showAllActive
                        ? 'Show less'
                        : `+${targets.active.length - 5} more → View all`}
                    </button>
                  )}
                </div>
              )}
            </SortableContext>
          </DroppableZone>
        </div>

        {/* Target Shelf - 2x2 grid for Planned, Parked, Completed, Archived */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Planned */}
              <DroppableZone id="planned" className="min-h-[60px] rounded-md">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors.planned.dot}`}></span>
                  <span className={statusColors.planned.text}>Planned</span>
                  <span className="text-muted-foreground/60">({targets.planned.length})</span>
                </h4>
                <SortableContext
                  items={targets.planned.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {targets.planned.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 py-2">Drop here to plan</p>
                  ) : (
                    <div className="space-y-2">
                      {targets.planned.slice(0, 5).map(t => (
                        <CompactSortableCard key={t.id} target={t} habits={habits} progress={targetProgress[t.id]} formatProgress={formatProgress} />
                      ))}
                      {targets.planned.length > 5 && (
                        <button
                          onClick={() => navigate('/attention#targets')}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors w-full text-left py-1"
                        >
                          +{targets.planned.length - 5} more → View all
                        </button>
                      )}
                    </div>
                  )}
                </SortableContext>
              </DroppableZone>

              {/* Parked */}
              <DroppableZone id="parked" className="min-h-[60px] rounded-md">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors.parked.dot}`}></span>
                  <span className={statusColors.parked.text}>Parked</span>
                  <span className="text-muted-foreground/60">({targets.parked.length})</span>
                </h4>
                <SortableContext
                  items={targets.parked.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {targets.parked.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 py-2">Drop here to park</p>
                  ) : (
                    <div className="space-y-2">
                      {targets.parked.slice(0, 5).map(t => (
                        <CompactSortableCard key={t.id} target={t} habits={habits} progress={targetProgress[t.id]} formatProgress={formatProgress} />
                      ))}
                      {targets.parked.length > 5 && (
                        <button
                          onClick={() => navigate('/attention#targets')}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors w-full text-left py-1"
                        >
                          +{targets.parked.length - 5} more → View all
                        </button>
                      )}
                    </div>
                  )}
                </SortableContext>
              </DroppableZone>

              {/* Completed */}
              <DroppableZone id="completed" className="min-h-[60px] rounded-md">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors.completed.dot}`}></span>
                  <span className={statusColors.completed.text}>Completed</span>
                  <span className="text-muted-foreground/60">({targets.completed.length})</span>
                </h4>
                <SortableContext
                  items={targets.completed.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {targets.completed.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 py-2">Drop here to complete</p>
                  ) : (
                    <div className="space-y-2">
                      {targets.completed.slice(0, 5).map(t => (
                        <CompactSortableCard key={t.id} target={t} habits={habits} progress={targetProgress[t.id]} formatProgress={formatProgress} />
                      ))}
                      {targets.completed.length > 5 && (
                        <button
                          onClick={() => navigate('/attention#targets')}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors w-full text-left py-1"
                        >
                          +{targets.completed.length - 5} more → View all
                        </button>
                      )}
                    </div>
                  )}
                </SortableContext>
              </DroppableZone>

              {/* Archived */}
              <DroppableZone id="archived" className="min-h-[60px] rounded-md">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors.archived.dot}`}></span>
                  <span className={statusColors.archived.text}>Archived</span>
                  <span className="text-muted-foreground/60">({targets.archived.length})</span>
                </h4>
                <SortableContext
                  items={targets.archived.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {targets.archived.length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 py-2">Drop here to archive</p>
                  ) : (
                    <div className="space-y-2">
                      {targets.archived.slice(0, 5).map(t => (
                        <CompactSortableCard key={t.id} target={t} habits={habits} progress={targetProgress[t.id]} formatProgress={formatProgress} />
                      ))}
                      {targets.archived.length > 5 && (
                        <button
                          onClick={() => navigate('/attention#targets')}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors w-full text-left py-1"
                        >
                          +{targets.archived.length - 5} more → View all
                        </button>
                      )}
                    </div>
                  )}
                </SortableContext>
              </DroppableZone>
            </div>
          </CardContent>
        </Card>

        {/* Drag overlay for smooth animation */}
        <DragOverlay>
          {activeDragTarget && (
            <div className="opacity-80">
              <Card className="border-l-4 border-l-primary/60 shadow-lg">
                <CardContent className="py-3 px-4">
                  <span className="font-medium">{activeDragTarget.name}</span>
                </CardContent>
              </Card>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Habits Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Habits</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate('/attention#habits')}
            >
              Go to Habits
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-semibold">{activeHabits.length}</span>
            <span className="text-muted-foreground">/ {habits.filter(h => h.type !== 'caution').length} active</span>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {activeHabits.map(habit => {
              const practices = getPracticesForHabit(habit.id)
              const tracksActions = habit.track_actions
              const actionCount = tracksActions
                ? practices.reduce((acc, p) => acc + getActionsForPractice(p.id).length, 0)
                : 0
              return (
                <AccordionItem key={habit.id} value={`habit-${habit.id}`} className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={getHabitBadgeClassesByColor(habit.color || 'forest')}
                      >
                        {habit.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {practices.length} {practices.length === 1 ? 'practice' : 'practices'}
                        {actionCount > 0 && ` · ${actionCount} ${actionCount === 1 ? 'action' : 'actions'}`}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-2 space-y-1">
                      {practices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No practices yet</p>
                      ) : (
                        practices.map(practice => {
                          const actions = tracksActions ? getActionsForPractice(practice.id) : []

                          if (actions.length === 0) {
                            return (
                              <p key={practice.id} className="text-sm py-1">{practice.name}</p>
                            )
                          }

                          return (
                            <Collapsible key={practice.id}>
                              <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium py-1 hover:text-foreground/80 [&[data-state=open]>svg]:rotate-180">
                                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                                {practice.name}
                                <span className="text-xs text-muted-foreground font-normal">({actions.length})</span>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <ul className="ml-4 space-y-0.5 pb-1">
                                  {actions.map(action => (
                                    <li key={action.id} className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                      {action.name}
                                    </li>
                                  ))}
                                </ul>
                              </CollapsibleContent>
                            </Collapsible>
                          )
                        })
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={goToToday}
            >
              Go to Today
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today */}
          <div>
            <h4 className="text-sm font-medium mb-2">Today</h4>
            {(todayStats.habits + todayStats.life + todayStats.caution) === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {todayStats.habits > 0 && (
                    <>
                      <span>{todayStats.habits} {todayStats.habits === 1 ? 'habit' : 'habits'}</span>
                      <span className="text-muted-foreground">·</span>
                    </>
                  )}
                  {todayStats.life > 0 && (
                    <>
                      <span>{todayStats.life} life</span>
                      <span className="text-muted-foreground">·</span>
                    </>
                  )}
                  {todayStats.caution > 0 && (
                    <>
                      <span>{todayStats.caution} caution</span>
                      <span className="text-muted-foreground">·</span>
                    </>
                  )}
                  {todayStats.transitions > 0 && (
                    <>
                      <span>{todayStats.transitions} {todayStats.transitions === 1 ? 'transition' : 'transitions'}</span>
                      <span className="text-muted-foreground">·</span>
                    </>
                  )}
                  <span>{todayStats.minutes} min</span>
                  {dayPreparation && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <Sun className={`h-4 w-4 ${getDayPromptIconClass('start')}`} />
                    </>
                  )}
                  {dayClosure && (
                    <>
                      <span className="text-muted-foreground">·</span>
                      <Moon className={`h-4 w-4 ${getDayPromptIconClass('end')}`} />
                    </>
                  )}
                </div>
                {/* Today's highlights */}
                {todayStats.highlights.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {todayStats.highlights.map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Bookmark className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">
                            {entry.habit || entry.type}
                          </span>
                          {entry.practice && (
                            <span className="text-muted-foreground"> · {entry.practice}</span>
                          )}
                          {entry.note && (
                            <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* This Week */}
          <div>
            <h4 className="text-sm font-medium mb-2">This Week</h4>
            {(weekStats.habits + weekStats.life + weekStats.caution) === 0 ? (
              <p className="text-sm text-muted-foreground">No entries this week</p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>{weekStats.habits} habits</span>
                <span>·</span>
                <span>{weekStats.life} life</span>
                <span>·</span>
                <span>{weekStats.caution} caution</span>
                <span>·</span>
                <span>{weekStats.transitions} transitions</span>
                <span>·</span>
                <span>{weekStats.highlights} highlights</span>
                <span>·</span>
                <span>{Math.round(weekStats.minutes / 60)}h {weekStats.minutes % 60}m</span>
              </div>
            )}
          </div>

          <Separator />

          {/* This Month */}
          <div>
            <h4 className="text-sm font-medium mb-2">This Month</h4>
            {(monthStats.habits + monthStats.life + monthStats.caution) === 0 ? (
              <p className="text-sm text-muted-foreground">No entries this month</p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>{monthStats.habits} habits</span>
                <span>·</span>
                <span>{monthStats.life} life</span>
                <span>·</span>
                <span>{monthStats.caution} caution</span>
                <span>·</span>
                <span>{monthStats.transitions} transitions</span>
                <span>·</span>
                <span>{monthStats.highlights} highlights</span>
                <span>·</span>
                <span>{Math.round(monthStats.minutes / 60)}h {monthStats.minutes % 60}m</span>
              </div>
            )}
          </div>

          {/* Recent Highlights */}
          {recentHighlights.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Highlights</h4>
                <ul className="space-y-1.5">
                  {recentHighlights.map(entry => (
                    <li key={entry.id} className="flex items-start gap-2 text-sm">
                      <Bookmark className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{entry.habit || entry.type}</span>
                        {entry.practice && (
                          <span className="text-muted-foreground"> · {entry.practice}</span>
                        )}
                        {entry.note && (
                          <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{entry.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
