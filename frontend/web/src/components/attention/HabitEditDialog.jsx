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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { colorPalette } from '@/lib/colors'
import { useHabits } from '@/context/HabitsContext'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react'
import TemplateEditDialog from './TemplateEditDialog'

export default function HabitEditDialog({
  open,
  onOpenChange,
  habit,
  onSave,
}) {
  const {
    getWarmUpTemplatesForHabit,
    getCoolDownTemplatesForHabit,
    addWarmUpTemplate,
    addCoolDownTemplate,
    updateWarmUpTemplate,
    updateCoolDownTemplate,
    deleteWarmUpTemplate,
    deleteCoolDownTemplate,
  } = useHabits()

  const [name, setName] = useState('')
  const [targetMinutes, setTargetMinutes] = useState('')
  const [color, setColor] = useState('sage')
  const [trackActions, setTrackActions] = useState(false)
  const [warmUpsOpen, setWarmUpsOpen] = useState(false)
  const [coolDownsOpen, setCoolDownsOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [editingType, setEditingType] = useState(null)

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setTargetMinutes(habit.target_minutes?.toString() || '30')
      setColor(habit.color || 'sage')
      setTrackActions(habit.track_actions || false)
    }
  }, [habit])

  const warmUpTemplates = habit ? getWarmUpTemplatesForHabit(habit.id) : []
  const coolDownTemplates = habit ? getCoolDownTemplatesForHabit(habit.id) : []

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name: name.trim(),
        target_minutes: Number(targetMinutes) || 30,
        color,
        track_actions: trackActions,
      })
      onOpenChange(false)
    }
  }

  const handleAddTemplate = (type) => {
    setEditingTemplate({ habit_id: habit.id })
    setEditingType(type)
  }

  const handleEditTemplate = (template, type) => {
    setEditingTemplate(template)
    setEditingType(type)
  }

  const handleSaveTemplate = (updates) => {
    if (editingTemplate?.id) {
      // Editing existing
      if (editingType === 'warmup') {
        updateWarmUpTemplate(editingTemplate.id, updates)
      } else {
        updateCoolDownTemplate(editingTemplate.id, updates)
      }
    } else {
      // Creating new
      if (editingType === 'warmup') {
        addWarmUpTemplate(habit.id, updates.name, updates.content, updates.has_dynamic_elements)
      } else {
        addCoolDownTemplate(habit.id, updates.name, updates.content, updates.has_dynamic_elements)
      }
    }
    setEditingTemplate(null)
    setEditingType(null)
  }

  const handleDeleteTemplate = (templateId) => {
    if (editingType === 'warmup') {
      deleteWarmUpTemplate(templateId)
    } else {
      deleteCoolDownTemplate(templateId)
    }
    setEditingTemplate(null)
    setEditingType(null)
  }

  if (!habit) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Habit name"
              />
            </div>

            {/* Target Minutes */}
            <div className="space-y-2">
              <Label>Daily Target (minutes)</Label>
              <Input
                type="number"
                min="1"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(e.target.value)}
                placeholder="30"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(colorPalette).map(([key, colorObj]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    className={`w-7 h-7 rounded-full ${colorObj.dot} transition-all ${
                      color === key
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : 'hover:ring-2 hover:ring-offset-2 hover:ring-border'
                    }`}
                    aria-label={colorObj.name}
                  />
                ))}
              </div>
            </div>

            {/* Track Actions Toggle */}
            <label className="flex items-center gap-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trackActions}
                onChange={(e) => setTrackActions(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium">Track Actions</span>
                <p className="text-xs text-muted-foreground">
                  Enable to add specific actions (e.g., Squats, Push-ups) under practices
                </p>
              </div>
            </label>

            <Separator />

            {/* Warm-up Templates */}
            <Collapsible open={warmUpsOpen} onOpenChange={setWarmUpsOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full py-2 text-left">
                  <div className="flex items-center gap-2">
                    {warmUpsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">Warm-up Templates</span>
                    <span className="text-xs text-muted-foreground">
                      ({warmUpTemplates.length})
                    </span>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pl-6 pb-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Prompts shown before starting a session
                </p>
                {warmUpTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No warm-up templates yet
                  </p>
                ) : (
                  warmUpTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {template.name}
                        </p>
                        {!template.active && (
                          <span className="text-xs text-muted-foreground">
                            (inactive)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template, 'warmup')}
                        aria-label="Edit template"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleAddTemplate('warmup')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Warm-up Template
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Cool-down Templates */}
            <Collapsible open={coolDownsOpen} onOpenChange={setCoolDownsOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full py-2 text-left">
                  <div className="flex items-center gap-2">
                    {coolDownsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">Cool-down Templates</span>
                    <span className="text-xs text-muted-foreground">
                      ({coolDownTemplates.length})
                    </span>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pl-6 pb-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Prompts shown when ending a session
                </p>
                {coolDownTemplates.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No cool-down templates yet
                  </p>
                ) : (
                  coolDownTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {template.name}
                        </p>
                        {!template.active && (
                          <span className="text-xs text-muted-foreground">
                            (inactive)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template, 'cooldown')}
                        aria-label="Edit template"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleAddTemplate('cooldown')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Cool-down Template
                </Button>
              </CollapsibleContent>
            </Collapsible>
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

      {/* Template Edit Dialog */}
      <TemplateEditDialog
        open={!!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setEditingTemplate(null)
            setEditingType(null)
          }
        }}
        template={editingTemplate}
        templateType={editingType}
        onSave={handleSaveTemplate}
        onDelete={editingTemplate?.id ? handleDeleteTemplate : undefined}
      />
    </>
  )
}
