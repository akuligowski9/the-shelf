#!/usr/bin/env node
/**
 * Export Daily Entries - creates data/daily/YYYY-MM-DD.json from database
 *
 * Usage:
 *   node export-daily.js                  # Export today's entries
 *   node export-daily.js 2026-01-23       # Export specific date
 *   DATABASE_URL=<url> node export-daily.js
 *
 * Output format matches existing daily logs (hybrid IDs + names for readability)
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const DATABASE_URL = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL
const DAILY_DIR = path.join(__dirname, '..', '..', 'data', 'daily')

if (!DATABASE_URL) {
  console.error('DATABASE_URL or PROD_DATABASE_URL environment variable required')
  process.exit(1)
}

async function exportDaily(dateStr) {
  // Default to today in Eastern timezone
  if (!dateStr) {
    const now = new Date()
    // Convert to Eastern time
    const eastern = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    dateStr = eastern.toISOString().split('T')[0]
  }

  console.log(`Exporting entries for ${dateStr}...`)

  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    // Fetch entries for the date with habit and practice names
    const result = await pool.query(`
      SELECT
        e.id,
        e.type,
        e.occurred_at,
        h.name as habit,
        e.habit_id,
        p.name as practice,
        e.practice_id,
        e.target_id,
        e.duration_minutes,
        e.note,
        e.actions,
        e.is_highlight,
        e.source,
        e.warm_up_note,
        e.cool_down_note
      FROM entries e
      LEFT JOIN habits h ON e.habit_id = h.id
      LEFT JOIN practices p ON e.practice_id = p.id
      WHERE DATE(e.occurred_at AT TIME ZONE 'America/New_York') = $1
        AND e.archived_at IS NULL
      ORDER BY e.occurred_at
    `, [dateStr])

    if (result.rows.length === 0) {
      console.log(`No entries found for ${dateStr}, skipping file creation`)
      return null
    }

    // Format entries to match existing daily log structure
    const entries = result.rows.map(row => ({
      type: row.type,
      occurred_at: row.occurred_at.toISOString().replace('.000Z', '').replace('Z', ''),
      habit: row.habit,
      habit_id: row.habit_id,
      practice: row.practice,
      practice_id: row.practice_id,
      target_id: row.target_id,
      duration_minutes: row.duration_minutes,
      note: row.note,
      actions: row.actions,
      is_highlight: row.is_highlight,
      source: row.source,
      warm_up_note: row.warm_up_note,
      cool_down_note: row.cool_down_note
    }))

    const output = {
      date: dateStr,
      entries: entries
    }

    // Ensure directory exists
    if (!fs.existsSync(DAILY_DIR)) {
      fs.mkdirSync(DAILY_DIR, { recursive: true })
    }

    // Write file
    const filePath = path.join(DAILY_DIR, `${dateStr}.json`)
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2) + '\n')

    console.log(`Exported ${entries.length} entries to ${filePath}`)
    return filePath

  } finally {
    await pool.end()
  }
}

// Run if called directly
const dateArg = process.argv[2]
exportDaily(dateArg).catch(err => {
  console.error('Export failed:', err.message)
  process.exit(1)
})
