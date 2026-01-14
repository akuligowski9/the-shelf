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
  onDelete,
}) {
  const [name, setName] = useState('')
  const [habitId, setHabitId] = useState('none')
  const [status, setStatus] = useState('planned')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [plannedDuration, setPlannedDuration] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (target) {
      setName(target.name || '')
      setHabitId(target.habit_id?.toString() || 'none')
      setStatus(target.status || 'planned')
      setStartDate(target.start_date || '')
      setEndDate(target.end_date || '')
      setPlannedDuration(target.planned_duration || '')
      setConfirmDelete(false)
    }
  }, [target])

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        habit_id: habitId === 'none' ? null : Number(habitId),
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        planned_duration: plannedDuration.trim() || null,
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

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="parked">Parked</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Planned Duration */}
          <div className="space-y-2">
            <Label>Planned Duration</Label>
            <Input
              value={plannedDuration}
              onChange={(e) => setPlannedDuration(e.target.value)}
              placeholder="e.g., 1 month, 2 weeks"
            />
            <p className="text-xs text-muted-foreground">
              For targets without specific dates. Shows as "~1 month" on shelf.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onDelete?.(target.id)
                    onOpenChange(false)
                  }}
                >
                  Yes, delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  No
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
