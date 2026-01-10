import { useMemo } from 'react'
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
import { Sun, Moon, ChevronRight, ChevronDown } from 'lucide-react'
import {
  getHabitBadgeClassesByColor,
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
  getPracticesForHabit,
  getBehaviorsForPractice,
} from '@/data/mockData'

export default function ShelfView() {
  const navigate = useNavigate()

  // Use shared habits from context
  const { habits, activeHabits } = useHabits()

  // Today's date key
  const today = new Date()
  const todayKey = formatDateKey(today)

  // Get preparation and closure for today (read-only, managed in Today view)
  const dayPreparation = mockPreparations[todayKey] || null
  const dayClosure = mockClosures[todayKey] || null

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
      transitions: todayEntries.filter(e => e.type === 'transition').length,
      minutes: todayEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
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
      caution: weekEntries.filter(e => e.type === 'caution').length,
      transitions: weekEntries.filter(e => e.type === 'transition').length,
      highlights: weekEntries.filter(e => e.highlight).length,
      minutes: weekEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
    }
  }, [today])

  // Calculate this month's stats
  const monthStats = useMemo(() => {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const monthEntries = mockEntries.filter(entry => {
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
    return mockEntries
      .filter(e => e.highlight && !e.archived_at)
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      .slice(0, 3)
  }, [])

  // Group targets by status
  const targets = useMemo(() => {
    return {
      active: mockTargets.filter(t => t.status === 'active'),
      planned: mockTargets.filter(t => t.status === 'planned'),
      parked: mockTargets.filter(t => t.status === 'parked'),
    }
  }, [])

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
              const behaviorCount = practices.reduce((acc, p) => acc + getBehaviorsForPractice(p.id).length, 0)
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
                        {behaviorCount > 0 && ` · ${behaviorCount} ${behaviorCount === 1 ? 'behavior' : 'behaviors'}`}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-2 space-y-1">
                      {practices.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No practices yet</p>
                      ) : (
                        practices.map(practice => {
                          const behaviors = getBehaviorsForPractice(practice.id)

                          if (behaviors.length === 0) {
                            return (
                              <p key={practice.id} className="text-sm py-1">{practice.name}</p>
                            )
                          }

                          return (
                            <Collapsible key={practice.id}>
                              <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium py-1 hover:text-foreground/80 [&[data-state=open]>svg]:rotate-180">
                                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                                {practice.name}
                                <span className="text-xs text-muted-foreground font-normal">({behaviors.length})</span>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <ul className="ml-4 space-y-0.5 pb-1">
                                  {behaviors.map(behavior => (
                                    <li key={behavior.id} className="text-sm text-muted-foreground flex items-center gap-2">
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                      {behavior.name}
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

      {/* Targets */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Targets</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => navigate('/attention#targets')}
            >
              Go to Targets
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
