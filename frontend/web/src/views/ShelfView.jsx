import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sun, Moon, ChevronRight } from 'lucide-react'
import {
  getHabitBadgeClassesByColor,
  getDayPromptClasses,
  getDayPromptIconClass,
  statusColors,
} from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'
import {
  mockEntries,
  mockPreparations,
  mockClosures,
  mockTargets,
  formatDateKey,
} from '@/data/mockData'
import PreparationDialog from '@/components/today/PreparationDialog'
import ClosureDialog from '@/components/today/ClosureDialog'

export default function ShelfView() {
  const navigate = useNavigate()

  // Use shared habits from context
  const { habits, activeHabits } = useHabits()

  // Dialog states
  const [prepDialogOpen, setPrepDialogOpen] = useState(false)
  const [closureDialogOpen, setClosureDialogOpen] = useState(false)

  // Data states
  const [preparations, setPreparations] = useState(mockPreparations)
  const [closures, setClosures] = useState(mockClosures)

  // Today's date key
  const today = new Date()
  const todayKey = formatDateKey(today)

  // Get preparation and closure for today
  const dayPreparation = preparations[todayKey] || null
  const dayClosure = closures[todayKey] || null

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const todayEntries = mockEntries.filter(entry => {
      const entryDate = entry.occurred_at.split('T')[0]
      return entryDate === todayKey && !entry.archived_at
    })
    return {
      habits: todayEntries.filter(e => e.type === 'habit').length,
      life: todayEntries.filter(e => e.type === 'life').length,
      caution: todayEntries.filter(e => e.type === 'caution').length,
      minutes: todayEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
      total: todayEntries.length,
    }
  }, [todayKey])

  // Calculate this week's stats (last 7 days)
  const weekStats = useMemo(() => {
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekEntries = mockEntries.filter(entry => {
      const entryDate = new Date(entry.occurred_at)
      return entryDate >= weekAgo && !entry.archived_at
    })
    return {
      habits: weekEntries.filter(e => e.type === 'habit').length,
      life: weekEntries.filter(e => e.type === 'life').length,
      minutes: weekEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
      total: weekEntries.length,
    }
  }, [today])

  // Group targets by status
  const targets = useMemo(() => {
    return {
      active: mockTargets.filter(t => t.status === 'active'),
      planned: mockTargets.filter(t => t.status === 'planned'),
      parked: mockTargets.filter(t => t.status === 'parked'),
    }
  }, [])

  // Handlers
  const handlePreparationSubmit = (prep) => {
    setPreparations(prev => ({ ...prev, [todayKey]: prep }))
  }

  const handleClosureSubmit = (close) => {
    setClosures(prev => ({ ...prev, [todayKey]: close }))
  }

  const goToToday = () => {
    navigate('/today')
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

      {/* Day Prompts */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            {dayPreparation ? (
              <div className={`flex-1 rounded-md p-3 ${getDayPromptClasses('start')} border`}>
                <div className="flex items-center gap-2">
                  <Sun className={`h-4 w-4 ${getDayPromptIconClass('start')}`} />
                  <span className="text-sm font-medium">Day started</span>
                </div>
                {dayPreparation.note && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dayPreparation.note}</p>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className={`flex-1 shadow-none ${getDayPromptClasses('start')}`}
                onClick={() => setPrepDialogOpen(true)}
              >
                <Sun className={`h-4 w-4 mr-2 ${getDayPromptIconClass('start')}`} />
                Start your day?
              </Button>
            )}
            {dayClosure ? (
              <div className={`flex-1 rounded-md p-3 ${getDayPromptClasses('end')} border`}>
                <div className="flex items-center gap-2">
                  <Moon className={`h-4 w-4 ${getDayPromptIconClass('end')}`} />
                  <span className="text-sm font-medium">Day closed</span>
                </div>
                {dayClosure.note && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{dayClosure.note}</p>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                className={`flex-1 shadow-none ${getDayPromptClasses('end')}`}
                onClick={() => setClosureDialogOpen(true)}
              >
                <Moon className={`h-4 w-4 mr-2 ${getDayPromptIconClass('end')}`} />
                Done for the day?
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Habits Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold">{activeHabits.length}</span>
            <span className="text-muted-foreground">/ {habits.length} active</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeHabits.map(habit => (
              <Badge
                key={habit.id}
                variant="outline"
                className={getHabitBadgeClassesByColor(habit.color || 'forest')}
              >
                {habit.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Targets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusColors.active.dot}`}></span>
              <span className={statusColors.active.text}>Active</span>
            </h4>
            {targets.active.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">No active targets</p>
            ) : (
              <ul className="space-y-1">
                {targets.active.map(t => (
                  <li key={t.id} className="text-sm">{t.name}</li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          {/* Planned */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusColors.planned.dot}`}></span>
              <span className={statusColors.planned.text}>Planned</span>
            </h4>
            {targets.planned.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">Nothing planned</p>
            ) : (
              <ul className="space-y-1">
                {targets.planned.map(t => (
                  <li key={t.id} className="text-sm">{t.name}</li>
                ))}
              </ul>
            )}
          </div>

          <Separator />

          {/* Parked */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusColors.parked.dot}`}></span>
              <span className={statusColors.parked.text}>Parking Lot</span>
              {targets.parked.length > 0 && (
                <span className="text-muted-foreground/60">
                  ({targets.parked.length})
                </span>
              )}
            </h4>
            {targets.parked.length === 0 ? (
              <p className="text-sm text-muted-foreground/60">Empty</p>
            ) : (
              <ul className="space-y-1">
                {targets.parked.slice(0, 3).map(t => (
                  <li key={t.id} className="text-sm text-muted-foreground">{t.name}</li>
                ))}
                {targets.parked.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    +{targets.parked.length - 3} more
                  </li>
                )}
              </ul>
            )}
          </div>
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
            {todayStats.total === 0 ? (
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
            {weekStats.total === 0 ? (
              <p className="text-sm text-muted-foreground">No entries this week</p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{weekStats.total} entries</span>
                <span>·</span>
                <span>{weekStats.habits} habits</span>
                <span>·</span>
                <span>{weekStats.life} life</span>
                <span>·</span>
                <span>{Math.round(weekStats.minutes / 60)}h {weekStats.minutes % 60}m</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <PreparationDialog
        open={prepDialogOpen}
        onOpenChange={setPrepDialogOpen}
        onSubmit={handlePreparationSubmit}
        existingPreparation={dayPreparation}
      />

      <ClosureDialog
        open={closureDialogOpen}
        onOpenChange={setClosureDialogOpen}
        onSubmit={handleClosureSubmit}
        todayStats={todayStats}
      />
    </div>
  )
}
