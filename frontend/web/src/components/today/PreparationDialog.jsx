import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function PreparationDialog({ open, onOpenChange, onSubmit, existingPreparation }) {
  const [note, setNote] = useState(existingPreparation?.note || '')
  const [isRestDay, setIsRestDay] = useState(existingPreparation?.rest_day || false)

  const handleSubmit = (e) => {
    e.preventDefault()

    const preparation = {
      id: existingPreparation?.id || Date.now(),
      period_type: 'day',
      period_start: new Date().toISOString().split('T')[0],
      note: note.trim() || null,
      rest_day: isRestDay,
      created_at: existingPreparation?.created_at || new Date().toISOString(),
    }

    onSubmit(preparation)
    onOpenChange(false)
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen && !existingPreparation) {
      setNote('')
      setIsRestDay(false)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existingPreparation ? 'Edit Preparation' : 'Start Your Day'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set your intention for today. What matters given your reality right now?
          </p>

          {/* Note */}
          <div className="space-y-2">
            <Label>What's the focus today?</Label>
            <Textarea
              placeholder="e.g., Focus on architecture planning. Take it easy on exercise - hips still recovering."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
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
