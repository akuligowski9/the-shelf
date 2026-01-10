import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import EntryFormDialog from '@/components/today/EntryFormDialog'
import PreparationDialog from '@/components/today/PreparationDialog'
import ClosureDialog from '@/components/today/ClosureDialog'
import WarmUpDialog from '@/components/today/WarmUpDialog'
import CoolDownDialog from '@/components/today/CoolDownDialog'
import DateNavigator from '@/components/today/DateNavigator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Star, Pencil, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import {
  mockEntries,
  mockPreparations,
  mockClosures,
  formatDateKey,
} from '@/data/mockData'
import { useHabits } from '@/context/HabitsContext'
import {
  getHabitBadgeClassesByColor,
  entryTypeColors,
  getDayPromptClasses,
  getDayPromptIconClass,
  highlightColors,
} from '@/lib/colors'

export default function TodayView() {
  // Shared habits from context
  const { getHabitByName } = useHabits()

  // Date state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateKey = formatDateKey(selectedDate)

  // Dialog states
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [prepDialogOpen, setPrepDialogOpen] = useState(false)
  const [closureDialogOpen, setClosureDialogOpen] = useState(false)
  const [warmUpDialogOpen, setWarmUpDialogOpen] = useState(false)
  const [coolDownDialogOpen, setCoolDownDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [warmUpEntry, setWarmUpEntry] = useState(null)
  const [coolDownEntry, setCoolDownEntry] = useState(null)

  // Data states - initialize from mock data
  const [allEntries, setAllEntries] = useState(mockEntries)
  const [allPreparations, setAllPreparations] = useState(mockPreparations)
  const [allClosures, setAllClosures] = useState(mockClosures)

  // Filter entries for selected date (exclude archived)
  const entries = useMemo(() => {
    return allEntries.filter(entry => {
      const entryDate = entry.occurred_at.split('T')[0]
      return entryDate === dateKey && !entry.archived_at
    })
  }, [allEntries, dateKey])

  // Get preparation for selected date (day-level only)
  const dayPreparation = useMemo(() => {
    return allPreparations[dateKey] || null
  }, [allPreparations, dateKey])

  // Get closure for selected date (day-level only)
  const dayClosure = useMemo(() => {
    return allClosures[dateKey] || null
  }, [allClosures, dateKey])

  // Check if viewing today
  const isToday = useMemo(() => {
    const today = new Date()
    return selectedDate.toDateString() === today.toDateString()
  }, [selectedDate])

  // Computed stats
  const dayStats = useMemo(() => ({
    entries: entries.length,
    highlights: entries.filter(e => e.is_highlight).length,
    minutes: entries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0),
  }), [entries])

  // Handlers
  const handleEntrySubmit = (entry, isEdit) => {
    if (!isEdit) {
      const entryTime = entry.occurred_at.split('T')[1]
      entry.occurred_at = `${dateKey}T${entryTime}`
    }

    if (isEdit) {
      setAllEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
    } else {
      setAllEntries(prev => [...prev, entry])
    }
    setEditingEntry(null)
  }

  const handleEditEntry = (entry) => {
    setEditingEntry(entry)
    setEntryDialogOpen(true)
  }

  const handleArchiveEntry = (entryId) => {
    setAllEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, archived_at: new Date().toISOString() }
          : entry
      )
    )
  }

  const handleEntryDialogClose = (isOpen) => {
    setEntryDialogOpen(isOpen)
    if (!isOpen) {
      setEditingEntry(null)
    }
  }

  const toggleHighlight = (entryId) => {
    setAllEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, is_highlight: !entry.is_highlight }
          : entry
      )
    )
  }

  const handlePreparationSubmit = (prep) => {
    setAllPreparations(prev => ({ ...prev, [dateKey]: prep }))
  }

  const handleClosureSubmit = (close) => {
    setAllClosures(prev => ({ ...prev, [dateKey]: close }))
  }

  // Warm-up handlers (for existing entries)
  const handleAddWarmUp = (entry) => {
    setWarmUpEntry(entry)
    setWarmUpDialogOpen(true)
  }

  const handleWarmUpSubmit = (entry) => {
    setAllEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
    setWarmUpEntry(null)
  }

  // Cool-down handlers
  const handleAddCoolDown = (entry) => {
    setCoolDownEntry(entry)
    setCoolDownDialogOpen(true)
  }

  const handleCoolDownSubmit = (entry) => {
    setAllEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
    setCoolDownEntry(null)
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  // Sort entries by time, most recent first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at)
  )

  const getEntryLabel = (entry) => {
    if (entry.type === 'habit') {
      return entry.habit
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1)
  }

  // Get badge style for entry - looks up habit colors from context
  const getEntryBadgeStyle = (entry) => {
    if (entry.type === 'habit' && entry.habit) {
      const habit = getHabitByName(entry.habit)
      const colorKey = habit?.color || 'sage'
      return {
        variant: 'outline',
        className: getHabitBadgeClassesByColor(colorKey)
      }
    }

    const colors = entryTypeColors[entry.type]
    if (colors) {
      return {
        variant: 'outline',
        className: `${colors.bg} ${colors.text} ${colors.border}`
      }
    }

    return { variant: 'secondary', className: '' }
  }

  // Get left border color class for entry card (by entry type)
  const getEntryBorderClass = (entry) => {
    if (entry.type === 'habit') {
      return 'border-l-4 border-l-[hsl(var(--color-ui-accent))]'
    }
    if (entry.type === 'life') {
      return 'border-l-4 border-l-[hsl(var(--color-sky))]'
    }
    if (entry.type === 'caution') {
      return 'border-l-4 border-l-[hsl(var(--color-terracotta))]'
    }
    return ''
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Navigation */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isToday ? 'Today' : formatDateDisplay(selectedDate)}
          </h1>
          {isToday && (
            <p className="text-muted-foreground">
              {formatDateDisplay(selectedDate)}
            </p>
          )}
        </div>
        <DateNavigator
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <Button
          className="bg-[hsl(var(--color-ui-accent))] text-white hover:bg-[hsl(var(--color-ui-accent))]/90 dark:bg-transparent dark:border dark:border-[hsl(var(--color-ui-accent))] dark:text-[hsl(var(--color-ui-accent))] dark:hover:bg-[hsl(var(--color-ui-accent))]/10"
          onClick={() => setEntryDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Day Preparation Card */}
      <Card className={dayPreparation ? `${getDayPromptClasses('start')} border` : ''}>
        <CardContent className="pt-4 pb-4">
          {dayPreparation ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className={`h-4 w-4 ${getDayPromptIconClass('start')}`} />
                  <span className="text-sm font-medium">Day Started</span>
                  {dayPreparation.rest_day && (
                    <Badge variant="outline" className="text-xs">Rest Day</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrepDialogOpen(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
              {dayPreparation.note && (
                <p className="text-sm text-muted-foreground">{dayPreparation.note}</p>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className={`w-full justify-start shadow-none ${getDayPromptClasses('start')}`}
              onClick={() => setPrepDialogOpen(true)}
            >
              <Sun className={`h-4 w-4 mr-2 ${getDayPromptIconClass('start')}`} />
              {isToday ? 'Start your day with intention?' : 'Add preparation note'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-foreground">
        <span>{dayStats.entries} {dayStats.entries === 1 ? 'entry' : 'entries'}</span>
        <span>{dayStats.highlights} highlights</span>
        <span>{dayStats.minutes} min total</span>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">
                {isToday ? 'No entries yet today.' : 'No entries for this day.'}
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {isToday
                  ? 'Add your first entry to get started.'
                  : 'You can still add entries to past days.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedEntries.map(entry => (
            <Card
              key={entry.id}
              className={`${getEntryBorderClass(entry)} ${entry.is_highlight ? highlightColors.bg : ''}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={getEntryBadgeStyle(entry).variant}
                        className={getEntryBadgeStyle(entry).className}
                      >
                        {getEntryLabel(entry)}
                      </Badge>
                      {entry.practice && (
                        <span className="text-sm text-foreground">
                          {entry.practice}
                        </span>
                      )}
                      {entry.is_highlight && (
                        <Star className="h-4 w-4 text-[hsl(var(--color-ui-accent))] fill-[hsl(var(--color-ui-accent))]" />
                      )}
                      {entry.warm_up_at && (
                        <Sunrise className="h-3 w-3 text-muted-foreground" title="Warmed up" />
                      )}
                    </div>

                    {/* Behaviors as comma-separated text */}
                    {entry.behaviors && entry.behaviors.length > 0 && (
                      <p className="text-sm text-[hsl(var(--content-foreground))]">
                        {entry.behaviors.join(', ')}
                      </p>
                    )}

                    {entry.note && (
                      <p className="text-sm text-[hsl(var(--content-foreground))]">{entry.note}</p>
                    )}

                    {/* Warm-up and Cool-down notes */}
                    {(entry.warm_up_note || entry.cool_down_note) && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        {entry.warm_up_note && (
                          <div className="flex items-start gap-2">
                            <Sunrise className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">{entry.warm_up_note}</p>
                          </div>
                        )}
                        {entry.cool_down_note && (
                          <div className="flex items-start gap-2">
                            <Sunset className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">{entry.cool_down_note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <div className="text-[hsl(var(--content-foreground))]">{formatTime(entry.occurred_at)}</div>
                    {entry.duration_minutes && (
                      <div className="text-[hsl(var(--content-foreground))]">{entry.duration_minutes} min</div>
                    )}
                    <div className="flex gap-2 mt-1 justify-end">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-xs text-muted-foreground/80 hover:text-primary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleHighlight(entry.id)}
                        className="text-xs text-muted-foreground/80 hover:text-primary"
                      >
                        {entry.is_highlight ? 'Unhighlight' : 'Highlight'}
                      </button>
                      {/* Session menu for habit entries */}
                      {entry.type === 'habit' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-xs text-muted-foreground/80 hover:text-primary">
                            Session
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAddWarmUp(entry)}>
                              <Sunrise className="h-3 w-3 mr-2" />
                              {entry.warm_up_at ? 'View Warm-up' : 'Warm-up'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddCoolDown(entry)}>
                              <Sunset className="h-3 w-3 mr-2" />
                              {entry.cool_down_note ? 'View Cool-down' : 'Cool-down'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Day Closure Card */}
      <Separator className="bg-border" />
      <Card className={dayClosure ? `${getDayPromptClasses('end')} border` : ''}>
        <CardContent className="pt-4 pb-4">
          {dayClosure ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Moon className={`h-4 w-4 ${getDayPromptIconClass('end')}`} />
                <span className="text-sm font-medium">Day Closed</span>
              </div>
              {dayClosure.note && (
                <p className="text-sm text-muted-foreground">{dayClosure.note}</p>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              className={`w-full shadow-none ${getDayPromptClasses('end')}`}
              onClick={() => setClosureDialogOpen(true)}
            >
              <Moon className={`h-4 w-4 mr-2 ${getDayPromptIconClass('end')}`} />
              {isToday ? 'Close the day?' : 'Add closure note'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EntryFormDialog
        open={entryDialogOpen}
        onOpenChange={handleEntryDialogClose}
        onSubmit={handleEntrySubmit}
        onArchive={handleArchiveEntry}
        editingEntry={editingEntry}
      />

      <PreparationDialog
        open={prepDialogOpen}
        onOpenChange={setPrepDialogOpen}
        onSubmit={handlePreparationSubmit}
        existingPreparation={dayPreparation}
      />

      <ClosureDialog
        open={closureDialogOpen}
        onOpenChange={setClosureDialogOpen}
        onSubmit={handleClosureSubmit}
        todayStats={dayStats}
      />

      <WarmUpDialog
        open={warmUpDialogOpen}
        onOpenChange={setWarmUpDialogOpen}
        onSubmit={handleWarmUpSubmit}
        entry={warmUpEntry}
      />

      <CoolDownDialog
        open={coolDownDialogOpen}
        onOpenChange={setCoolDownDialogOpen}
        onSubmit={handleCoolDownSubmit}
        entry={coolDownEntry}
      />
    </div>
  )
}
