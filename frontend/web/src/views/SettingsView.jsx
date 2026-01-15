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
import { ChevronDown, Info, Download, Upload, Loader2 } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTheme } from '@/context/ThemeContext'
import { useEntries } from '@/context/EntriesContext'
import { useHabits } from '@/context/HabitsContext'
import { getSettings, setSetting, exportData, importData, getPendingImports, importFile, previewFile } from '@/lib/api'

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
  const { habits, habitTransitions } = useHabits()
  const { entries } = useEntries()
  const [timezone, setTimezoneState] = useState(getDefaultTimezone)
  const [shelfSort, setShelfSortState] = useState('priority')
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [showAllTransitions, setShowAllTransitions] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [importingFile, setImportingFile] = useState(null)
  const [fileImportResults, setFileImportResults] = useState(null)
  const [previewData, setPreviewData] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(null)

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

  // Load pending imports
  const loadPendingFiles = () => {
    setPendingLoading(true)
    getPendingImports()
      .then(files => setPendingFiles(files))
      .catch(err => console.error('Failed to load pending imports:', err))
      .finally(() => setPendingLoading(false))
  }

  useEffect(() => {
    loadPendingFiles()
  }, [])

  const setTimezone = (tz) => {
    setTimezoneState(tz)
    setSetting('timezone', tz).catch(err => console.error('Failed to save timezone:', err))
  }

  const setShelfSort = (sort) => {
    setShelfSortState(sort)
    setSetting('shelf_target_sort', sort).catch(err => console.error('Failed to save shelf sort:', err))
  }

  // Handle export
  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `the-shelf-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  // Handle import
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return

      setImporting(true)
      setImportResults(null)
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        const results = await importData(data)
        setImportResults(results)
      } catch (err) {
        console.error('Import failed:', err)
        alert('Import failed: ' + err.message)
      } finally {
        setImporting(false)
      }
    }
    input.click()
  }

  // Handle previewing a file before import
  const handlePreviewFile = async (filename) => {
    setPreviewLoading(filename)
    setPreviewData(null)
    setFileImportResults(null)
    try {
      const preview = await previewFile(filename)
      setPreviewData(preview)
    } catch (err) {
      console.error('Preview failed:', err)
      setFileImportResults({ filename, error: err.message })
    } finally {
      setPreviewLoading(null)
    }
  }

  // Handle confirming import after preview
  const handleConfirmImport = async () => {
    if (!previewData) return
    const filename = previewData.filename
    setImportingFile(filename)
    try {
      const result = await importFile(filename)
      setFileImportResults({ filename, ...result })
      setPreviewData(null)
      // Remove from pending list
      setPendingFiles(prev => prev.filter(f => f !== filename))
    } catch (err) {
      console.error('Import failed:', err)
      setFileImportResults({ filename, error: err.message })
    } finally {
      setImportingFile(null)
    }
  }

  // Cancel preview
  const handleCancelPreview = () => {
    setPreviewData(null)
  }

  const selectedTimezone = TIMEZONES.find(tz => tz.value === timezone)
  const selectedShelfSort = SHELF_SORT_OPTIONS.find(opt => opt.value === shelfSort)

  // Compute data health metrics
  const metrics = useMemo(() => {
    const activeEntries = entries.filter(e => !e.archived_at)
    const habitEntries = activeEntries.filter(e => e.type === 'habit')

    // Date range
    const dates = activeEntries.map(e => new Date(e.occurred_at)).sort((a, b) => a - b)
    const firstEntry = dates[0]
    const lastEntry = dates[dates.length - 1]

    // Check if last entry is today
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const lastEntryStr = lastEntry ? lastEntry.toISOString().split('T')[0] : null
    const isLastEntryToday = lastEntryStr === todayStr

    // Calculate days since tracking started
    const daysSinceStart = firstEntry
      ? Math.ceil((today - firstEntry) / (1000 * 60 * 60 * 24))
      : 0

    // Find gaps (weeks with no entries)
    const uniqueDays = new Set(activeEntries.map(e => e.occurred_at.split('T')[0]))
    const gaps = []
    if (firstEntry && daysSinceStart > 7) {
      // Check each week since start
      const weekStart = new Date(firstEntry)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
      while (weekStart < today) {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)

        // Check if any entries in this week
        let hasEntry = false
        for (const day of uniqueDays) {
          const d = new Date(day)
          if (d >= weekStart && d <= weekEnd) {
            hasEntry = true
            break
          }
        }

        if (!hasEntry && weekEnd < today) {
          gaps.push(weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
        }

        weekStart.setDate(weekStart.getDate() + 7)
      }
    }

    // Find orphaned entries (referencing non-existent habits)
    const habitNames = new Set(habits.map(h => h.name))
    const orphanedEntries = habitEntries.filter(e => !habitNames.has(e.habit))

    // Per-habit coverage (percentage of days logged this week/month/year/all)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const daysInMonth = Math.ceil((today - monthStart) / (1000 * 60 * 60 * 24)) + 1
    const yearStart = new Date(today.getFullYear(), 0, 1)
    const daysInYear = Math.ceil((today - yearStart) / (1000 * 60 * 60 * 24)) + 1

    const habitCoverage = habits.map(habit => {
      const habitEntriesForHabit = habitEntries.filter(e => e.habit === habit.name)
      const habitDays = new Set(habitEntriesForHabit.map(e => e.occurred_at.split('T')[0]))

      const weekDays = [...habitDays].filter(d => new Date(d) >= weekAgo).length
      const monthDays = [...habitDays].filter(d => new Date(d) >= monthStart).length
      const yearDays = [...habitDays].filter(d => new Date(d) >= yearStart).length

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
      // Audit
      totalEntries: activeEntries.length,
      firstEntry: firstEntry
        ? firstEntry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—',
      lastEntry: isLastEntryToday
        ? 'Today'
        : (lastEntry ? lastEntry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'),
      daysSinceStart,
      gaps,
      orphanedCount: orphanedEntries.length,

      // Habit coverage
      habitCoverage,
    }
  }, [entries, habits])

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

      {/* Pending Imports */}
      {(pendingFiles.length > 0 || fileImportResults || previewData) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Pending Imports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Preview Mode */}
            {previewData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Preview: {previewData.filename}</div>
                  <div className="text-sm text-muted-foreground">{previewData.date}</div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(previewData.summary).map(([key, counts]) => {
                    if (counts.insert === 0 && counts.skip === 0) return null
                    return (
                      <div key={key} className="flex justify-between bg-muted/30 rounded px-2 py-1">
                        <span className="capitalize">{key}</span>
                        <span>
                          <span className="text-green-600 dark:text-green-400">+{counts.insert}</span>
                          {counts.skip > 0 && (
                            <span className="text-amber-600 dark:text-amber-400 ml-1">−{counts.skip}</span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Entries to insert */}
                {previewData.entries.will_insert.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Will Import:</div>
                    <div className="space-y-1">
                      {previewData.entries.will_insert.map((entry, i) => (
                        <div key={i} className="text-xs bg-green-500/10 rounded px-2 py-1 flex justify-between">
                          <span>
                            <span className="font-medium">{entry.habit || entry.type}</span>
                            {entry.duration_minutes && <span className="text-muted-foreground ml-1">({entry.duration_minutes}m)</span>}
                          </span>
                          {entry.note && <span className="text-muted-foreground truncate ml-2 max-w-[200px]">{entry.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entries to skip */}
                {previewData.entries.will_skip.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-1">Will Skip:</div>
                    <div className="space-y-1">
                      {previewData.entries.will_skip.map((entry, i) => (
                        <div key={i} className="text-xs bg-amber-500/10 rounded px-2 py-1 flex justify-between">
                          <span>
                            <span className="font-medium">{entry.habit || entry.type}</span>
                            {entry.duration_minutes && <span className="text-muted-foreground ml-1">({entry.duration_minutes}m)</span>}
                          </span>
                          <span className="text-amber-600 dark:text-amber-400">{entry.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleConfirmImport}
                    disabled={importingFile !== null || previewData.entries.will_insert.length === 0}
                    className="flex-1"
                  >
                    {importingFile ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      `Import ${previewData.entries.will_insert.length} entries`
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelPreview}
                    disabled={importingFile !== null}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : pendingFiles.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  {pendingFiles.length} file{pendingFiles.length !== 1 ? 's' : ''} in data/imports/
                </div>
                <div className="space-y-2">
                  {pendingFiles.map(file => (
                    <div key={file} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                      <span className="text-sm font-mono">{file}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewFile(file)}
                        disabled={previewLoading !== null || importingFile !== null}
                      >
                        {previewLoading === file ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Preview'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No pending imports</div>
            )}

            {/* File Import Results */}
            {fileImportResults && !previewData && (
              <div className={`rounded-md p-3 text-sm mt-3 ${fileImportResults.error ? 'bg-red-500/10' : 'bg-muted/50'}`}>
                <div className="font-medium mb-1">
                  {fileImportResults.error ? 'Import Failed' : `Imported ${fileImportResults.filename}`}
                </div>
                {fileImportResults.error ? (
                  <div className="text-red-600 dark:text-red-400 text-xs">{fileImportResults.error}</div>
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-1">Moved to {fileImportResults.moved_to}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {Object.entries(fileImportResults.results || {}).map(([key, value]) => {
                        if (value.inserted === 0 && value.skipped === 0) return null
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key}</span>
                            <span>
                              <span className="text-green-600 dark:text-green-400">+{value.inserted}</span>
                              {value.skipped > 0 && (
                                <span className="text-muted-foreground ml-1">({value.skipped} skipped)</span>
                              )}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
                <button
                  onClick={() => setFileImportResults(null)}
                  className="text-xs text-muted-foreground hover:text-foreground mt-2"
                >
                  Dismiss
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            <Button variant="outline" size="sm" onClick={handleImport} disabled={importing}>
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="bg-muted/50 rounded-md p-3 text-sm">
              <div className="font-medium mb-2">Import Complete</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {Object.entries(importResults).map(([key, value]) => {
                  if (value.inserted === 0 && value.skipped === 0) return null
                  return (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span>
                        <span className="text-green-600 dark:text-green-400">+{value.inserted}</span>
                        {value.skipped > 0 && (
                          <span className="text-muted-foreground ml-1">({value.skipped} skipped)</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => setImportResults(null)}
                className="text-xs text-muted-foreground hover:text-foreground mt-2"
              >
                Dismiss
              </button>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Export Data</div>
              <div className="text-sm text-muted-foreground">
                Download all your data as JSON
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Health */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Data Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Audit Summary */}
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracking since</span>
              <span className="font-medium">{metrics.firstEntry}{metrics.daysSinceStart > 0 && ` (${metrics.daysSinceStart} days)`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last entry</span>
              <span className="font-medium">{metrics.lastEntry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total entries</span>
              <span className="font-medium">{metrics.totalEntries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                Gaps
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      <p>Weeks with zero entries since you started tracking. Helps identify periods where logging dropped off.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium">
                {metrics.gaps.length === 0 ? (
                  <span className="text-green-600 dark:text-green-400">None</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">{metrics.gaps.length} week{metrics.gaps.length > 1 ? 's' : ''}</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                Orphaned
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      <p>Entries referencing habits that no longer exist. Usually from deleted habits or import mismatches.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
              <span className="font-medium">
                {metrics.orphanedCount === 0 ? (
                  <span className="text-green-600 dark:text-green-400">None</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">{metrics.orphanedCount} entr{metrics.orphanedCount > 1 ? 'ies' : 'y'}</span>
                )}
              </span>
            </div>
          </div>

          <Separator />

          {/* Habits Coverage */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide hover:text-foreground [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3 w-3 transition-transform duration-200" />
              Habits (Coverage)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Info className="h-3 w-3 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs text-xs">
                    <p className="font-medium mb-1">Coverage = days logged / total days</p>
                    <ul className="space-y-0.5 text-muted-foreground">
                      <li><strong>Week:</strong> Last 7 days</li>
                      <li><strong>Month:</strong> Days elapsed this month</li>
                      <li><strong>Year:</strong> Days elapsed this year</li>
                      <li><strong>All:</strong> Days since first entry</li>
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

          {habitTransitions.length > 0 && (
            <>
              <Separator />

              {/* Transitions */}
              <div className="pt-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Transitions</div>
                <div className="space-y-3">
                  {habitTransitions
                    .slice(0, showAllTransitions ? undefined : 5)
                    .map(t => {
                      const changes = Array.isArray(t.changes) ? t.changes : []
                      return (
                        <div key={t.id} className="text-xs space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {new Date(t.ended_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            {changes.length > 0 && (
                              <span className="font-medium">
                                {changes.length} habit{changes.length !== 1 ? 's' : ''} changed
                              </span>
                            )}
                          </div>
                          {changes.length > 0 && (
                            <div className="text-muted-foreground/70 pl-0.5">
                              {changes.map((c, i) => (
                                <span key={i}>
                                  {c.habitName || `Habit ${c.habit_id}`}: {c.from ? 'active' : 'inactive'} → {c.to ? 'active' : 'inactive'}
                                  {i < changes.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          )}
                          {t.note && (
                            <div className="text-muted-foreground/60 italic pl-0.5">"{t.note}"</div>
                          )}
                        </div>
                      )
                    })}
                  {habitTransitions.length > 5 && (
                    <button
                      onClick={() => setShowAllTransitions(!showAllTransitions)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showAllTransitions
                        ? 'Show less'
                        : `+${habitTransitions.length - 5} more → View all`}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
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
