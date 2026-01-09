import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sunrise, ChevronDown, ChevronUp } from 'lucide-react'
import {
  mockHabits,
  getPracticesForHabit,
  getBehaviorsForPractice,
  getWarmUpTemplatesForHabit,
  renderWarmUpTemplate,
} from '@/data/mockData'

export default function StartSessionDialog({
  open,
  onOpenChange,
  onSubmit,
}) {
  const [habitId, setHabitId] = useState('')
  const [practiceId, setPracticeId] = useState('')
  const [selectedBehaviors, setSelectedBehaviors] = useState([])
  const [showWarmUp, setShowWarmUp] = useState(false)
  const [warmUpTemplateId, setWarmUpTemplateId] = useState('')
  const [warmUpCompleted, setWarmUpCompleted] = useState(false)

  const activeHabits = useMemo(() => mockHabits.filter(h => h.active), [])

  const practices = useMemo(() => {
    if (!habitId) return []
    return getPracticesForHabit(Number(habitId))
  }, [habitId])

  const behaviors = useMemo(() => {
    if (!practiceId) return []
    return getBehaviorsForPractice(Number(practiceId))
  }, [practiceId])

  const warmUpTemplates = useMemo(() => {
    if (!habitId) return []
    return getWarmUpTemplatesForHabit(Number(habitId))
  }, [habitId])

  const selectedHabit = useMemo(() => {
    return activeHabits.find(h => h.id === Number(habitId))
  }, [habitId, activeHabits])

  const selectedPractice = useMemo(() => {
    return practices.find(p => p.id === Number(practiceId))
  }, [practiceId, practices])

  const selectedWarmUpTemplate = useMemo(() => {
    return warmUpTemplates.find(t => t.id === Number(warmUpTemplateId))
  }, [warmUpTemplateId, warmUpTemplates])

  const renderedWarmUp = useMemo(() => {
    if (!selectedWarmUpTemplate || !selectedHabit) return ''
    return renderWarmUpTemplate(selectedWarmUpTemplate, selectedHabit.name, new Date().toISOString())
  }, [selectedWarmUpTemplate, selectedHabit])

  // Auto-select first warm-up template when habit changes
  useEffect(() => {
    if (warmUpTemplates.length > 0) {
      setWarmUpTemplateId(String(warmUpTemplates[0].id))
    } else {
      setWarmUpTemplateId('')
    }
  }, [warmUpTemplates])

  const handleSubmit = (e) => {
    e.preventDefault()

    const entry = {
      id: Date.now(),
      type: 'habit',
      habit: selectedHabit.name,
      habit_id: Number(habitId),
      practice: selectedPractice?.name || null,
      practice_id: practiceId ? Number(practiceId) : null,
      behaviors: selectedBehaviors.length > 0 ? selectedBehaviors : null,
      occurred_at: new Date().toISOString(),
      duration_minutes: null,
      note: null,
      is_highlight: false,
      warm_up_template_id: warmUpCompleted && warmUpTemplateId ? Number(warmUpTemplateId) : null,
      warm_up_at: warmUpCompleted ? new Date().toISOString() : null,
      cool_down_note: null,
    }

    onSubmit(entry)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setHabitId('')
    setPracticeId('')
    setSelectedBehaviors([])
    setShowWarmUp(false)
    setWarmUpTemplateId('')
    setWarmUpCompleted(false)
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const handleHabitChange = (value) => {
    setHabitId(value)
    setPracticeId('')
    setSelectedBehaviors([])
    setShowWarmUp(false)
    setWarmUpCompleted(false)
  }

  const handlePracticeChange = (value) => {
    setPracticeId(value)
    setSelectedBehaviors([])
  }

  const toggleBehavior = (behaviorName) => {
    setSelectedBehaviors(prev =>
      prev.includes(behaviorName)
        ? prev.filter(b => b !== behaviorName)
        : [...prev, behaviorName]
    )
  }

  const handleWarmUpComplete = () => {
    setWarmUpCompleted(true)
    setShowWarmUp(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sunrise className="h-5 w-5 text-primary" />
            Start Session
          </DialogTitle>
          <DialogDescription>
            Begin a habit session. This will create an entry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Habit Selector */}
          <div className="space-y-2">
            <Label>Habit</Label>
            <Select value={habitId} onValueChange={handleHabitChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a habit" />
              </SelectTrigger>
              <SelectContent>
                {activeHabits.map(habit => (
                  <SelectItem key={habit.id} value={String(habit.id)}>
                    {habit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Practice Selector */}
          {habitId && practices.length > 0 && (
            <div className="space-y-2">
              <Label>Practice <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={practiceId} onValueChange={handlePracticeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a practice" />
                </SelectTrigger>
                <SelectContent>
                  {practices.map(practice => (
                    <SelectItem key={practice.id} value={String(practice.id)}>
                      {practice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Behaviors Checkboxes */}
          {practiceId && behaviors.length > 0 && (
            <div className="space-y-2">
              <Label>What will you work on?</Label>
              <div className="grid grid-cols-2 gap-2">
                {behaviors.map(behavior => (
                  <div key={behavior.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`behavior-${behavior.id}`}
                      checked={selectedBehaviors.includes(behavior.name)}
                      onCheckedChange={() => toggleBehavior(behavior.name)}
                    />
                    <label
                      htmlFor={`behavior-${behavior.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {behavior.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warm-up Section */}
          {habitId && warmUpTemplates.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {warmUpCompleted ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sunrise className="h-4 w-4" />
                    <span>Warm-up completed</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => setShowWarmUp(!showWarmUp)}
                  >
                    <span className="flex items-center gap-2">
                      <Sunrise className="h-4 w-4" />
                      Run warm-up
                    </span>
                    {showWarmUp ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {showWarmUp && (
                  <div className="space-y-3 pt-2">
                    {/* Template Selector */}
                    {warmUpTemplates.length > 1 && (
                      <Select value={warmUpTemplateId} onValueChange={setWarmUpTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {warmUpTemplates.map(template => (
                            <SelectItem key={template.id} value={String(template.id)}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Template Content */}
                    {selectedWarmUpTemplate && (
                      <div className="rounded-md border bg-muted/30 h-[200px] overflow-y-auto p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                          {renderedWarmUp}
                        </div>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleWarmUpComplete}
                      className="w-full"
                    >
                      Done with warm-up
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex-1" />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!habitId}
            >
              Start Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
