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
import { Separator } from '@/components/ui/separator'
import { colorPalette } from '@/lib/colors'

export default function HabitEditDialog({
  open,
  onOpenChange,
  habit,
  onSave,
  onToggleActive,
}) {
  const [name, setName] = useState('')
  const [targetMinutes, setTargetMinutes] = useState('')
  const [color, setColor] = useState('sage')

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setTargetMinutes(habit.target_minutes?.toString() || '30')
      setColor(habit.color || 'sage')
    }
  }, [habit])

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        target_minutes: Number(targetMinutes) || 30,
        color,
      })
      onOpenChange(false)
    }
  }

  const handleToggleActive = () => {
    onToggleActive()
    onOpenChange(false)
  }

  if (!habit) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name"
            />
          </div>

          {/* Target Minutes */}
          <div className="space-y-2">
            <Label>Daily Target (minutes)</Label>
            <Input
              type="number"
              min="1"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(e.target.value)}
              placeholder="30"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(colorPalette).map(([key, colorObj]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  className={`w-7 h-7 rounded-full ${colorObj.dot} transition-all ${
                    color === key
                      ? 'ring-2 ring-offset-2 ring-primary'
                      : 'hover:ring-2 hover:ring-offset-2 hover:ring-border'
                  }`}
                  title={colorObj.name}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Toggle Active */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleToggleActive}
          >
            {habit.active ? 'Deactivate Habit' : 'Activate Habit'}
          </Button>
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
