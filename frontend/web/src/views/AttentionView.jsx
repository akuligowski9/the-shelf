import { useState } from 'react'
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
import { ChevronDown, Plus } from 'lucide-react'
import { colorPalette, getHabitBadgeClassesByColor } from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'

export default function AttentionView() {
  // Shared habits state from context
  const {
    habits,
    updateHabitColor,
    toggleHabitActive,
    getHabitByName,
    getPracticesForHabit,
    togglePracticeActive,
    addPractice,
    getBehaviorsForPractice,
    toggleBehaviorActive,
    addBehavior,
  } = useHabits()

  // Track which habit is showing the add practice input
  const [addingPracticeFor, setAddingPracticeFor] = useState(null)
  const [newPracticeName, setNewPracticeName] = useState('')

  // Track which practice is showing the add behavior input
  const [addingBehaviorFor, setAddingBehaviorFor] = useState(null)
  const [newBehaviorName, setNewBehaviorName] = useState('')

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

  const handleAddBehavior = (practiceId) => {
    if (newBehaviorName.trim()) {
      addBehavior(practiceId, newBehaviorName.trim())
      setNewBehaviorName('')
      setAddingBehaviorFor(null)
    }
  }

  const handleCancelAddBehavior = () => {
    setNewBehaviorName('')
    setAddingBehaviorFor(null)
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

                <CollapsibleContent>
                  <div className="ml-7 pl-3 border-l border-border space-y-1 pb-2">
                    {practices.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-1">No practices yet</p>
                    ) : (
                      practices.map(practice => {
                        const behaviors = getBehaviorsForPractice(practice.id)
                        const activeBehaviors = behaviors.filter(b => b.active)

                        return (
                          <Collapsible key={practice.id}>
                            <div className="flex items-center justify-between py-1">
                              <CollapsibleTrigger className="flex items-center gap-2 hover:text-foreground/80 [&[data-state=open]>svg]:rotate-180">
                                <span className={practice.active ? 'text-sm' : 'text-sm text-muted-foreground'}>
                                  {practice.name}
                                </span>
                                {behaviors.length > 0 && (
                                  <>
                                    <span className="text-xs text-muted-foreground">
                                      ({activeBehaviors.length}/{behaviors.length})
                                    </span>
                                    <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform duration-200" />
                                  </>
                                )}
                              </CollapsibleTrigger>
                              <button
                                onClick={() => togglePracticeActive(practice.id)}
                                className="text-xs text-muted-foreground hover:text-foreground"
                              >
                                {practice.active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>

                            <CollapsibleContent>
                              <div className="ml-4 pl-3 border-l border-border/50 space-y-1 pb-1">
                                {behaviors.map(behavior => (
                                  <div
                                    key={behavior.id}
                                    className="flex items-center justify-between py-0.5"
                                  >
                                    <span className={behavior.active ? 'text-xs' : 'text-xs text-muted-foreground'}>
                                      {behavior.name}
                                    </span>
                                    <button
                                      onClick={() => toggleBehaviorActive(behavior.id)}
                                      className="text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      {behavior.active ? 'Deactivate' : 'Activate'}
                                    </button>
                                  </div>
                                ))}

                                {/* Add Behavior Input */}
                                {addingBehaviorFor === practice.id ? (
                                  <div className="flex items-center gap-2 pt-1">
                                    <Input
                                      value={newBehaviorName}
                                      onChange={(e) => setNewBehaviorName(e.target.value)}
                                      placeholder="Behavior name"
                                      className="h-6 text-xs"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddBehavior(practice.id)
                                        if (e.key === 'Escape') handleCancelAddBehavior()
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={() => handleAddBehavior(practice.id)}
                                    >
                                      Add
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs"
                                      onClick={handleCancelAddBehavior}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAddingBehaviorFor(practice.id)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground pt-0.5"
                                  >
                                    <Plus className="h-2.5 w-2.5" />
                                    Add Behavior
                                  </button>
                                )}
                              </div>
                            </CollapsibleContent>
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
