import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function ClosureDialog({ open, onOpenChange, onSubmit, todayStats, existingClosure }) {
  const [note, setNote] = useState('')

  // Populate form when editing existing closure
  useEffect(() => {
    if (existingClosure) {
      setNote(existingClosure.note || '')
    }
  }, [existingClosure])

  const isEditing = !!existingClosure

  const handleSubmit = (e) => {
    e.preventDefault()

    const closure = {
      id: existingClosure?.id || Date.now(),
      occurred_at: existingClosure?.occurred_at || new Date().toISOString(),
      note: note.trim() || null,
    }

    onSubmit(closure)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setNote('')
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Closure' : 'Close the Day'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your closing thoughts for the day.'
              : 'Mark the end of your day. This is about stopping cleanly, not perfectly.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Today's Summary */}
          {todayStats && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Today's Activity</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-semibold">{todayStats.habits}</div>
                  <div className="text-xs text-muted-foreground">habits</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{todayStats.life}</div>
                  <div className="text-xs text-muted-foreground">life</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold">{todayStats.minutes}</div>
                  <div className="text-xs text-muted-foreground">minutes</div>
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label>
              Closing thoughts
              <span className="text-muted-foreground text-xs ml-1">(optional)</span>
            </Label>
            <Textarea
              placeholder="How did today feel? Anything to note for tomorrow?"
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
            <Button type="submit">
              {isEditing ? 'Save Changes' : 'Close Day'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
