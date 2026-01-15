import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { useEntries } from '@/context/EntriesContext'
import { useHabits } from '@/context/HabitsContext'
import { getSettings, setSetting, getPreparationsInRange, getClosuresInRange } from '@/lib/api'

// Common timezones grouped by region
const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Central (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Mountain (MT)', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)', offset: 'UTC-10' },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)', offset: 'UTC+1/+2' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)', offset: 'UTC+9' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 'UTC+10/+11' },
  { value: 'UTC', label: 'UTC', offset: 'UTC+0' },
]

// Options for how targets are sorted on the shelf
const SHELF_SORT_OPTIONS = [
  { value: 'priority', label: 'Priority (drag order)', description: 'Manual ordering via drag and drop' },
  { value: 'deadline', label: 'Deadline', description: 'Targets with soonest deadlines first' },
  { value: 'recent', label: 'Recently added', description: 'Newest targets first' },
]

function getDefaultTimezone() {
  // Default to browser's timezone or Eastern
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const match = TIMEZONES.find(tz => tz.value === browserTz)
  return match ? match.value : 'America/New_York'
}

export default function SettingsView() {
  const { theme, setTheme } = useTheme()
  const { habits, practices, actions, targets, warmUpTemplates, coolDownTemplates } = useHabits()
  const { entries } = useEntries()
  const [timezone, setTimezoneState] = useState(getDefaultTimezone)
  const [shelfSort, setShelfSortState] = useState('priority')
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  // Preparations and closures data from API
  const [preparations, setPreparations] = useState([])
  const [closures, setClosures] = useState([])

  // Load settings from API on mount
  useEffect(() => {
    getSettings()
      .then(settings => {
        const tzSetting = settings.find(s => s.key === 'timezone')
        const sortSetting = settings.find(s => s.key === 'shelf_target_sort')
        if (tzSetting?.value) setTimezoneState(tzSetting.value)
        if (sortSetting?.value) setShelfSortState(sortSetting.value)
      })
      .catch(err => console.error('Failed to load settings:', err))
      .finally(() => setSettingsLoaded(true))
  }, [])

  // Load preparations and closures for metrics
  useEffect(() => {
    // Fetch all preparations and closures (using a wide date range)
    const from = '2020-01-01'
    const to = new Date().toISOString().split('T')[0]

    getPreparationsInRange('day', from, to)
      .then(preps => setPreparations(preps))
      .catch(() => setPreparations([]))

    getClosuresInRange('day', from, to)
      .then(cls => setClosures(cls))
      .catch(() => setClosures([]))
  }, [])

  const setTimezone = (tz) => {
    setTimezoneState(tz)
    setSetting('timezone', tz).catch(err => console.error('Failed to save timezone:', err))
  }

  const setShelfSort = (sort) => {
    setShelfSortState(sort)
    setSetting('shelf_target_sort', sort).catch(err => console.error('Failed to save shelf sort:', err))
  }

  const selectedTimezone = TIMEZONES.find(tz => tz.value === timezone)
  const selectedShelfSort = SHELF_SORT_OPTIONS.find(opt => opt.value === shelfSort)

  // Compute data health metrics
  const metrics = useMemo(() => {
    const activeEntries = entries.filter(e => !e.archived_at)
    const habitEntries = activeEntries.filter(e => e.type === 'habit')

    // Get unique days with entries
    const uniqueDays = new Set(activeEntries.map(e => e.occurred_at.split('T')[0]))
    const daysWithEntries = uniqueDays.size

    // Date range
    const dates = activeEntries.map(e => new Date(e.occurred_at)).sort((a, b) => a - b)
    const firstEntry = dates[0]
    const lastEntry = dates[dates.length - 1]

    // Time metrics
    const totalMinutes = activeEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0)

    // Ritual adoption
    const warmUpsUsed = activeEntries.filter(e => e.warm_up_at).length
    const coolDownsUsed = activeEntries.filter(e => e.cool_down_note).length

    // Unique habits logged
    const uniqueHabitsLogged = new Set(habitEntries.map(e => e.habit)).size

    // Averages
    const avgEntriesPerDay = daysWithEntries > 0 ? (activeEntries.length / daysWithEntries).toFixed(1) : 0
    const avgMinutesPerEntry = habitEntries.length > 0
      ? Math.round(habitEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / habitEntries.length)
      : 0
    const avgMinutesPerDay = daysWithEntries > 0 ? Math.round(totalMinutes / daysWithEntries) : 0

    // Rest days from preparations
    const restDays = preparations.filter(p => p.rest_day).length

    // Prep/Closure rates and habits per day
    const daysWithPreps = new Set(preparations.map(p => p.period_start)).size
    const daysWithCloses = new Set(closures.map(c => c.occurred_at?.split('T')[0])).size
    const prepRate = daysWithEntries > 0 ? Math.round((daysWithPreps / daysWithEntries) * 100) : 0
    const closureRate = daysWithEntries > 0 ? Math.round((daysWithCloses / daysWithEntries) * 100) : 0

    // Average habits per day (count habit entries per day, then average)
    const habitsByDay = {}
    habitEntries.forEach(e => {
      const day = e.occurred_at.split('T')[0]
      if (!habitsByDay[day]) habitsByDay[day] = new Set()
      habitsByDay[day].add(e.habit)
    })
    const daysWithHabits = Object.keys(habitsByDay).length
    const totalUniqueHabitsPerDay = Object.values(habitsByDay).reduce((acc, set) => acc + set.size, 0)
    const avgHabitsPerDay = daysWithHabits > 0 ? (totalUniqueHabitsPerDay / daysWithHabits).toFixed(1) : 0

    // Per-habit coverage (percentage of days logged this week/month)
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysInMonth = Math.ceil((today - monthStart) / (1000 * 60 * 60 * 24)) + 1

    const yearStart = new Date(today.getFullYear(), 0, 1)
    const daysInYear = Math.ceil((today - yearStart) / (1000 * 60 * 60 * 24)) + 1

    // Include all habits (active and inactive) for full history
    const habitCoverage = habits.map(habit => {
      const habitEntriesForHabit = habitEntries.filter(e => e.habit === habit.name)
      const habitDays = new Set(habitEntriesForHabit.map(e => e.occurred_at.split('T')[0]))

      const weekDays = [...habitDays].filter(d => new Date(d) >= weekAgo).length
      const monthDays = [...habitDays].filter(d => new Date(d) >= monthStart).length
      const yearDays = [...habitDays].filter(d => new Date(d) >= yearStart).length

      // All-time: days logged / days since first entry
      const sortedDates = habitEntriesForHabit
        .map(e => new Date(e.occurred_at))
        .sort((a, b) => a - b)
      const firstLoggedDate = sortedDates[0]
      const lastLoggedDate = sortedDates[sortedDates.length - 1]
      const daysSinceFirst = firstLoggedDate
        ? Math.ceil((today - firstLoggedDate) / (1000 * 60 * 60 * 24)) + 1
        : 0
      const allTimePercent = daysSinceFirst > 0
        ? Math.round((habitDays.size / daysSinceFirst) * 100)
        : 0

      return {
        name: habit.name,
        active: habit.active,
        weekPercent: Math.round((weekDays / 7) * 100),
        monthPercent: Math.round((monthDays / daysInMonth) * 100),
        yearPercent: Math.round((yearDays / daysInYear) * 100),
        allTimePercent,
        dateActive: firstLoggedDate
          ? firstLoggedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
          : '—',
        dateInactive: !habit.active && lastLoggedDate
          ? lastLoggedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
          : null,
      }
    })

    return {
      // Counts
      totalEntries: activeEntries.length,
      habitEntries: habitEntries.length,
      lifeEvents: activeEntries.filter(e => e.type === 'life_event' || e.type === 'life').length,
      cautionEntries: activeEntries.filter(e => e.type === 'caution_behavior' || e.type === 'caution').length,
      transitions: activeEntries.filter(e => e.type === 'transition').length,

      // Structure
      activeHabits: habits.filter(h => h.active).length,
      activePractices: practices.filter(p => p.active).length,
      totalActions: actions.length,

      // Targets
      totalTargets: targets.length,
      activeTargets: targets.filter(t => t.status === 'active').length,
      plannedTargets: targets.filter(t => t.status === 'planned').length,
      completedTargets: targets.filter(t => t.status === 'completed').length,
      parkedTargets: targets.filter(t => t.status === 'parked').length,

      // Accomplishments
      highlights: activeEntries.filter(e => e.highlight).length,
      reflections: 0, // TODO: add mockReflections data

      // Usage
      daysWithEntries,
      restDays,
      totalMinutes,
      totalHours: Math.floor(totalMinutes / 60),
      remainingMinutes: totalMinutes % 60,
      firstEntry: firstEntry ? firstEntry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      lastEntry: lastEntry ? lastEntry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',

      // Rituals
      warmUpsUsed,
      coolDownsUsed,
      uniqueHabitsLogged,
      daysWithPreparations: daysWithPreps,
      daysWithClosures: daysWithCloses,

      // Templates (Structure)
      warmUpTemplatesCount: warmUpTemplates?.length || 0,
      coolDownTemplatesCount: coolDownTemplates?.length || 0,

      // Averages
      avgEntriesPerDay,
      avgMinutesPerEntry,
      avgMinutesPerDay,
      avgHabitsPerDay,
      prepRate,
      closureRate,

      // Habit coverage
      habitCoverage,
    }
  }, [entries, habits, practices, actions, targets, preparations, closures, warmUpTemplates, coolDownTemplates])

  const themeLabels = {
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto (6 PM - 6 AM)',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your system</p>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Timezone</div>
              <div className="text-sm text-muted-foreground">
                All times are displayed in this timezone
              </div>
            </div>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  {selectedTimezone ? `${selectedTimezone.label}` : 'Select timezone'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    <span>{tz.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{tz.offset}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Theme</div>
              <div className="text-sm text-muted-foreground">
                Choose light, dark, or auto mode
              </div>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-[180px]">
                <SelectValue>{themeLabels[theme]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto (6 PM - 6 AM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Shelf Target Order</div>
              <div className="text-sm text-muted-foreground">
                How targets are sorted on the Shelf view
              </div>
            </div>
            <Select value={shelfSort} onValueChange={setShelfSort}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  {selectedShelfSort ? selectedShelfSort.label : 'Select order'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SHELF_SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Import Data</div>
              <div className="text-sm text-muted-foreground">
                Import entries from a JSON file
              </div>
            </div>
            <Button variant="outline" size="sm">
              Import
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">
                Download all your data as JSON
              </div>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {/* Usage */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Usage
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Days Logged:</span>{' '}
                  <span className="font-medium">{metrics.daysWithEntries}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rest Days:</span>{' '}
                  <span className="font-medium">{metrics.restDays}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Time:</span>{' '}
                  <span className="font-medium">{metrics.totalHours}h {metrics.remainingMinutes}m</span>
                </div>
                <div>
                  <span className="text-muted-foreground">First Entry:</span>{' '}
                  <span className="font-medium">{metrics.firstEntry}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Entry:</span>{' '}
                  <span className="font-medium">{metrics.lastEntry}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Entries */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Entries
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Total:</span>{' '}
                  <span className="font-medium">{metrics.totalEntries}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Habits:</span>{' '}
                  <span className="font-medium">{metrics.habitEntries}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Life Events:</span>{' '}
                  <span className="font-medium">{metrics.lifeEvents}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Caution:</span>{' '}
                  <span className="font-medium">{metrics.cautionEntries}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Rituals */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Rituals
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Days with Prep:</span>{' '}
                  <span className="font-medium">{metrics.daysWithPreparations}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Days with Closure:</span>{' '}
                  <span className="font-medium">{metrics.daysWithClosures}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Warm-ups Used:</span>{' '}
                  <span className="font-medium">{metrics.warmUpsUsed}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cool-downs Used:</span>{' '}
                  <span className="font-medium">{metrics.coolDownsUsed}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Unique Habits:</span>{' '}
                  <span className="font-medium">{metrics.uniqueHabitsLogged}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Structure */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Structure
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Active Habits:</span>{' '}
                  <span className="font-medium">{metrics.activeHabits}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Active Practices:</span>{' '}
                  <span className="font-medium">{metrics.activePractices}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Actions:</span>{' '}
                  <span className="font-medium">{metrics.totalActions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Transitions:</span>{' '}
                  <span className="font-medium">{metrics.transitions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Warm-up Templates:</span>{' '}
                  <span className="font-medium">{metrics.warmUpTemplatesCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cool-down Templates:</span>{' '}
                  <span className="font-medium">{metrics.coolDownTemplatesCount}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Habits Coverage */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Habits (Coverage)
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="text-sm pb-2 pt-1 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="text-left font-medium pb-1"></th>
                      <th className="text-left font-medium pb-1 pl-3">Active</th>
                      <th className="text-left font-medium pb-1 pl-3">Inactive</th>
                      <th className="text-right font-medium pb-1 w-12">Week</th>
                      <th className="text-right font-medium pb-1 w-12">Month</th>
                      <th className="text-right font-medium pb-1 w-12">Year</th>
                      <th className="text-right font-medium pb-1 w-12">All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.habitCoverage.map(habit => (
                      <tr key={habit.name} className={!habit.active ? 'opacity-50' : ''}>
                        <td className="text-muted-foreground py-0.5">{habit.name}</td>
                        <td className="text-muted-foreground pl-3 text-xs">{habit.dateActive}</td>
                        <td className="text-muted-foreground pl-3 text-xs">{habit.dateInactive || '—'}</td>
                        <td className="text-right font-medium">{habit.weekPercent}%</td>
                        <td className="text-right font-medium">{habit.monthPercent}%</td>
                        <td className="text-right font-medium">{habit.yearPercent}%</td>
                        <td className="text-right font-medium">{habit.allTimePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Targets */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Targets
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Total:</span>{' '}
                  <span className="font-medium">{metrics.totalTargets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Active:</span>{' '}
                  <span className="font-medium">{metrics.activeTargets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Planned:</span>{' '}
                  <span className="font-medium">{metrics.plannedTargets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Completed:</span>{' '}
                  <span className="font-medium">{metrics.completedTargets}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Parked:</span>{' '}
                  <span className="font-medium">{metrics.parkedTargets}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Accomplishments */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Accomplishments
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Highlights:</span>{' '}
                  <span className="font-medium">{metrics.highlights}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reflections:</span>{' '}
                  <span className="font-medium">{metrics.reflections}</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Averages */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Averages
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm pb-2 pt-1">
                <div>
                  <span className="text-muted-foreground">Entries/Day:</span>{' '}
                  <span className="font-medium">{metrics.avgEntriesPerDay}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Habits/Day:</span>{' '}
                  <span className="font-medium">{metrics.avgHabitsPerDay}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Minutes/Day:</span>{' '}
                  <span className="font-medium">{metrics.avgMinutesPerDay}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Minutes/Entry:</span>{' '}
                  <span className="font-medium">{metrics.avgMinutesPerEntry}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prep Rate:</span>{' '}
                  <span className="font-medium">{metrics.prepRate}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Closure Rate:</span>{' '}
                  <span className="font-medium">{metrics.closureRate}%</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Shelf is a personal system for managing attention, balance, and
            long-term memory of effort. It is designed to be used for years.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">
            Version 0.1.0
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
