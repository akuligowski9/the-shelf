#!/usr/bin/env node
/**
 * Backfill missing daily JSON files.
 *
 * Can pull data from either:
 *   1. Database (default) - requires DATABASE_URL
 *   2. Backup file - for offline use or when database isn't accessible
 *
 * Usage:
 *   node backfill-daily.js                           # From database
 *   node backfill-daily.js --from-backup             # From latest backup
 *   node backfill-daily.js --from-backup backup.json # From specific backup
 *   DATABASE_URL=<url> node backfill-daily.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const BACKUPS_DIR = path.join(__dirname, '../../data/backups')
const DAILY_DIR = path.join(__dirname, '../../data/daily')

// Parse command line args
const args = process.argv.slice(2)
const fromBackup = args.includes('--from-backup')
const backupFileArg = args.find(a => a.endsWith('.json'))

function getExistingDailyDates() {
  if (!fs.existsSync(DAILY_DIR)) {
    return new Set()
  }
  const files = fs.readdirSync(DAILY_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map(f => f.replace('.json', ''))
  return new Set(files)
}

function getLatestBackup() {
  const files = fs.readdirSync(BACKUPS_DIR)
    .filter(f => /^backup-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .reverse()

  if (files.length === 0) {
    throw new Error('No backup files found in ' + BACKUPS_DIR)
  }

  return path.join(BACKUPS_DIR, files[0])
}

function writeDailyFile(dateStr, entries) {
  if (!fs.existsSync(DAILY_DIR)) {
    fs.mkdirSync(DAILY_DIR, { recursive: true })
  }

  const output = { date: dateStr, entries }
  const filePath = path.join(DAILY_DIR, `${dateStr}.json`)
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2) + '\n')
  console.log(`  Created: ${dateStr}.json (${entries.length} entries)`)
}

// ============ Database Source ============

async function backfillFromDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL

  if (!DATABASE_URL) {
    console.error('DATABASE_URL or PROD_DATABASE_URL environment variable required')
    console.error('Use --from-backup to backfill from a backup file instead')
    process.exit(1)
  }

  console.log('Backfilling from database...')

  const pool = new Pool({ connectionString: DATABASE_URL })
  const existingDates = getExistingDailyDates()
  console.log(`Found ${existingDates.size} existing daily files`)

  try {
    // Get all distinct dates that have entries
    const datesResult = await pool.query(`
      SELECT DISTINCT DATE(occurred_at AT TIME ZONE 'America/New_York') as entry_date
      FROM entries
      WHERE archived_at IS NULL
      ORDER BY entry_date
    `)

    const allDates = datesResult.rows.map(r => r.entry_date.toISOString().split('T')[0])
    const missingDates = allDates.filter(d => !existingDates.has(d))

    console.log(`Database has entries for ${allDates.length} dates`)
    console.log(`Missing daily files: ${missingDates.length}`)

    if (missingDates.length === 0) {
      console.log('All daily files are up to date!')
      return
    }

    // Create missing daily files
    let created = 0
    for (const dateStr of missingDates) {
      const result = await pool.query(`
        SELECT
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

      if (result.rows.length === 0) continue

      const entries = result.rows.map(row => ({
        type: row.type,
        occurred_at: row.occurred_at.toISOString().replace('.000Z', '').replace('Z', ''),
        habit: row.habit,
        habit_id: row.habit_id,
        practice: row.practice,
        practice_id: row.practice_id,
        ...(row.target_id && { target_id: row.target_id }),
        duration_minutes: row.duration_minutes,
        note: row.note,
        ...(row.is_highlight && { is_highlight: true }),
        ...(row.warm_up_note && { warm_up_note: row.warm_up_note }),
        ...(row.cool_down_note && { cool_down_note: row.cool_down_note }),
      }))

      writeDailyFile(dateStr, entries)
      created++
    }

    console.log(`\nBackfill complete: ${created} files created`)

  } finally {
    await pool.end()
  }
}

// ============ Backup File Source ============

function backfillFromBackup() {
  const backupFile = backupFileArg || getLatestBackup()
  console.log('Backfilling from backup:', backupFile)

  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'))
  const existingDates = getExistingDailyDates()
  console.log(`Found ${existingDates.size} existing daily files`)

  // Build lookups for habit/practice names
  const habits = {}
  const practices = {}
  for (const h of backup.habits || []) habits[h.id] = h.name
  for (const p of backup.practices || []) practices[p.id] = p.name

  // Group entries by date (adjust for EST timezone)
  const entriesByDate = {}
  for (const entry of backup.entries || []) {
    if (entry.archived_at) continue

    const d = new Date(entry.occurred_at)
    d.setHours(d.getHours() - 5) // Adjust for EST
    const dateStr = d.toISOString().split('T')[0]

    if (!entriesByDate[dateStr]) entriesByDate[dateStr] = []
    entriesByDate[dateStr].push(entry)
  }

  const allDates = Object.keys(entriesByDate).sort()
  const missingDates = allDates.filter(d => !existingDates.has(d))

  console.log(`Backup has entries for ${allDates.length} dates`)
  console.log(`Missing daily files: ${missingDates.length}`)

  if (missingDates.length === 0) {
    console.log('All daily files are up to date!')
    return
  }

  // Create missing daily files
  let created = 0
  for (const dateStr of missingDates) {
    const entries = entriesByDate[dateStr]
      .map(e => ({
        type: e.type,
        occurred_at: e.occurred_at,
        habit: habits[e.habit_id] || 'Unknown',
        habit_id: e.habit_id,
        practice: practices[e.practice_id] || null,
        practice_id: e.practice_id,
        ...(e.target_id && { target_id: e.target_id }),
        duration_minutes: e.duration_minutes,
        note: e.note || null,
        ...(e.is_highlight && { is_highlight: true }),
        ...(e.warm_up_note && { warm_up_note: e.warm_up_note }),
        ...(e.cool_down_note && { cool_down_note: e.cool_down_note }),
      }))
      .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))

    writeDailyFile(dateStr, entries)
    created++
  }

  console.log(`\nBackfill complete: ${created} files created`)
}

// ============ Main ============

async function main() {
  if (fromBackup) {
    backfillFromBackup()
  } else {
    await backfillFromDatabase()
  }
}

main().catch(err => {
  console.error('Backfill failed:', err.message)
  process.exit(1)
})
