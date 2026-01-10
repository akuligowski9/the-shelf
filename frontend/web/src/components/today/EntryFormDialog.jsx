import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Sunrise, ChevronDown, ChevronUp } from 'lucide-react'
import {
  mockHabits,
  getPracticesForHabit,
  getBehaviorsForPractice,
  getWarmUpTemplatesForHabit,
  renderWarmUpTemplate,
} from '@/data/mockData'

const ENTRY_TYPES = [
  { value: 'habit', label: 'Habit' },
  { value: 'life', label: 'Life' },
  { value: 'caution', label: 'Caution' },
]

export default function EntryFormDialog({ open, onOpenChange, onSubmit, onArchive, editingEntry }) {
  const [entryType, setEntryType] = useState('habit')
  const [habitId, setHabitId] = useState('')
  const [practiceId, setPracticeId] = useState('')
  const [selectedBehaviors, setSelectedBehaviors] = useState([])
  const [durationMinutes, setDurationMinutes] = useState('')
  const [note, setNote] = useState('')

  // Warm-up state
  const [showWarmUp, setShowWarmUp] = useState(false)
  const [warmUpTemplateId, setWarmUpTemplateId] = useState('')
  const [warmUpCompleted, setWarmUpCompleted] = useState(false)
  const [warmUpNote, setWarmUpNote] = useState('')

  const activeHabits = useMemo(() => mockHabits.filter(h => h.active), [])

  const practices = useMemo(() => {
    if (!habitId) return []
    return getPracticesForHabit(Number(habitId))
  }, [habitId])

  const behaviors = useMemo(() => {
    if (!practiceId) return []
    return getBehaviorsForPractice(Number(practiceId))
  }, [practiceId])

  const selectedHabit = useMemo(() => {
    return activeHabits.find(h => h.id === Number(habitId))
  }, [habitId, activeHabits])

  const selectedPractice = useMemo(() => {
    return practices.find(p => p.id === Number(practiceId))
  }, [practiceId, practices])

  // Warm-up templates for selected habit
  const warmUpTemplates = useMemo(() => {
    if (!habitId) return []
    return getWarmUpTemplatesForHabit(Number(habitId))
  }, [habitId])

  const selectedWarmUpTemplate = useMemo(() => {
    return warmUpTemplates.find(t => t.id === Number(warmUpTemplateId))
  }, [warmUpTemplateId, warmUpTemplates])

  const renderedWarmUp = useMemo(() => {
    if (!selectedWarmUpTemplate || !selectedHabit) return ''
    return renderWarmUpTemplate(selectedWarmUpTemplate, selectedHabit.name, new Date().toISOString())
  }, [selectedWarmUpTemplate, selectedHabit])

  // Auto-select first warm-up template when habit changes
  useEffect(() => {
    if (warmUpTemplates.length > 0 && !editingEntry) {
      setWarmUpTemplateId(String(warmUpTemplates[0].id))
    } else if (warmUpTemplates.length === 0) {
      setWarmUpTemplateId('')
    }
  }, [warmUpTemplates, editingEntry])

  // Populate form when editing
  useEffect(() => {
    if (editingEntry) {
      setEntryType(editingEntry.type)
      setDurationMinutes(editingEntry.duration_minutes?.toString() || '')
      setNote(editingEntry.note || '')
      setSelectedBehaviors(editingEntry.behaviors || [])
      setWarmUpNote(editingEntry.warm_up_note || '')
      setWarmUpCompleted(!!editingEntry.warm_up_at)

      if (editingEntry.type === 'habit') {
        const habit = activeHabits.find(h => h.name === editingEntry.habit)
        if (habit) {
          setHabitId(String(habit.id))
          const habitPractices = getPracticesForHabit(habit.id)
          const practice = habitPractices.find(p => p.name === editingEntry.practice)
          if (practice) {
            setPracticeId(String(practice.id))
          }
          if (editingEntry.warm_up_template_id) {
            setWarmUpTemplateId(String(editingEntry.warm_up_template_id))
          }
        }
      }
    }
  }, [editingEntry, activeHabits])

  const resetForm = () => {
    setEntryType('habit')
    setHabitId('')
    setPracticeId('')
    setSelectedBehaviors([])
    setDurationMinutes('')
    setNote('')
    setShowWarmUp(false)
    setWarmUpTemplateId('')
    setWarmUpCompleted(false)
    setWarmUpNote('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const entry = {
      id: editingEntry?.id || Date.now(),
      type: entryType,
      occurred_at: editingEntry?.occurred_at || new Date().toISOString(),
      duration_minutes: durationMinutes ? Number(durationMinutes) : null,
      is_highlight: editingEntry?.is_highlight || false,
      // Warm-up data
      warm_up_template_id: warmUpCompleted && warmUpTemplateId ? Number(warmUpTemplateId) : (editingEntry?.warm_up_template_id || null),
      warm_up_at: warmUpCompleted ? (editingEntry?.warm_up_at || new Date().toISOString()) : (editingEntry?.warm_up_at || null),
      warm_up_note: warmUpNote.trim() || editingEntry?.warm_up_note || null,
      // Preserve cool-down data when editing
      cool_down_note: editingEntry?.cool_down_note || null,
    }

    if (entryType === 'habit') {
      entry.habit = selectedHabit?.name || null
      entry.practice = selectedPractice?.name || null
      entry.habit_id = habitId ? Number(habitId) : null
      entry.practice_id = practiceId ? Number(practiceId) : null
      entry.behaviors = selectedBehaviors.length > 0 ? selectedBehaviors : null
      entry.note = null // Habits don't have notes, use behaviors instead
    } else {
      entry.note = note || null
    }

    onSubmit(entry, !!editingEntry)
    resetForm()
    onOpenChange(false)
  }

  const handleArchive = () => {
    if (editingEntry && onArchive) {
      onArchive(editingEntry.id)
      resetForm()
      onOpenChange(false)
    }
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
    setWarmUpNote('')
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

  const canSubmit = () => {
    if (entryType === 'habit') {
      return habitId !== ''
    }
    return note.trim() !== '' || durationMinutes !== ''
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editingEntry ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          {/* Entry Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={entryType} onValueChange={(value) => {
              setEntryType(value)
              setHabitId('')
              setPracticeId('')
              setSelectedBehaviors([])
              setShowWarmUp(false)
              setWarmUpCompleted(false)
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Habit Selector (only for habit type) */}
          {entryType === 'habit' && (
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
          )}

          {/* Practice Selector (only for habit type with habit selected) */}
          {entryType === 'habit' && habitId && practices.length > 0 && (
            <div className="space-y-2">
              <Label>Practice <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={practiceId} onValueChange={(value) => {
                setPracticeId(value)
                setSelectedBehaviors([])
              }}>
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

          {/* Behaviors (only for habit type with practice selected) */}
          {entryType === 'habit' && practiceId && behaviors.length > 0 && (
            <div className="space-y-2">
              <Label>What did you work on?</Label>
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

          {/* Warm-up Section (only for habits with templates, not when editing) */}
          {entryType === 'habit' && habitId && warmUpTemplates.length > 0 && !editingEntry && (
            <>
              <Separator />
              <div className="space-y-2">
                {warmUpCompleted ? (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sunrise className="h-4 w-4" />
                    <span>Warm-up completed</span>
                    {warmUpNote && (
                      <span className="text-muted-foreground">— {warmUpNote.slice(0, 30)}{warmUpNote.length > 30 ? '...' : ''}</span>
                    )}
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
                      <div className="rounded-md border bg-muted/30 h-[150px] overflow-y-auto p-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                          {renderedWarmUp}
                        </div>
                      </div>
                    )}

                    {/* Session Preparation Notes */}
                    <div className="space-y-2">
                      <Label className="text-xs">Session preparation</Label>
                      <Textarea
                        placeholder="What's your focus for this session?"
                        value={warmUpNote}
                        onChange={(e) => setWarmUpNote(e.target.value)}
                        rows={2}
                      />
                    </div>

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

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration <span className="text-muted-foreground text-xs">(minutes, optional)</span></Label>
            <Input
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>

          {/* Note (only for life/caution entries) */}
          {entryType !== 'habit' && (
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                placeholder={
                  entryType === 'life'
                    ? 'What happened? (e.g., Family time, errands, travel)'
                    : 'What behavior to note? (e.g., Alcohol, poor sleep)'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Archive button (only when editing) */}
          {editingEntry && onArchive && (
            <>
              <Separator />
              <Button
                type="button"
                variant="ghost"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleArchive}
              >
                Archive this entry
              </Button>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit()}>
              {editingEntry ? 'Save Changes' : 'Add Entry'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
