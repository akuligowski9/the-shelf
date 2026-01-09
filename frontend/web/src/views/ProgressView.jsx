import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function ProgressView() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Progress</h1>
        <p className="text-muted-foreground">See where your attention went</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button variant="default" size="sm">Balance</Button>
        <Button variant="outline" size="sm">Patterns</Button>
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

      {/* Chart Placeholder */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-sm">
              Stacked bar chart will appear here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Habit Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filter Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Software</Badge>
            <Badge variant="default">Spanish</Badge>
            <Badge variant="default">Exercise</Badge>
            <Badge variant="default">Dog Training</Badge>
            <Badge variant="secondary">Reading</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-semibold">12</div>
            <div className="text-sm text-muted-foreground">Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-semibold">1</div>
            <div className="text-sm text-muted-foreground">Rest Days</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
