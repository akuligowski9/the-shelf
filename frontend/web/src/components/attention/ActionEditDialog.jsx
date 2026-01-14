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

export default function ActionEditDialog({
  open,
  onOpenChange,
  action,
  practiceName,
  onSave,
  onDelete,
}) {
  const [name, setName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (action) {
      setName(action.name)
      setConfirmDelete(false)
    }
  }, [action])

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim() })
      onOpenChange(false)
    }
  }

  if (!action) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Action</DialogTitle>
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
              placeholder="Action name"
            />
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
                    onDelete?.(action.id)
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
