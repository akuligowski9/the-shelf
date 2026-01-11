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

export default function PracticeEditDialog({
  open,
  onOpenChange,
  practice,
  habitName,
  onSave,
  onToggleActive,
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (practice) {
      setName(practice.name)
    }
  }, [practice])

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim() })
      onOpenChange(false)
    }
  }

  const handleToggleActive = () => {
    onToggleActive()
    onOpenChange(false)
  }

  if (!practice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Practice</DialogTitle>
          {habitName && (
            <p className="text-sm text-muted-foreground">{habitName}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Practice name"
            />
          </div>

          <Separator />

          {/* Toggle Active */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleToggleActive}
          >
            {practice.active ? 'Deactivate Practice' : 'Activate Practice'}
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
