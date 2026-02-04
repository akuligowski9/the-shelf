import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MessageSquare, Copy, ExternalLink, ChevronDown, ChevronRight, Check, X, Loader2, Sun, Moon, Coffee } from 'lucide-react'
import { generateAgentPrompt } from '@/lib/agentPrompt'
import {
  parseAgentResponse,
  entriesToApiFormat,
  preparationToApiFormat,
  closureToApiFormat,
  hasContent
} from '@/lib/agentParser'
import { useHabits } from '@/context/HabitsContext'
import { useEntries } from '@/context/EntriesContext'
import { savePreparation, saveClosure } from '@/lib/api'
import { getHabitBadgeClassesByColor, entryTypeColors } from '@/lib/colors'

export default function AgentLogSection({ dateKey, onEntriesAdded, existingPreparation, existingClosure }) {
  const { habits, practices, targets } = useHabits()
  const { entries, createEntry } = useEntries()

  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleCopyContext = async () => {
    const prompt = generateAgentPrompt({
      habits,
      practices,
      targets,
      entries,
      todayKey: dateKey,
      hasPreparation: !!existingPreparation,
      hasClosure: !!existingClosure,
    })

    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleParse = () => {
    setParseError(null)
    const result = parseAgentResponse(responseText, habits, practices)

    if (result.error) {
      setParseError(result.error)
      setParsedData(null)
    } else if (!hasContent(result)) {
      setParseError('No entries, preparation, or closure found in response')
      setParsedData(null)
    } else {
      setParsedData(result)
    }
  }

  const handleAddAll = async () => {
    if (!parsedData) return

    setIsAdding(true)
    try {
      let entriesAdded = 0
      let prepSaved = false
      let closureSaved = false

      // Save preparation if present and not already exists
      if (parsedData.preparation && !existingPreparation) {
        const prepData = preparationToApiFormat(parsedData.preparation, dateKey)
        await savePreparation(prepData)
        prepSaved = true
      }

      // Create entries if present
      if (parsedData.entries && parsedData.entries.length > 0) {
        const apiEntries = entriesToApiFormat(parsedData.entries, dateKey)
        for (const entry of apiEntries) {
          await createEntry(entry)
        }
        entriesAdded = parsedData.entries.length
      }

      // Save closure if present and not already exists
      if (parsedData.closure && !existingClosure) {
        const closureData = closureToApiFormat(parsedData.closure, dateKey)
        await saveClosure(closureData)
        closureSaved = true
      }

      // Reset state
      setResponseText('')
      setParsedData(null)
      setIsOpen(false)

      // Notify parent
      if (onEntriesAdded) {
        onEntriesAdded({
          entriesAdded,
          prepSaved,
          closureSaved,
          reflection: parsedData.reflection,
        })
      }
    } catch (err) {
      console.error('Failed to add data:', err)
      setParseError('Failed to save. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveEntry = (index) => {
    if (!parsedData) return
    const newEntries = parsedData.entries.filter((_, i) => i !== index)
    setParsedData({
      ...parsedData,
      entries: newEntries,
    })
  }

  const handleRemovePreparation = () => {
    if (!parsedData) return
    setParsedData({
      ...parsedData,
      preparation: null,
    })
  }

  const handleRemoveClosure = () => {
    if (!parsedData) return
    setParsedData({
      ...parsedData,
      closure: null,
    })
  }

  const getEntryBadgeStyle = (entry) => {
    if (entry.type === 'habit' && entry.habit) {
      const habit = habits.find(h => h.name === entry.habit)
      const colorKey = habit?.color || 'sage'
      return {
        variant: 'outline',
        className: getHabitBadgeClassesByColor(colorKey),
      }
    }

    const colors = entryTypeColors[entry.type]
    if (colors) {
      return {
        variant: 'outline',
        className: `${colors.bg} ${colors.text} ${colors.border}`,
      }
    }

    return { variant: 'secondary', className: '' }
  }

  // Count what we're about to add
  const getAddButtonText = () => {
    if (!parsedData) return 'Add'

    const parts = []
    if (parsedData.preparation && !existingPreparation) parts.push('Preparation')
    if (parsedData.entries?.length > 0) {
      parts.push(`${parsedData.entries.length} ${parsedData.entries.length === 1 ? 'Entry' : 'Entries'}`)
    }
    if (parsedData.closure && !existingClosure) parts.push('Closure')

    if (parts.length === 0) return 'Nothing to add'
    return `Add ${parts.join(' + ')}`
  }

  const canAdd = parsedData && (
    (parsedData.entries?.length > 0) ||
    (parsedData.preparation && !existingPreparation) ||
    (parsedData.closure && !existingClosure)
  )

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent
            className="py-3 cursor-pointer hover:bg-accent/50 transition-colors"
            aria-expanded={isOpen}
            aria-controls="balance-agent-content"
          >
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Balance Agent</span>
              <span className="text-xs text-muted-foreground">— start, log, or close your day</span>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent id="balance-agent-content">
          <CardContent className="pt-0 pb-4 space-y-4">
            {/* Step 1: Copy Context */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                1. Copy your context and paste it into your Balance Agent GPT
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContext}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Context
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-2"
                >
                  <a
                    href="https://chatgpt.com/g/g-697ed5dccff081918e925a0f0aa24af0-balance-agent"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Balance Agent
                  </a>
                </Button>
              </div>
            </div>

            {/* Step 2: Paste Response */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                2. Chat with your agent, then paste the JSON response
              </p>
              <Textarea
                id="agent-response-input"
                aria-label="Agent JSON response"
                placeholder="Paste the agent's response here..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={4}
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleParse}
                disabled={!responseText.trim()}
              >
                Parse Response
              </Button>
              {parseError && (
                <p role="alert" className="text-sm text-destructive">{parseError}</p>
              )}
            </div>

            {/* Step 3: Review Content */}
            {parsedData && hasContent(parsedData) && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  3. Review and confirm
                </p>

                {/* Preparation */}
                {parsedData.preparation && (
                  <div className="flex items-start justify-between gap-2 p-3 rounded-md border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Day Preparation</span>
                          {parsedData.preparation.rest_day && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Coffee className="h-3 w-3" />
                              Rest Day
                            </Badge>
                          )}
                          {existingPreparation && (
                            <Badge variant="secondary" className="text-xs">Already exists</Badge>
                          )}
                        </div>
                        {parsedData.preparation.note && (
                          <p className="text-sm text-muted-foreground">{parsedData.preparation.note}</p>
                        )}
                      </div>
                    </div>
                    {!existingPreparation && (
                      <button
                        onClick={handleRemovePreparation}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label="Remove preparation"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Entries */}
                {parsedData.entries && parsedData.entries.length > 0 && (
                  <div className="space-y-2">
                    {parsedData.entries.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 rounded-md border bg-secondary/50"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Badge
                            variant={getEntryBadgeStyle(entry).variant}
                            className={getEntryBadgeStyle(entry).className}
                          >
                            {entry.type === 'habit' ? entry.habit : entry.type}
                          </Badge>
                          {entry.practice && (
                            <span className="text-sm text-muted-foreground truncate">
                              {entry.practice}
                            </span>
                          )}
                          {entry.duration_minutes && (
                            <span className="text-sm text-muted-foreground">
                              {entry.duration_minutes}min
                            </span>
                          )}
                          {entry.note && (
                            <span className="text-sm text-muted-foreground truncate">
                              — {entry.note}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveEntry(index)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                          aria-label="Remove entry"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Closure */}
                {parsedData.closure && (
                  <div className="flex items-start justify-between gap-2 p-3 rounded-md border bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Day Closure</span>
                          {existingClosure && (
                            <Badge variant="secondary" className="text-xs">Already exists</Badge>
                          )}
                        </div>
                        {parsedData.closure.note && (
                          <p className="text-sm text-muted-foreground">{parsedData.closure.note}</p>
                        )}
                      </div>
                    </div>
                    {!existingClosure && (
                      <button
                        onClick={handleRemoveClosure}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        aria-label="Remove closure"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Reflection (display only, not editable) */}
                {parsedData.reflection && (
                  <div className="p-2 rounded-md border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Agent's reflection:</p>
                    <p className="text-sm">{parsedData.reflection}</p>
                  </div>
                )}

                <Button
                  onClick={handleAddAll}
                  disabled={isAdding || !canAdd}
                  className="w-full"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {getAddButtonText()}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
