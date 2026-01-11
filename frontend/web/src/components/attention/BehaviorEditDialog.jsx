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

export default function BehaviorEditDialog({
  open,
  onOpenChange,
  behavior,
  practiceName,
  onSave,
  onToggleActive,
}) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (behavior) {
      setName(behavior.name)
    }
  }, [behavior])

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

  if (!behavior) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Behavior</DialogTitle>
          {practiceName && (
            <p className="text-sm text-muted-foreground">{practiceName}</p>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Behavior name"
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
            {behavior.active ? 'Deactivate Behavior' : 'Activate Behavior'}
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
