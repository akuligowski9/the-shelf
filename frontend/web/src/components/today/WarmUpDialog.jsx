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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sunrise } from 'lucide-react'
import {
  mockHabits,
  getWarmUpTemplatesForHabit,
  renderWarmUpTemplate,
} from '@/data/mockData'

export default function WarmUpDialog({
  open,
  onOpenChange,
  onSubmit,
  entry,
}) {
  const [templateId, setTemplateId] = useState('')
  const [warmUpNote, setWarmUpNote] = useState('')

  const habit = useMemo(() => {
    if (!entry) return null
    return mockHabits.find(h => h.name === entry.habit)
  }, [entry])

  const templates = useMemo(() => {
    if (!habit) return []
    return getWarmUpTemplatesForHabit(habit.id)
  }, [habit])

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === Number(templateId))
  }, [templateId, templates])

  const renderedTemplate = useMemo(() => {
    if (!selectedTemplate || !habit) return ''
    return renderWarmUpTemplate(selectedTemplate, habit.name, new Date().toISOString())
  }, [selectedTemplate, habit])

  // Initialize when dialog opens
  useEffect(() => {
    if (open) {
      if (templates.length > 0) {
        setTemplateId(String(templates[0].id))
      }
      setWarmUpNote(entry?.warm_up_note || '')
    }
  }, [open, templates, entry])

  const handleSubmit = () => {
    onSubmit({
      ...entry,
      warm_up_template_id: templateId ? Number(templateId) : null,
      warm_up_at: new Date().toISOString(),
      warm_up_note: warmUpNote.trim() || null,
    })

    resetForm()
    onOpenChange(false)
  }

  const resetForm = () => {
    setTemplateId('')
    setWarmUpNote('')
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
            <Sunrise className="h-5 w-5 text-primary" />
            Warm-up: {entry.habit}
          </DialogTitle>
          <DialogDescription>
            {entry.practice && <span className="block">{entry.practice}</span>}
            Run your warm-up ritual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No warm-up templates for {entry.habit}. You can create them in the Attention view.
            </p>
          ) : (
            <>
              {/* Template Selector */}
              <div className="space-y-2">
                <Label>Warm-up template</Label>
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

              {/* Template Content */}
              {selectedTemplate && (
                <div className="rounded-md border bg-muted/30 h-[200px] overflow-y-auto p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                    {renderedTemplate}
                  </div>
                </div>
              )}
            </>
          )}

          <Separator />

          {/* Session Preparation Notes */}
          <div className="space-y-2">
            <Label>Session preparation</Label>
            <Textarea
              placeholder="What's your focus for this session? Any intentions to set?"
              value={warmUpNote}
              onChange={(e) => setWarmUpNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
