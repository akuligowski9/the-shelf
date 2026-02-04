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
import { Clock, Activity, AlertTriangle } from 'lucide-react'

function formatDuration(minutes) {
  if (!minutes) return '0 min'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export default function ClosureDialog({ open, onOpenChange, onSubmit, todayStats, habitBreakdown, existingClosure }) {
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
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Today's Activity</p>
                <span className="text-lg font-semibold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDuration(todayStats.minutes)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                {todayStats.habits > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-[hsl(var(--color-ui-accent))]" />
                    {todayStats.habits} {todayStats.habits === 1 ? 'habit session' : 'habit sessions'}
                  </span>
                )}
                {todayStats.caution > 0 && (
                  <span className="flex items-center gap-1.5 text-[hsl(var(--color-terracotta))]">
                    <AlertTriangle className="h-4 w-4" />
                    {todayStats.caution} caution
                  </span>
                )}
              </div>

              {/* Habit breakdown */}
              {habitBreakdown && habitBreakdown.length > 0 && (
                <div className="pt-2 border-t border-border/50 space-y-1">
                  {habitBreakdown.map(({ habit, minutes, count }) => (
                    <div key={habit} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{habit}</span>
                      <span>{formatDuration(minutes)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="closure-note">
              Closing thoughts
              <span className="text-muted-foreground text-xs ml-1">(optional)</span>
            </Label>
            <Textarea
              id="closure-note"
              placeholder="How did today feel? What worked well? Anything to carry forward?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              className="resize-none"
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
