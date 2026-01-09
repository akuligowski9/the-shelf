import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import EntryFormDialog from '@/components/today/EntryFormDialog'
import { Plus, Star } from 'lucide-react'

export default function TodayView() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [entries, setEntries] = useState([
    {
      id: 1,
      type: 'habit',
      habit: 'Software',
      practice: 'Architecture Planning',
      occurred_at: '2026-01-09T10:00:00',
      duration_minutes: 90,
      note: 'Worked on The Shelf frontend planning.',
      is_highlight: true,
    },
    {
      id: 2,
      type: 'habit',
      habit: 'Exercise',
      practice: 'Walking',
      occurred_at: '2026-01-09T14:00:00',
      duration_minutes: 45,
      note: 'Afternoon walk with the dogs.',
      is_highlight: false,
    },
    {
      id: 3,
      type: 'life',
      occurred_at: '2026-01-09T16:00:00',
      duration_minutes: 60,
      note: 'Errands and groceries.',
      is_highlight: false,
    },
  ])

  const handleAddEntry = (newEntry) => {
    setEntries(prev => [...prev, { ...newEntry, is_highlight: false }])
  }

  const toggleHighlight = (entryId) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, is_highlight: !entry.is_highlight }
          : entry
      )
    )
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Today</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Preparation Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            No preparation yet. Start your day with intention?
          </p>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
        <span>
          {entries.filter(e => e.is_highlight).length} highlights
        </span>
        <span>
          {entries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0)} min total
        </span>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">No entries yet today.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Add your first entry to get started.
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
                    <button
                      onClick={() => toggleHighlight(entry.id)}
                      className="text-xs text-muted-foreground/60 hover:text-primary mt-1"
                    >
                      {entry.is_highlight ? 'Remove highlight' : 'Highlight'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Closure Prompt */}
      <Separator />
      <Card>
        <CardContent className="pt-4 pb-4">
          <Button variant="secondary" className="w-full">
            Close the day?
          </Button>
        </CardContent>
      </Card>

      {/* Entry Form Dialog */}
      <EntryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleAddEntry}
      />
    </div>
  )
}
