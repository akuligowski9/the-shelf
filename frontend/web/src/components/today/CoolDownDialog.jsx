import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sunset } from 'lucide-react'
import {
  mockHabits,
  getCoolDownTemplatesForHabit,
} from '@/data/mockData'

export default function CoolDownDialog({
  open,
  onOpenChange,
  onSubmit,
  entry,
}) {
  const [templateId, setTemplateId] = useState('')
  const [coolDownNote, setCoolDownNote] = useState('')
  const [showTemplate, setShowTemplate] = useState(false)

  const habit = useMemo(() => {
    if (!entry) return null
    return mockHabits.find(h => h.name === entry.habit)
  }, [entry])

  const templates = useMemo(() => {
    if (!habit) return []
    return getCoolDownTemplatesForHabit(habit.id)
  }, [habit])

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === Number(templateId))
  }, [templateId, templates])

  // Initialize when dialog opens
  useEffect(() => {
    if (open && entry) {
      setCoolDownNote(entry.cool_down_note || '')
      if (templates.length > 0) {
        setTemplateId(String(templates[0].id))
      }
    }
  }, [open, entry, templates])

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit({
      ...entry,
      cool_down_template_id: templateId ? Number(templateId) : null,
      cool_down_note: coolDownNote.trim() || null,
    })

    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setTemplateId('')
    setCoolDownNote('')
    setShowTemplate(false)
  }

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  if (!entry) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sunset className="h-5 w-5 text-primary" />
            End Session
          </DialogTitle>
          <DialogDescription>
            Close out this {entry.habit} session. Capture what happened and what's next.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Session Summary */}
          <div className="bg-muted/50 dark:bg-[hsl(30_18%_18%)] dark:border dark:border-[hsl(30_20%_28%)] rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">{entry.habit}</p>
            {entry.practice && (
              <p className="text-sm text-muted-foreground">{entry.practice}</p>
            )}
            {entry.duration_minutes && (
              <p className="text-sm text-muted-foreground">{entry.duration_minutes} minutes</p>
            )}
            {entry.warm_up_note && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Warm-up intention:</p>
                <p className="text-sm">{entry.warm_up_note}</p>
              </div>
            )}
          </div>

          {/* Template Selector */}
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Cool-down template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <Label>Template</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplate(!showTemplate)}
                >
                  {showTemplate ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showTemplate && (
                <div className="rounded-md border bg-muted/30 dark:bg-[hsl(30_18%_18%)] dark:border-[hsl(30_20%_28%)] h-[150px] overflow-y-auto p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                    {selectedTemplate.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No templates message */}
          {templates.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No cool-down templates for this habit. You can add them in the Attention view.
            </p>
          )}

          <Separator />

          {/* Cool-down Note */}
          <div className="space-y-2">
            <Label>Session reflection</Label>
            <Textarea
              placeholder="What did you accomplish? What's the next concrete step?"
              value={coolDownNote}
              onChange={(e) => setCoolDownNote(e.target.value)}
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
              End Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
