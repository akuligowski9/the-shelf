import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function AttentionView() {
  // Mock data
  const habits = [
    { id: 1, name: 'Software', active: true, target_minutes: 120 },
    { id: 2, name: 'Spanish', active: true, target_minutes: 30 },
    { id: 3, name: 'Exercise', active: true, target_minutes: 60 },
    { id: 4, name: 'Dog Training', active: true, target_minutes: 30 },
    { id: 5, name: 'Reading', active: false, target_minutes: 30 },
  ]

  const targets = {
    active: [
      { id: 1, name: 'The Shelf', habit: 'Software' },
    ],
    planned: [
      { id: 2, name: 'Spanish B1 Certification', habit: 'Spanish' },
    ],
    parked: [
      { id: 3, name: 'Home Renovation Ideas', habit: null },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Attention</h1>
        <p className="text-muted-foreground">Manage what gets your attention</p>
      </div>

      {/* Transition Window Indicator */}
      <Card className="border-accent bg-accent/10">
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <span className="text-sm">Not in a transition window</span>
          <Button variant="ghost" size="sm">Enter Transition</Button>
        </CardContent>
      </Card>

      {/* Habits */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Habits</CardTitle>
          <Button variant="outline" size="sm">Add Habit</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {habits.map(habit => (
            <div
              key={habit.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    habit.active ? 'bg-primary' : 'bg-muted'
                  }`}
                />
                <span className={habit.active ? '' : 'text-muted-foreground'}>
                  {habit.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {habit.target_minutes} min
                </span>
                <Button variant="ghost" size="sm">
                  {habit.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Targets */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Targets</CardTitle>
          <Button variant="outline" size="sm">Add Target</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Active
            </h4>
            {targets.active.map(target => (
              <div
                key={target.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <span>{target.name}</span>
                  {target.habit && (
                    <Badge variant="outline" className="ml-2">
                      {target.habit}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm">Park</Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Planned */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Planned
            </h4>
            {targets.planned.map(target => (
              <div
                key={target.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <span className="text-muted-foreground">{target.name}</span>
                  {target.habit && (
                    <Badge variant="outline" className="ml-2">
                      {target.habit}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm">Activate</Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Parked */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Parking Lot
            </h4>
            {targets.parked.map(target => (
              <div
                key={target.id}
                className="flex items-center justify-between py-2"
              >
                <span className="text-muted-foreground">{target.name}</span>
                <Button variant="ghost" size="sm">Activate</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
