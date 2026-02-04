/**
 * Generates a context prompt for the Balance Agent Custom GPT
 */

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0]
}

/**
 * Get entries for a specific date
 */
function getEntriesForDate(entries, dateStr) {
  return entries.filter(e => e.occurred_at?.split('T')[0] === dateStr && !e.archived_at)
}

/**
 * Summarize entries by habit
 */
function summarizeByHabit(entries) {
  const summary = {}
  entries.forEach(e => {
    if (e.type === 'habit' && e.habit) {
      if (!summary[e.habit]) {
        summary[e.habit] = { count: 0, minutes: 0 }
      }
      summary[e.habit].count++
      summary[e.habit].minutes += e.duration_minutes || 0
    }
  })
  return summary
}

/**
 * Generate the context prompt for the Balance Agent
 */
export function generateAgentPrompt({ habits, practices, actions = [], targets, entries, todayKey, hasPreparation = false, hasClosure = false }) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = formatDate(yesterday)

  // Get active habits (exclude caution type)
  const activeHabits = habits.filter(h => h.active && h.type !== 'caution')
  const habitNames = activeHabits.map(h => h.name)

  // Get practices grouped by habit, with actions for habits that track them
  const practicesByHabit = {}
  activeHabits.forEach(h => {
    const habitPractices = practices
      .filter(p => p.habit_id === h.id && p.active)
      .map(p => {
        // Include actions if habit tracks them
        if (h.track_actions) {
          const practiceActions = actions
            .filter(a => a.practice_id === p.id && a.active)
            .map(a => a.name)
          if (practiceActions.length > 0) {
            return `${p.name} [${practiceActions.join(', ')}]`
          }
        }
        return p.name
      })
    if (habitPractices.length > 0) {
      practicesByHabit[h.name] = habitPractices
    }
  })

  // Get caution behaviors (practices under the caution-type habit)
  const cautionHabit = habits.find(h => h.type === 'caution')
  const cautionBehaviors = cautionHabit
    ? practices.filter(p => p.habit_id === cautionHabit.id && p.active).map(p => p.name)
    : []

  // Get targets grouped by status
  const targetsByStatus = {
    active: [],
    planned: [],
    parked: [],
  }
  targets.forEach(t => {
    if (targetsByStatus[t.status]) {
      const habit = habits.find(h => h.id === t.habit_id)
      targetsByStatus[t.status].push(`${t.name} (${habit?.name || 'Unknown'})`)
    }
  })

  // Today's entries
  const todayEntries = getEntriesForDate(entries, todayKey)
  const todaySummary = summarizeByHabit(todayEntries)

  // Yesterday's entries
  const yesterdayEntries = getEntriesForDate(entries, yesterdayKey)
  const yesterdaySummary = summarizeByHabit(yesterdayEntries)

  // Week summary (last 7 days)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekEntries = entries.filter(e => {
    const entryDate = e.occurred_at?.split('T')[0]
    return entryDate >= formatDate(weekAgo) && entryDate <= todayKey && !e.archived_at
  })
  const weekSummary = summarizeByHabit(weekEntries)

  // Find neglected habits (no entries in past 7 days)
  const neglectedHabits = habitNames.filter(name => !weekSummary[name])

  // Count cautions this week
  const weekCautions = weekEntries.filter(e => e.type === 'caution').length

  // Day status
  const dayStatus = []
  if (hasPreparation) dayStatus.push('Day started')
  if (hasClosure) dayStatus.push('Day closed')
  const dayStatusStr = dayStatus.length > 0 ? dayStatus.join(', ') : 'Not started yet'

  // Build the prompt
  let prompt = `Here's my Shelf context for ${todayKey}:

**My Habits:** ${habitNames.join(', ')}

**Practices by Habit:**
${Object.entries(practicesByHabit).map(([habit, pracs]) => `- ${habit}: ${pracs.join(', ')}`).join('\n')}
${cautionBehaviors.length > 0 ? `\n**Caution Behaviors:** ${cautionBehaviors.join(', ')}` : ''}

**Targets:**
${targetsByStatus.active.length > 0 ? `- Active: ${targetsByStatus.active.join(', ')}` : '- Active: None'}
${targetsByStatus.planned.length > 0 ? `- Planned: ${targetsByStatus.planned.join(', ')}` : ''}
${targetsByStatus.parked.length > 0 ? `- Parked: ${targetsByStatus.parked.join(', ')}` : ''}

**Day Status:** ${dayStatusStr}

**Today so far:** ${todayEntries.length === 0 ? 'No entries yet' : Object.entries(todaySummary).map(([h, s]) => `${h} (${s.minutes}min)`).join(', ')}

**Yesterday:** ${yesterdayEntries.length === 0 ? 'No entries' : Object.entries(yesterdaySummary).map(([h, s]) => `${h} (${s.minutes}min)`).join(', ')}

**This week:** ${Object.entries(weekSummary).map(([h, s]) => `${h}: ${s.count} entries, ${s.minutes}min`).join('; ') || 'No habit entries'}
${neglectedHabits.length > 0 ? `\n**Neglected (0 entries this week):** ${neglectedHabits.join(', ')}` : ''}
${weekCautions > 0 ? `\n**Cautions this week:** ${weekCautions}` : ''}

---

I'm going to chat with you about my day. Based on what I share, output JSON with any of these that apply:

\`\`\`json
{
  "preparation": {
    "note": "My intention or focus for the day",
    "rest_day": false
  },
  "entries": [
    {
      "type": "habit",
      "habit": "Habit Name",
      "practice": "Practice Name or null",
      "actions": ["Action1", "Action2"],
      "target": "Target Name or null",
      "duration_minutes": 30,
      "note": "Optional note"
    },
    {
      "type": "caution",
      "practice": "Caution Behavior Name or null",
      "duration_minutes": null,
      "note": "Optional context"
    }
  ],
  "closure": {
    "note": "My reflection on how the day went"
  },
  "reflection": "1-2 sentence summary (optional)"
}
\`\`\`

**Guidelines:**
- Include \`preparation\` if I'm starting my day${hasPreparation ? ' (already exists today)' : ''}
- Include \`entries\` for any activities I mention (type: "habit", "life", or "caution")
- Include \`closure\` if I'm closing out the day${hasClosure ? ' (already exists today)' : ''}
- Match habit, practice, action, target, and caution behavior names exactly from my lists above
- For habits with actions (shown in brackets), include the \`actions\` array
- For caution entries, use \`practice\` for the behavior name
- Omit sections that don't apply

Ready when you are.`

  return prompt
}

/**
 * Generate a shorter re-prompt for continuing conversation
 */
export function generateFollowUpPrompt() {
  return `Please format your response as JSON:
\`\`\`json
{
  "preparation": { "note": "...", "rest_day": false },
  "entries": [...],
  "closure": { "note": "..." },
  "reflection": "..."
}
\`\`\`
Include only the sections that apply.`
}
