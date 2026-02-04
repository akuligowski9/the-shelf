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
import { Checkbox } from '@/components/ui/checkbox'

export default function PreparationDialog({ open, onOpenChange, onSubmit, existingPreparation }) {
  const [note, setNote] = useState('')
  const [isRestDay, setIsRestDay] = useState(false)

  // Initialize form when dialog opens with existing data
  useEffect(() => {
    if (open && existingPreparation) {
      setNote(existingPreparation.note || '')
      setIsRestDay(existingPreparation.rest_day || false)
    }
  }, [open, existingPreparation])

  const handleSubmit = (e) => {
    e.preventDefault()

    const preparation = {
      id: existingPreparation?.id || Date.now(),
      occurred_at: existingPreparation?.occurred_at || new Date().toISOString(),
      note: note.trim() || null,
      rest_day: isRestDay,
    }

    onSubmit(preparation)
    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setNote('')
    setIsRestDay(false)
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen && !existingPreparation) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Your Day</DialogTitle>
          <DialogDescription>
            Set your intention for today. What matters given your reality right now?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="prep-note">What's the focus?</Label>
            <Textarea
              id="prep-note"
              placeholder="What do you want to accomplish today? Any constraints or priorities?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Rest Day Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rest-day"
              checked={isRestDay}
              onCheckedChange={setIsRestDay}
            />
            <Label htmlFor="rest-day" className="text-sm font-normal cursor-pointer">
              This is an intentional rest day
            </Label>
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
              {existingPreparation ? 'Update' : 'Set Intention'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
