import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sun, Moon } from 'lucide-react'
import {
  getHabitBadgeClassesByColor,
  getDayPromptClasses,
  getDayPromptIconClass,
  statusColors,
} from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'

export default function ShelfView() {
  // Use shared habits from context
  const { habits, activeHabits } = useHabits()

  const targets = {
    active: [{ id: 1, name: 'The Shelf' }],
    planned: [{ id: 2, name: 'Spanish B1 Certification' }],
    parked: [{ id: 3, name: 'Home Renovation Ideas' }],
  }

  const todayEntryCount = 0

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
            <Button variant="outline" className={`flex-1 ${getDayPromptClasses('start')}`}>
              <Sun className={`h-4 w-4 mr-2 ${getDayPromptIconClass('start')}`} />
              Start your day?
            </Button>
            <Button variant="outline" className={`flex-1 ${getDayPromptClasses('end')}`}>
              <Moon className={`h-4 w-4 mr-2 ${getDayPromptIconClass('end')}`} />
              Done for the day?
            </Button>
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

      {/* Today Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Today</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {todayEntryCount === 0
              ? 'No entries yet'
              : `${todayEntryCount} ${todayEntryCount === 1 ? 'entry' : 'entries'}`
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
