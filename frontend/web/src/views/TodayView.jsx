import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TodayView() {
  // Mock data
  const entries = [
    {
      id: 1,
      type: 'habit',
      habit: 'Software',
      practice: 'Architecture Planning',
      occurred_at: '2026-01-09T10:00:00',
      duration_minutes: 90,
      note: 'Worked on The Shelf frontend planning.',
    },
    {
      id: 2,
      type: 'habit',
      habit: 'Exercise',
      practice: 'Walking',
      occurred_at: '2026-01-09T14:00:00',
      duration_minutes: 45,
      note: 'Afternoon walk with the dogs.',
    },
    {
      id: 3,
      type: 'life',
      occurred_at: '2026-01-09T16:00:00',
      duration_minutes: 60,
      note: 'Errands and groceries.',
    },
  ]

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
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
        <Button>Add Entry</Button>
      </div>

      {/* Preparation Note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-muted-foreground">
            No preparation yet. Start your day with intention?
          </p>
        </CardContent>
      </Card>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-muted-foreground">No entries yet today.</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Add your first entry to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          entries.map(entry => (
            <Card key={entry.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={entry.type === 'habit' ? 'default' : 'secondary'}
                      >
                        {entry.type === 'habit' ? entry.habit : entry.type}
                      </Badge>
                      {entry.practice && (
                        <span className="text-sm text-muted-foreground">
                          {entry.practice}
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-sm text-foreground">{entry.note}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{formatTime(entry.occurred_at)}</div>
                    {entry.duration_minutes && (
                      <div>{entry.duration_minutes} min</div>
                    )}
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
    </div>
  )
}
