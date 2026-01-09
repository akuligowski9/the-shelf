import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import EntryFormDialog from '@/components/today/EntryFormDialog'
import PreparationDialog from '@/components/today/PreparationDialog'
import ClosureDialog from '@/components/today/ClosureDialog'
import DateNavigator from '@/components/today/DateNavigator'
import { Plus, Star, Pencil, Sun, Moon } from 'lucide-react'
import {
  mockEntries,
  mockPreparations,
  mockClosures,
  formatDateKey,
} from '@/data/mockData'

export default function TodayView() {
  // Date state
  const [selectedDate, setSelectedDate] = useState(new Date())
  const dateKey = formatDateKey(selectedDate)

  // Dialog states
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [prepDialogOpen, setPrepDialogOpen] = useState(false)
  const [closureDialogOpen, setClosureDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)

  // Data states - initialize from mock data
  const [allEntries, setAllEntries] = useState(mockEntries)
  const [preparations, setPreparations] = useState(mockPreparations)
  const [closures, setClosures] = useState(mockClosures)

  // Filter entries for selected date
  const entries = useMemo(() => {
    return allEntries.filter(entry => {
      const entryDate = entry.occurred_at.split('T')[0]
      return entryDate === dateKey
    })
  }, [allEntries, dateKey])

  // Get preparation and closure for selected date
  const preparation = preparations[dateKey] || null
  const closure = closures[dateKey] || null

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
    // Ensure the entry has the correct date
    if (!isEdit) {
      // For new entries on past dates, set occurred_at to the selected date
      const entryDate = entry.occurred_at.split('T')[1]
      entry.occurred_at = `${dateKey}T${entryDate}`
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
    setPreparations(prev => ({
      ...prev,
      [dateKey]: prep,
    }))
  }

  const handleClosureSubmit = (close) => {
    setClosures(prev => ({
      ...prev,
      [dateKey]: close,
    }))
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

  const getBadgeVariant = (type) => {
    switch (type) {
      case 'habit':
        return 'default'
      case 'life':
        return 'secondary'
      case 'caution':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getEntryLabel = (entry) => {
    if (entry.type === 'habit') {
      return entry.habit
    }
    return entry.type.charAt(0).toUpperCase() + entry.type.slice(1)
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

      {/* Add Entry Button */}
      <div className="flex justify-end">
        <Button onClick={() => setEntryDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Preparation Card */}
      <Card className={preparation ? 'border-primary/30 bg-primary/5' : 'border-dashed'}>
        <CardContent className="pt-4 pb-4">
          {preparation ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Day Started</span>
                  {preparation.rest_day && (
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
              {preparation.note && (
                <p className="text-sm text-muted-foreground">{preparation.note}</p>
              )}
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setPrepDialogOpen(true)}
            >
              <Sun className="h-4 w-4 mr-2" />
              {isToday ? 'Start your day with intention?' : 'Add preparation note'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
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
              className={entry.is_highlight ? 'border-primary/30 bg-primary/5' : ''}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getBadgeVariant(entry.type)}>
                        {getEntryLabel(entry)}
                      </Badge>
                      {entry.practice && (
                        <span className="text-sm text-muted-foreground">
                          {entry.practice}
                        </span>
                      )}
                      {entry.is_highlight && (
                        <Star className="h-4 w-4 text-primary fill-primary" />
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-sm text-foreground">{entry.note}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground shrink-0">
                    <div>{formatTime(entry.occurred_at)}</div>
                    {entry.duration_minutes && (
                      <div>{entry.duration_minutes} min</div>
                    )}
                    <div className="flex gap-2 mt-1 justify-end">
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="text-xs text-muted-foreground/60 hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleHighlight(entry.id)}
                        className="text-xs text-muted-foreground/60 hover:text-primary"
                      >
                        {entry.is_highlight ? 'Unhighlight' : 'Highlight'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Closure Card */}
      <Separator />
      <Card className={closure ? 'border-primary/30 bg-primary/5' : ''}>
        <CardContent className="pt-4 pb-4">
          {closure ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Day Closed</span>
              </div>
              {closure.note && (
                <p className="text-sm text-muted-foreground">{closure.note}</p>
              )}
            </div>
          ) : (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setClosureDialogOpen(true)}
            >
              <Moon className="h-4 w-4 mr-2" />
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
        editingEntry={editingEntry}
      />

      <PreparationDialog
        open={prepDialogOpen}
        onOpenChange={setPrepDialogOpen}
        onSubmit={handlePreparationSubmit}
        existingPreparation={preparation}
      />

      <ClosureDialog
        open={closureDialogOpen}
        onOpenChange={setClosureDialogOpen}
        onSubmit={handleClosureSubmit}
        todayStats={dayStats}
      />
    </div>
  )
}
