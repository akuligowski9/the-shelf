import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function TargetEditDialog({
  open,
  onOpenChange,
  target,
  habits,
  onSave,
}) {
  const [name, setName] = useState('')
  const [habitId, setHabitId] = useState('none')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (target) {
      setName(target.name || '')
      setHabitId(target.habit_id?.toString() || 'none')
      setStartDate(target.start_date || '')
      setEndDate(target.end_date || '')
    }
  }, [target])

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        habit_id: habitId === 'none' ? null : Number(habitId),
        start_date: startDate || null,
        end_date: endDate || null,
      })
      onOpenChange(false)
    }
  }

  if (!target) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Target</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Target name"
            />
          </div>

          {/* Habit Association */}
          <div className="space-y-2">
            <Label>Associated Habit</Label>
            <Select value={habitId} onValueChange={setHabitId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a habit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No habit</SelectItem>
                {habits.map(habit => (
                  <SelectItem key={habit.id} value={habit.id.toString()}>
                    {habit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link this target to a habit for tracking
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Dates are optional. Leave blank for open-ended targets.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
