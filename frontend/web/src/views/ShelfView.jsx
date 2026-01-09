import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ShelfView() {
  // Mock data - will be replaced with hooks
  const habits = [
    { id: 1, name: 'Software', active: true },
    { id: 2, name: 'Spanish', active: true },
    { id: 3, name: 'Exercise', active: true },
    { id: 4, name: 'Dog Training', active: true },
    { id: 5, name: 'Reading', active: false },
  ]

  const targets = {
    active: [{ id: 1, name: 'The Shelf' }],
    planned: [{ id: 2, name: 'Spanish B1 Certification' }],
    parked: [{ id: 3, name: 'Home Renovation Ideas' }],
  }

  const activeHabits = habits.filter(h => h.active)
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
            <Button variant="outline" className="flex-1">
              Start your day?
            </Button>
            <Button variant="secondary" className="flex-1">
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
              <Badge key={habit.id} variant="secondary">
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
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Active</h4>
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
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Planned</h4>
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
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Parking Lot
              {targets.parked.length > 0 && (
                <span className="ml-2 text-muted-foreground/60">
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
