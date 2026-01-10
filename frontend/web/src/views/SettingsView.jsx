import { useMemo } from 'react'
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
import {
  mockHabits,
  mockPractices,
  mockBehaviors,
  mockTargets,
  mockEntries,
  mockPreparations,
  mockClosures,
  mockWarmUpTemplates,
  mockCoolDownTemplates,
} from '@/data/mockData'

export default function SettingsView() {
  const { theme, setTheme } = useTheme()

  // Compute data health metrics
  const metrics = useMemo(() => {
    const entries = mockEntries.filter(e => !e.archived_at)
    const habitEntries = entries.filter(e => e.type === 'habit')

    // Get unique days with entries
    const uniqueDays = new Set(entries.map(e => e.occurred_at.split('T')[0]))
    const daysWithEntries = uniqueDays.size

    // Date range
    const dates = entries.map(e => new Date(e.occurred_at)).sort((a, b) => a - b)
    const firstEntry = dates[0]
    const lastEntry = dates[dates.length - 1]

    // Time metrics
    const totalMinutes = entries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0)

    // Ritual adoption
    const warmUpsUsed = entries.filter(e => e.warm_up_at).length
    const coolDownsUsed = entries.filter(e => e.cool_down_note).length

    // Unique habits logged
    const uniqueHabitsLogged = new Set(habitEntries.map(e => e.habit)).size

    // Averages
    const avgEntriesPerDay = daysWithEntries > 0 ? (entries.length / daysWithEntries).toFixed(1) : 0
    const avgMinutesPerEntry = habitEntries.length > 0
      ? Math.round(habitEntries.reduce((acc, e) => acc + (e.duration_minutes || 0), 0) / habitEntries.length)
      : 0
    const avgMinutesPerDay = daysWithEntries > 0 ? Math.round(totalMinutes / daysWithEntries) : 0

    // Rest days from preparations
    const restDays = Object.values(mockPreparations).filter(p => p.rest_day).length

    // Prep/Closure rates and habits per day
    const daysWithPreps = Object.keys(mockPreparations).length
    const daysWithCloses = Object.keys(mockClosures).length
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
    const habitCoverage = mockHabits.map(habit => {
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
      totalEntries: entries.length,
      habitEntries: habitEntries.length,
      lifeEvents: entries.filter(e => e.type === 'life_event' || e.type === 'life').length,
      cautionEntries: entries.filter(e => e.type === 'caution_behavior' || e.type === 'caution').length,
      transitions: entries.filter(e => e.type === 'transition').length,

      // Structure
      activeHabits: mockHabits.filter(h => h.active).length,
      activePractices: mockPractices.filter(p => p.active).length,
      totalBehaviors: mockBehaviors.length,

      // Targets
      totalTargets: mockTargets.length,
      activeTargets: mockTargets.filter(t => t.status === 'active').length,
      plannedTargets: mockTargets.filter(t => t.status === 'planned').length,
      completedTargets: mockTargets.filter(t => t.status === 'completed').length,
      parkedTargets: mockTargets.filter(t => t.status === 'parked').length,

      // Accomplishments
      highlights: entries.filter(e => e.highlight).length,
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
      daysWithPreparations: Object.keys(mockPreparations).length,
      daysWithClosures: Object.keys(mockClosures).length,

      // Templates (Structure)
      warmUpTemplates: mockWarmUpTemplates.length,
      coolDownTemplates: mockCoolDownTemplates.length,

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
  }, [])

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
                All times are stored in this timezone
              </div>
            </div>
            <Button variant="outline" size="sm">
              EST (UTC-5)
            </Button>
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
                  <span className="text-muted-foreground">Behaviors:</span>{' '}
                  <span className="font-medium">{metrics.totalBehaviors}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Transitions:</span>{' '}
                  <span className="font-medium">{metrics.transitions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Warm-up Templates:</span>{' '}
                  <span className="font-medium">{metrics.warmUpTemplates}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cool-down Templates:</span>{' '}
                  <span className="font-medium">{metrics.coolDownTemplates}</span>
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
