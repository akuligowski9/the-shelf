/**
 * Parses the Balance Agent's JSON response into entry objects,
 * plus optional preparation and closure data
 */

/**
 * Extract JSON from a ChatGPT response that may have markdown code blocks
 */
function extractJson(text) {
  // Try to find JSON in code blocks first
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }

  return text.trim()
}

/**
 * Validate and normalize an entry from the agent
 */
function normalizeEntry(entry, habits, practices) {
  const normalized = {
    type: entry.type || 'habit',
    duration_minutes: entry.duration_minutes || null,
    note: entry.note || null,
    habit: null,
    practice: null,
    habit_id: null,
    practice_id: null,
  }

  // Validate type
  if (!['habit', 'life', 'caution'].includes(normalized.type)) {
    normalized.type = 'habit'
  }

  // For habit entries, match habit and practice names
  if (normalized.type === 'habit' && entry.habit) {
    // Find matching habit (case-insensitive)
    const habit = habits.find(h =>
      h.name.toLowerCase() === entry.habit.toLowerCase() && h.active
    )
    if (habit) {
      normalized.habit = habit.name
      normalized.habit_id = habit.id

      // Find matching practice if provided
      if (entry.practice) {
        const practice = practices.find(p =>
          p.habit_id === habit.id &&
          p.name.toLowerCase() === entry.practice.toLowerCase() &&
          p.active
        )
        if (practice) {
          normalized.practice = practice.name
          normalized.practice_id = practice.id
        }
      }
    } else {
      // Couldn't match habit, convert to life entry
      normalized.type = 'life'
      normalized.note = entry.note || `${entry.habit}: ${entry.practice || 'unspecified'}`
    }
  }

  // For caution entries, we might want to match to a caution behavior
  // For now, just keep the note
  if (normalized.type === 'caution') {
    normalized.note = entry.note || entry.habit || 'Caution logged'
  }

  return normalized
}

/**
 * Normalize preparation data from the agent
 */
function normalizePreparation(prep) {
  if (!prep) return null

  return {
    note: prep.note || null,
    rest_day: prep.rest_day ?? false,
  }
}

/**
 * Normalize closure data from the agent
 */
function normalizeClosure(closure) {
  if (!closure) return null

  return {
    note: closure.note || null,
  }
}

/**
 * Parse the agent's response and return structured data
 * @param {string} responseText - The raw text from ChatGPT
 * @param {Array} habits - List of habits from context
 * @param {Array} practices - List of practices from context
 * @returns {{
 *   entries: Array,
 *   preparation: object|null,
 *   closure: object|null,
 *   reflection: string|null,
 *   error: string|null
 * }}
 */
export function parseAgentResponse(responseText, habits, practices) {
  try {
    const jsonStr = extractJson(responseText)
    const data = JSON.parse(jsonStr)

    // Normalize entries (may be empty array or missing)
    const entries = (data.entries || [])
      .map(e => normalizeEntry(e, habits, practices))
      .filter(e => {
        // Filter out invalid entries
        if (e.type === 'habit' && !e.habit_id) return false
        return true
      })

    // Normalize preparation and closure
    const preparation = normalizePreparation(data.preparation)
    const closure = normalizeClosure(data.closure)

    return {
      entries,
      preparation,
      closure,
      reflection: data.reflection || null,
      error: null,
    }
  } catch (err) {
    return {
      entries: [],
      preparation: null,
      closure: null,
      reflection: null,
      error: `Failed to parse response: ${err.message}`,
    }
  }
}

/**
 * Convert parsed entries to the format expected by createEntry API
 */
export function entriesToApiFormat(entries, dateKey) {
  const now = new Date()
  const timeStr = now.toTimeString().slice(0, 8)
  const timestamp = `${dateKey}T${timeStr}`

  return entries.map(entry => ({
    type: entry.type,
    occurred_at: timestamp,
    habit_id: entry.habit_id,
    practice_id: entry.practice_id,
    duration_minutes: entry.duration_minutes,
    note: entry.note,
    is_highlight: false,
  }))
}

/**
 * Convert parsed preparation to the format expected by savePreparation API
 */
export function preparationToApiFormat(preparation, dateKey) {
  if (!preparation) return null

  return {
    period_type: 'day',
    period_start: dateKey,
    note: preparation.note,
    rest_day: preparation.rest_day,
  }
}

/**
 * Convert parsed closure to the format expected by saveClosure API
 */
export function closureToApiFormat(closure, dateKey) {
  if (!closure) return null

  const now = new Date()
  const timeStr = now.toTimeString().slice(0, 8)
  const timestamp = `${dateKey}T${timeStr}`

  return {
    scope: 'day',
    occurred_at: timestamp,
    note: closure.note,
  }
}

/**
 * Check if the parsed response has any meaningful content
 */
export function hasContent(parsedData) {
  if (!parsedData) return false

  return (
    (parsedData.entries && parsedData.entries.length > 0) ||
    parsedData.preparation !== null ||
    parsedData.closure !== null
  )
}
