import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { colorPalette, getHabitBadgeClassesByColor } from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'

export default function AttentionView() {
  // Shared habits state from context
  const { habits, updateHabitColor, toggleHabitActive, getHabitByName } = useHabits()

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

  // Get habit color classes by habit name
  const getHabitColorByName = (habitName) => {
    const habit = getHabitByName(habitName)
    if (!habit) return ''
    return getHabitBadgeClassesByColor(habit.color || 'sage')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Attention</h1>
        <p className="text-muted-foreground">Manage what gets your attention</p>
      </div>

      {/* Transition Window Indicator */}
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <span className="text-sm">Not in a transition window</span>
          <Button variant="outline" size="sm">Enter Transition</Button>
        </CardContent>
      </Card>

      {/* Habits */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Habits</CardTitle>
          <Button variant="outline" size="sm">Add Habit</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {habits.map(habit => {
            const habitColor = colorPalette[habit.color] || colorPalette.forest
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between py-2"
              >
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
                  <span className={habit.active ? '' : 'text-muted-foreground'}>
                    {habit.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {habit.target_minutes} min
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHabitActive(habit.id)}
                  >
                    {habit.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            )
          })}
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
                    <Badge variant="outline" className={`ml-2 ${getHabitColorByName(target.habit)}`}>
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
                    <Badge variant="outline" className={`ml-2 ${getHabitColorByName(target.habit)}`}>
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
