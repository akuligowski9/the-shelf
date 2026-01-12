import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Get date range based on time range and offset
function getDateRange(timeRange, periodOffset) {
  const today = new Date()

  if (timeRange === 'week') {
    // Calendar week: Sunday through Saturday
    const dayOfWeek = today.getDay()
    const startOfCurrentWeek = new Date(today)
    startOfCurrentWeek.setDate(today.getDate() - dayOfWeek + (periodOffset * 7))

    const start = new Date(startOfCurrentWeek)
    const end = new Date(startOfCurrentWeek)
    end.setDate(start.getDate() + 6)

    return { start, end }
  }

  if (timeRange === 'month') {
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
    const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1)
    const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0)

    return { start, end }
  }

  if (timeRange === 'year') {
    const targetYear = today.getFullYear() + periodOffset
    const start = new Date(targetYear, 0, 1)
    const end = new Date(targetYear, 11, 31)

    return { start, end }
  }

  return { start: today, end: today }
}

// Get period label for display
function getPeriodLabel(timeRange, periodOffset, dateRange) {
  const today = new Date()

  if (timeRange === 'month') {
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + periodOffset, 1)
    return targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (timeRange === 'year') {
    return (today.getFullYear() + periodOffset).toString()
  }

  // Week view - show date range with year
  const formatOpts = { month: 'short', day: 'numeric' }
  const year = dateRange.end.getFullYear()
  return `${dateRange.start.toLocaleDateString('en-US', formatOpts)} - ${dateRange.end.toLocaleDateString('en-US', formatOpts)}, ${year}`
}

export default function PeriodSelector({
  timeRange,
  periodOffset,
  onTimeRangeChange,
  onPeriodOffsetChange,
  showYearOption = true,
}) {
  const dateRange = useMemo(() => {
    return getDateRange(timeRange, periodOffset)
  }, [timeRange, periodOffset])

  const periodLabel = useMemo(() => {
    return getPeriodLabel(timeRange, periodOffset, dateRange)
  }, [timeRange, periodOffset, dateRange])

  const handleTimeRangeChange = (newRange) => {
    onTimeRangeChange(newRange)
    onPeriodOffsetChange(0) // Reset offset when changing range
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          {/* Period navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPeriodOffsetChange(periodOffset - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[140px] text-center">
              {periodLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPeriodOffsetChange(Math.min(periodOffset + 1, 0))}
              disabled={periodOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {/* Time range selector */}
          <div className="flex gap-1">
            <Button
              variant={timeRange === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleTimeRangeChange('week')}
            >
              Week
            </Button>
            <Button
              variant={timeRange === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => handleTimeRangeChange('month')}
            >
              Month
            </Button>
            {showYearOption && (
              <Button
                variant={timeRange === 'year' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleTimeRangeChange('year')}
              >
                Year
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Export helper for components that need the date range
export { getDateRange, getPeriodLabel }
