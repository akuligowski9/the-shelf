import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockEntries, mockReflections } from '@/data/mockData'
import { useHabits } from '@/context/HabitsContext'
import { Star, Target, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Helper to get date range boundaries
function getDateRange(rangeType) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (rangeType) {
    case 'this-week': {
      const dayOfWeek = today.getDay()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - dayOfWeek)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return { start: startOfWeek, end: endOfWeek, label: 'This Week' }
    }
    case 'last-week': {
      const dayOfWeek = today.getDay()
      const startOfLastWeek = new Date(today)
      startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7)
      const endOfLastWeek = new Date(startOfLastWeek)
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
      return { start: startOfLastWeek, end: endOfLastWeek, label: 'Last Week' }
    }
    case 'this-month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { start: startOfMonth, end: endOfMonth, label: 'This Month' }
    }
    case 'last-month': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start: startOfLastMonth, end: endOfLastMonth, label: 'Last Month' }
    }
    case 'all-time': {
      return { start: new Date(2020, 0, 1), end: today, label: 'All Time' }
    }
    default:
      return { start: today, end: today, label: 'Today' }
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function ReviewView() {
  const { targets, habits } = useHabits()
  const [timeRange, setTimeRange] = useState('this-week')
  const [highlightFilter, setHighlightFilter] = useState('all')
  const [reflectionText, setReflectionText] = useState('')
  const [reflections, setReflections] = useState(mockReflections)
  const [expandedReflection, setExpandedReflection] = useState(null)

  const dateRange = useMemo(() => getDateRange(timeRange), [timeRange])

  // Get highlighted entries within the date range, filtered by type
  const highlights = useMemo(() => {
    return mockEntries
      .filter(entry => {
        if (!entry.is_highlight) return false
        const entryDate = new Date(entry.occurred_at)
        const inRange = entryDate >= dateRange.start && entryDate <= dateRange.end
        if (!inRange) return false

        // Apply type filter
        if (highlightFilter === 'all') return true
        return entry.type === highlightFilter
      })
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
  }, [dateRange, highlightFilter])

  // Get completed targets (for now, we don't have completed status in mock, but structure is ready)
  const completedTargets = useMemo(() => {
    return targets.filter(t => t.status === 'completed')
  }, [targets])

  // Filter reflections within the date range
  const pastReflections = useMemo(() => {
    return reflections
      .filter(r => {
        const refDate = new Date(r.created_at)
        return refDate >= dateRange.start && refDate <= dateRange.end
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [reflections, dateRange])

  // Get habit name for an entry
  const getHabitName = (entry) => {
    if (entry.habit) return entry.habit
    const habit = habits.find(h => h.id === entry.habit_id)
    return habit?.name || 'Unknown'
  }

  // Save a new reflection
  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return

    const newReflection = {
      id: Math.max(...reflections.map(r => r.id), 0) + 1,
      type: timeRange.includes('week') ? 'weekly' : 'monthly',
      period_start: dateRange.start.toISOString().split('T')[0],
      period_end: dateRange.end.toISOString().split('T')[0],
      period_label: dateRange.label,
      note: reflectionText.trim(),
      created_at: new Date().toISOString(),
    }

    setReflections(prev => [newReflection, ...prev])
    setReflectionText('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review</h1>
        <p className="text-muted-foreground">Reflect on what happened</p>
      </div>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Period</span>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accomplishments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Accomplishments</CardTitle>
          <p className="text-sm text-muted-foreground">
            Highlighted moments and completed targets
          </p>
          <div className="pt-2">
            <ToggleGroup
              type="single"
              value={highlightFilter}
              onValueChange={(value) => value && setHighlightFilter(value)}
              className="justify-start"
            >
              <ToggleGroupItem value="all" size="sm" className="text-xs px-3">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="habit" size="sm" className="text-xs px-3">
                Habits
              </ToggleGroupItem>
              <ToggleGroupItem value="life" size="sm" className="text-xs px-3">
                Life
              </ToggleGroupItem>
              <ToggleGroupItem value="caution" size="sm" className="text-xs px-3">
                Caution
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {highlights.length === 0 && completedTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No highlights or completed targets for this period.
            </p>
          ) : (
            <>
              {/* Highlighted entries */}
              {highlights.map(entry => (
                <div key={entry.id} className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {getHabitName(entry)}
                      </Badge>
                      {entry.practice && (
                        <span className="text-xs text-muted-foreground">
                          {entry.practice}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{entry.note || 'No note'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(entry.occurred_at)}
                      {entry.duration_minutes && ` · ${entry.duration_minutes}min`}
                    </p>
                  </div>
                </div>
              ))}

              {/* Completed targets */}
              {completedTargets.map(target => (
                <div key={target.id} className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0 mt-0.5">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Target Completed
                      </Badge>
                    </div>
                    <p className="text-sm">{target.name}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* New Reflection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Write a Reflection</CardTitle>
          <p className="text-sm text-muted-foreground">
            What patterns do you notice? What does this period mean to you?
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full h-32 p-3 text-sm bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Take a moment to reflect on what happened during this period..."
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              For: {dateRange.label}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveReflection}
              disabled={!reflectionText.trim()}
            >
              Save Reflection
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Past Reflections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Past Reflections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastReflections.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No reflections for this period yet.
            </p>
          ) : (
            pastReflections.map(reflection => (
              <div
                key={reflection.id}
                className="border border-border rounded-md p-3"
              >
                <button
                  onClick={() => setExpandedReflection(
                    expandedReflection === reflection.id ? null : reflection.id
                  )}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {reflection.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {reflection.period_label}
                    </span>
                  </div>
                  {expandedReflection === reflection.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedReflection === reflection.id && (
                  <p className="text-sm mt-3 pt-3 border-t border-border">
                    {reflection.note}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
