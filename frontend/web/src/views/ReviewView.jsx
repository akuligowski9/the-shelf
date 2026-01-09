import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ReviewView() {
  // Mock accomplishments
  const accomplishments = [
    {
      id: 1,
      type: 'highlight',
      text: 'Completed architecture planning for The Shelf',
      date: '2026-01-09',
    },
    {
      id: 2,
      type: 'target_completed',
      text: 'Finished Spanish Chapter 5',
      date: '2026-01-08',
    },
  ]

  const reflections = [
    {
      id: 1,
      type: 'weekly',
      period: 'Jan 1-7, 2026',
      note: 'Good balance this week. Started The Shelf project with intention.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review</h1>
        <p className="text-muted-foreground">Reflect on what happened</p>
      </div>

      {/* Time Range */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">This Week</span>
            <Button variant="ghost" size="sm">Change</Button>
          </div>
        </CardContent>
      </Card>

      {/* Accomplishments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accomplishments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {accomplishments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No highlights this period.
            </p>
          ) : (
            accomplishments.map(item => (
              <div key={item.id} className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">
                  {item.type === 'highlight' ? 'Highlight' : 'Completed'}
                </Badge>
                <div>
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* New Reflection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Write a Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full h-24 p-3 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What patterns do you notice? What does this period mean to you?"
          />
          <Button variant="secondary" size="sm">
            Save Reflection
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Past Reflections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Past Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reflections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reflections saved yet.
            </p>
          ) : (
            reflections.map(reflection => (
              <div key={reflection.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{reflection.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {reflection.period}
                  </span>
                </div>
                <p className="text-sm">{reflection.note}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
