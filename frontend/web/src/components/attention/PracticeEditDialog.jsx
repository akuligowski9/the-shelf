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
import RichTextEditor from '@/components/ui/rich-text-editor'

export default function PracticeEditDialog({
  open,
  onOpenChange,
  practice,
  habitName,
  onSave,
  onToggleActive,
}) {
  const [name, setName] = useState('')
  const [details, setDetails] = useState('')

  useEffect(() => {
    if (practice) {
      setName(practice.name)
      setDetails(practice.details || '')
    }
  }, [practice])

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), details: details || null })
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Details - Rich Text Editor */}
          <div className="space-y-2">
            <Label>Details</Label>
            <p className="text-xs text-muted-foreground">
              Add routine details, instructions, or notes that you want to reference when doing this practice.
            </p>
            <RichTextEditor
              value={details}
              onChange={setDetails}
              placeholder="Add workout routine, instructions, steps..."
              className="min-h-[200px]"
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
