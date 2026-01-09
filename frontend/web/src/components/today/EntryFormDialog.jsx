import { useState, useMemo } from 'react'
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
import { mockHabits, getPracticesForHabit } from '@/data/mockData'

const ENTRY_TYPES = [
  { value: 'habit', label: 'Habit' },
  { value: 'life', label: 'Life' },
  { value: 'caution', label: 'Caution' },
]

export default function EntryFormDialog({ open, onOpenChange, onSubmit }) {
  const [entryType, setEntryType] = useState('habit')
  const [habitId, setHabitId] = useState('')
  const [practiceId, setPracticeId] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [note, setNote] = useState('')

  const activeHabits = useMemo(() => mockHabits.filter(h => h.active), [])

  const practices = useMemo(() => {
    if (!habitId) return []
    return getPracticesForHabit(Number(habitId))
  }, [habitId])

  const selectedHabit = useMemo(() => {
    return activeHabits.find(h => h.id === Number(habitId))
  }, [habitId, activeHabits])

  const selectedPractice = useMemo(() => {
    return practices.find(p => p.id === Number(practiceId))
  }, [practiceId, practices])

  const resetForm = () => {
    setEntryType('habit')
    setHabitId('')
    setPracticeId('')
    setDurationMinutes('')
    setNote('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const now = new Date()
    const entry = {
      id: Date.now(),
      type: entryType,
      occurred_at: now.toISOString(),
      duration_minutes: durationMinutes ? Number(durationMinutes) : null,
      note: note || null,
    }

    if (entryType === 'habit') {
      entry.habit = selectedHabit?.name || null
      entry.practice = selectedPractice?.name || null
      entry.habit_id = habitId ? Number(habitId) : null
      entry.practice_id = practiceId ? Number(practiceId) : null
    }

    onSubmit(entry)
    resetForm()
    onOpenChange(false)
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const canSubmit = () => {
    if (entryType === 'habit') {
      return habitId !== ''
    }
    // Life and caution entries just need a note or duration
    return note.trim() !== '' || durationMinutes !== ''
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Entry Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={entryType} onValueChange={(value) => {
              setEntryType(value)
              setHabitId('')
              setPracticeId('')
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
              <Select value={habitId} onValueChange={(value) => {
                setHabitId(value)
                setPracticeId('')
              }}>
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
              <Select value={practiceId} onValueChange={setPracticeId}>
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

          {/* Note */}
          <div className="space-y-2">
            <Label>Note <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea
              placeholder={
                entryType === 'habit'
                  ? 'What did you work on?'
                  : entryType === 'life'
                  ? 'What happened? (e.g., Family time, errands, travel)'
                  : 'What behavior to note? (e.g., Alcohol, poor sleep)'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit()}>
              Add Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
