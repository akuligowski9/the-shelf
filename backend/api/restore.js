#!/usr/bin/env node
/**
 * Restore Script - imports backup JSON into local database
 *
 * Usage:
 *   node restore.js                     # Restore latest backup
 *   node restore.js backup-2026-01-22.json  # Restore specific backup
 *   npm run restore                     # Via npm
 *   npm run restore -- backup-2026-01-22.json
 *
 * WARNING: This will DELETE all existing data in the target database!
 * Only use on local development database.
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
const BACKUP_DIR = path.join(__dirname, '..', '..', 'data', 'backups')

// Safety check - refuse to run against production
if (DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('aws.neon')) {
  console.error('\n❌ SAFETY STOP: Cannot restore to a Neon (production) database!')
  console.error('This script is only for local development databases.')
  console.error('DATABASE_URL:', DATABASE_URL.replace(/:[^:@]+@/, ':***@'))
  process.exit(1)
}

async function confirm(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(message, answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function restore() {
  // Find backup file
  let backupFile = process.argv[2]

  if (!backupFile) {
    // Find latest backup
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse()

    if (files.length === 0) {
      console.error('No backup files found in', BACKUP_DIR)
      console.error('\nTo create a backup from production:')
      console.error('  DATABASE_URL=<prod-url> npm run backup')
      process.exit(1)
    }

    backupFile = files[0]
    console.log(`Using latest backup: ${backupFile}`)
  }

  const backupPath = path.join(BACKUP_DIR, backupFile)

  if (!fs.existsSync(backupPath)) {
    console.error(`Backup file not found: ${backupPath}`)
    process.exit(1)
  }

  // Load backup data
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
  console.log(`\nBackup from: ${data.exported_at}`)

  // Show what will be restored
  const tables = ['habits', 'practices', 'actions', 'targets', 'entries', 'preparations', 'closures', 'reflections', 'habit_transitions', 'settings']
  console.log('\nData to restore:')
  for (const table of tables) {
    if (data[table]) {
      console.log(`  ${table}: ${data[table].length} rows`)
    }
  }

  // Confirm
  console.log(`\n⚠️  This will DELETE all existing data in: ${DATABASE_URL.replace(/:[^:@]+@/, ':***@')}`)
  const confirmed = await confirm('Continue? (y/n): ')

  if (!confirmed) {
    console.log('Aborted.')
    process.exit(0)
  }

  // Connect and restore
  const pool = new Pool({ connectionString: DATABASE_URL })
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Delete in reverse dependency order
    console.log('\nClearing existing data...')
    await client.query('DELETE FROM reflections')
    await client.query('DELETE FROM closures')
    await client.query('DELETE FROM preparations')
    await client.query('DELETE FROM entries')
    await client.query('DELETE FROM targets')
    await client.query('DELETE FROM actions')
    await client.query('DELETE FROM practices')
    await client.query('DELETE FROM habit_transitions')
    await client.query('DELETE FROM habits')
    await client.query('DELETE FROM settings')

    // Insert data
    console.log('Restoring data...')

    // Habits
    for (const row of data.habits || []) {
      await client.query(
        `INSERT INTO habits (id, name, type, active, target_minutes, color, track_actions, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [row.id, row.name, row.type || 'habit', row.active, row.target_minutes, row.color, row.track_actions, row.sort_order, row.created_at, row.updated_at]
      )
    }

    // Practices
    for (const row of data.practices || []) {
      await client.query(
        `INSERT INTO practices (id, habit_id, name, active, details, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [row.id, row.habit_id, row.name, row.active, row.details, row.sort_order, row.created_at, row.updated_at]
      )
    }

    // Actions
    for (const row of data.actions || []) {
      await client.query(
        `INSERT INTO actions (id, practice_id, name, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.id, row.practice_id, row.name, row.active, row.created_at, row.updated_at]
      )
    }

    // Targets
    for (const row of data.targets || []) {
      await client.query(
        `INSERT INTO targets (id, type, name, description, notes, status, habit_id, start_date, end_date, planned_duration, done_at, sort_order, github_issue_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [row.id, row.type, row.name, row.description, row.notes, row.status, row.habit_id, row.start_date, row.end_date, row.planned_duration, row.done_at, row.sort_order, row.github_issue_url, row.created_at, row.updated_at]
      )
    }

    // Entries
    for (const row of data.entries || []) {
      await client.query(
        `INSERT INTO entries (id, type, occurred_at, habit_id, practice_id, target_id, duration_minutes, note, actions, is_highlight, source, warm_up_note, cool_down_note, archived_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [row.id, row.type, row.occurred_at, row.habit_id, row.practice_id, row.target_id, row.duration_minutes, row.note, row.actions ? JSON.stringify(row.actions) : null, row.is_highlight, row.source, row.warm_up_note, row.cool_down_note, row.archived_at, row.created_at, row.updated_at]
      )
    }

    // Preparations
    for (const row of data.preparations || []) {
      await client.query(
        `INSERT INTO preparations (id, period_type, period_start, note, habit_id, target_id, rest_day, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [row.id, row.period_type, row.period_start, row.note, row.habit_id, row.target_id, row.rest_day, row.created_at, row.updated_at]
      )
    }

    // Closures
    for (const row of data.closures || []) {
      await client.query(
        `INSERT INTO closures (id, scope, occurred_at, habit_id, practice_id, note, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [row.id, row.scope, row.occurred_at, row.habit_id, row.practice_id, row.note, row.created_at, row.updated_at]
      )
    }

    // Reflections
    for (const row of data.reflections || []) {
      await client.query(
        `INSERT INTO reflections (id, reflection_type, period_start, period_end, habit_id, target_id, entry_id, note, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [row.id, row.reflection_type, row.period_start, row.period_end, row.habit_id, row.target_id, row.entry_id, row.note, row.created_at, row.updated_at]
      )
    }

    // Habit transitions
    for (const row of data.habit_transitions || []) {
      await client.query(
        `INSERT INTO habit_transitions (id, started_at, ended_at, note, changes, cascades, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [row.id, row.started_at, row.ended_at, row.note, JSON.stringify(row.changes), JSON.stringify(row.cascades), row.created_at]
      )
    }

    // Settings
    for (const row of data.settings || []) {
      await client.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, $3)`,
        [row.key, row.value, row.updated_at]
      )
    }

    // Reset sequences
    await client.query(`SELECT setval('habits_id_seq', COALESCE((SELECT MAX(id) FROM habits), 1))`)
    await client.query(`SELECT setval('practices_id_seq', COALESCE((SELECT MAX(id) FROM practices), 1))`)
    await client.query(`SELECT setval('actions_id_seq', COALESCE((SELECT MAX(id) FROM actions), 1))`)
    await client.query(`SELECT setval('targets_id_seq', COALESCE((SELECT MAX(id) FROM targets), 1))`)
    await client.query(`SELECT setval('entries_id_seq', COALESCE((SELECT MAX(id) FROM entries), 1))`)
    await client.query(`SELECT setval('preparations_id_seq', COALESCE((SELECT MAX(id) FROM preparations), 1))`)
    await client.query(`SELECT setval('closures_id_seq', COALESCE((SELECT MAX(id) FROM closures), 1))`)
    await client.query(`SELECT setval('reflections_id_seq', COALESCE((SELECT MAX(id) FROM reflections), 1))`)
    await client.query(`SELECT setval('habit_transitions_id_seq', COALESCE((SELECT MAX(id) FROM habit_transitions), 1))`)

    await client.query('COMMIT')

    console.log('\n✅ Restore complete!')

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('\n❌ Restore failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

restore().catch(err => {
  console.error(err)
  process.exit(1)
})
