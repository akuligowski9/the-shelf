import { useMemo, useState } from 'react'
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
import { Sun, Moon, ChevronRight, ChevronDown, Calendar, Clock, GripVertical } from 'lucide-react'
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
import {
  getHabitBadgeClassesByColor,
  getDayPromptIconClass,
  statusColors,
} from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'
import { useEntries } from '@/context/EntriesContext'
import {
  mockPreparations,
  mockClosures,
  formatDateKey,
  getPracticesForHabit,
  getActionsForPractice,
  habitTracksActions,
} from '@/data/mockData'

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
            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground touch-none"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
            <div className="space-y-2 flex-1 min-w-0">
              {/* Target name */}
              <h3 className="font-medium">{target.name}</h3>

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
function CompactSortableCard({ target, habits }) {
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
      className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-sm truncate flex-1">{target.name}</span>
      {habit && (
        <Badge
          variant="outline"
          className={`text-xs ${getHabitBadgeClassesByColor(habit.color || 'sage')}`}
        >
          {habit.name}
        </Badge>
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
  const { habits, activeHabits, targets: contextTargets, reorderTargets, updateTargetStatus } = useHabits()
  const { entries: allEntries } = useEntries()

  // Today's date key
  const today = new Date()
  const todayKey = formatDateKey(today)

  // Get preparation and closure for today (read-only, managed in Today view)
  const dayPreparation = mockPreparations[todayKey] || null
  const dayClosure = mockClosures[todayKey] || null

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
      highlights: weekEntries.filter(e => e.highlight).length,
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
      highlights: monthEntries.filter(e => e.highlight).length,
      minutes: monthEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
    }
  }, [today])

  // Get recent highlights
  const recentHighlights = useMemo(() => {
    return allEntries
      .filter(e => e.highlight && !e.archived_at)
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      .slice(0, 3)
  }, [])

  // Calculate progress for each target (total time from entries)
  const targetProgress = useMemo(() => {
    const progress = {}
    allEntries.forEach(entry => {
      if (entry.target_id && !entry.archived_at) {
        if (!progress[entry.target_id]) {
          progress[entry.target_id] = { minutes: 0, sessions: 0 }
        }
        progress[entry.target_id].minutes += entry.duration_minutes || 0
        progress[entry.target_id].sessions += 1
      }
    })
    return progress
  }, [])

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
  const activeDragTarget = activeDragId
    ? contextTargets.find(t => t.id === activeDragId)
    : null

  // Find which zone a target belongs to
  const findZone = (targetId) => {
    if (targets.active.find(t => t.id === targetId)) return 'active'
    if (targets.planned.find(t => t.id === targetId)) return 'planned'
    if (targets.parked.find(t => t.id === targetId)) return 'parked'
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
    const zoneIds = ['active', 'planned', 'parked']
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
            <span className="text-muted-foreground">/ {habits.length} active</span>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {activeHabits.map(habit => {
              const practices = getPracticesForHabit(habit.id)
              const tracksActions = habitTracksActions(habit.id)
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

      {/* Targets - Drag between zones */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Active Targets - Cards on the Shelf */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">On the Shelf</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${statusColors.active.dot}`}></span>
                <span className={`text-sm ${statusColors.active.text}`}>Active</span>
                <span className="text-sm text-muted-foreground/60">({targets.active.length})</span>
              </div>
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
                  {targets.active.map(t => (
                    <SortableTargetCard
                      key={t.id}
                      target={t}
                      habits={habits}
                      progress={targetProgress[t.id]}
                      formatProgress={formatProgress}
                    />
                  ))}
                </div>
              )}
            </SortableContext>
          </DroppableZone>
        </div>

        {/* Planned & Parked - Compact draggable cards (top 5 each) */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-2 gap-6">
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
                        <CompactSortableCard key={t.id} target={t} habits={habits} />
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
                        <CompactSortableCard key={t.id} target={t} habits={habits} />
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
                    <li key={entry.id} className="text-sm">
                      <span className="text-amber-600 dark:text-amber-400">{entry.habit || entry.type}</span>
                      {entry.practice && (
                        <span className="text-muted-foreground"> · {entry.practice}</span>
                      )}
                      {entry.note && (
                        <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{entry.note}</p>
                      )}
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
