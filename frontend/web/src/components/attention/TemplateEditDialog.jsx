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
import { Checkbox } from '@/components/ui/checkbox'
import RichTextEditor from '@/components/ui/rich-text-editor'

export default function TemplateEditDialog({
  open,
  onOpenChange,
  template,
  templateType, // 'warmup' or 'cooldown'
  onSave,
  onDelete,
}) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [hasDynamicElements, setHasDynamicElements] = useState(false)

  useEffect(() => {
    if (template) {
      setName(template.name || '')
      setContent(template.content || '')
      setHasDynamicElements(template.has_dynamic_elements || false)
    } else {
      setName('')
      setContent('')
      setHasDynamicElements(false)
    }
  }, [template])

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        content,
        has_dynamic_elements: hasDynamicElements,
      })
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (template?.id && onDelete) {
      onDelete(template.id)
      onOpenChange(false)
    }
  }

  const isNew = !template?.id
  const typeLabel = templateType === 'warmup' ? 'Warm-up' : 'Cool-down'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? `New ${typeLabel} Template` : `Edit ${typeLabel} Template`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label>Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${typeLabel} template name`}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <p className="text-xs text-muted-foreground">
              Write prompts, questions, or checklists to guide your {templateType === 'warmup' ? 'start' : 'end'} of session.
            </p>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder={`Add your ${templateType} content...`}
              className="min-h-[200px]"
            />
          </div>

          {/* Dynamic Elements */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
            <Checkbox
              id="dynamic"
              checked={hasDynamicElements}
              onCheckedChange={setHasDynamicElements}
            />
            <div className="space-y-1">
              <Label htmlFor="dynamic" className="cursor-pointer">
                Has dynamic elements
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable if the template includes placeholders like {'{{last_session_note}}'} that should be filled in automatically.
              </p>
            </div>
          </div>

          {/* Delete */}
          {!isNew && onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              Delete Template
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {isNew ? 'Create Template' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
