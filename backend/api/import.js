#!/usr/bin/env node
/**
 * Import script - loads log files from data/logs/ into the database
 * Run from backend/api: node import.js [--file=2026-01-12.json]
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
})

// Load habits.json for lookups and aliases
function loadHabitsData() {
  const habitsPath = path.join(__dirname, '..', '..', 'data', 'habits.json')
  return JSON.parse(fs.readFileSync(habitsPath, 'utf8'))
}

// Build lookup maps for habits, practices, and aliases
function buildLookups(habitsData) {
  const habitsByName = {}
  const practicesByName = {}
  const practiceAliases = habitsData.practice_aliases || {}

  for (const habit of habitsData.habits) {
    habitsByName[habit.name.toLowerCase()] = habit

    for (const practice of habit.practices) {
      const key = `${habit.name.toLowerCase()}:${practice.name.toLowerCase()}`
      practicesByName[key] = { ...practice, habit_id: habit.id }
    }
  }

  return { habitsByName, practicesByName, practiceAliases }
}

// Resolve practice name (with alias support)
function resolvePracticeName(name, aliases) {
  return aliases[name] || name
}

// Find habit by name
function findHabit(name, lookups) {
  return lookups.habitsByName[name.toLowerCase()]
}

// Find practice by habit and practice name
function findPractice(habitName, practiceName, lookups) {
  const resolvedName = resolvePracticeName(practiceName, lookups.practiceAliases)
  const key = `${habitName.toLowerCase()}:${resolvedName.toLowerCase()}`
  return lookups.practicesByName[key]
}

// Import a single log file
async function importLogFile(client, filePath, lookups, stats) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const date = data.date

  if (!date) {
    console.log(`  Skipping ${path.basename(filePath)} - no date field`)
    return
  }

  console.log(`  Importing ${date}...`)

  // Process entries
  if (data.entries && Array.isArray(data.entries)) {
    for (const entry of data.entries) {
      try {
        await importEntry(client, entry, date, lookups)
        stats.entries++
      } catch (err) {
        console.log(`    Warning: Failed to import entry: ${err.message}`)
        stats.errors++
      }
    }
  }

  // Process preparations
  if (data.preparations && Array.isArray(data.preparations)) {
    for (const prep of data.preparations) {
      try {
        await importPreparation(client, prep, date, lookups)
        stats.preparations++
      } catch (err) {
        console.log(`    Warning: Failed to import preparation: ${err.message}`)
        stats.errors++
      }
    }
  }

  // Process closures
  if (data.closures && Array.isArray(data.closures)) {
    for (const closure of data.closures) {
      try {
        await importClosure(client, closure, date, lookups)
        stats.closures++
      } catch (err) {
        console.log(`    Warning: Failed to import closure: ${err.message}`)
        stats.errors++
      }
    }
  }

  // Process reflections
  if (data.reflections && Array.isArray(data.reflections)) {
    for (const reflection of data.reflections) {
      try {
        await importReflection(client, reflection, date)
        stats.reflections++
      } catch (err) {
        console.log(`    Warning: Failed to import reflection: ${err.message}`)
        stats.errors++
      }
    }
  }

  stats.files++
}

// Import a single entry
async function importEntry(client, entry, date, lookups) {
  const type = entry.type
  if (!type || !entry.occurred_at) {
    throw new Error('Entry missing type or occurred_at')
  }

  let habit_id = null
  let practice_id = null

  if (type === 'habit') {
    if (!entry.habit) {
      throw new Error('Habit entry missing habit name')
    }

    const habit = findHabit(entry.habit, lookups)
    if (!habit) {
      throw new Error(`Unknown habit: ${entry.habit}`)
    }
    habit_id = habit.id

    if (entry.practice) {
      const practice = findPractice(entry.habit, entry.practice, lookups)
      if (practice) {
        practice_id = practice.id
      } else {
        console.log(`      Note: Unknown practice "${entry.practice}" for habit "${entry.habit}"`)
      }
    }
  }

  // Check for duplicate (same occurred_at and type)
  const existing = await client.query(
    `SELECT id FROM entries WHERE occurred_at = $1 AND type = $2 AND habit_id IS NOT DISTINCT FROM $3`,
    [entry.occurred_at, type, habit_id]
  )

  if (existing.rows.length > 0) {
    // Skip duplicate
    return
  }

  await client.query(
    `INSERT INTO entries (type, occurred_at, habit_id, practice_id, duration_minutes, note, is_highlight, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      type,
      entry.occurred_at,
      habit_id,
      practice_id,
      entry.duration_minutes || null,
      entry.note || null,
      entry.is_highlight || false,
      'import'
    ]
  )
}

// Import a preparation
async function importPreparation(client, prep, date, lookups) {
  const occurredAt = prep.occurred_at || `${date}T08:00:00`

  // Check for duplicate
  const existing = await client.query(
    `SELECT id FROM preparations WHERE period_start = $1`,
    [date]
  )

  if (existing.rows.length > 0) {
    return
  }

  let habit_id = null
  if (prep.habit) {
    const habit = findHabit(prep.habit, lookups)
    if (habit) habit_id = habit.id
  }

  await client.query(
    `INSERT INTO preparations (period_type, period_start, note, habit_id, rest_day)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      prep.period_type || 'day',
      date,
      prep.note || null,
      habit_id,
      prep.rest_day || false
    ]
  )
}

// Import a closure
async function importClosure(client, closure, date, lookups) {
  const occurredAt = closure.occurred_at || `${date}T22:00:00`

  let habit_id = null
  if (closure.habit) {
    const habit = findHabit(closure.habit, lookups)
    if (habit) habit_id = habit.id
  }

  await client.query(
    `INSERT INTO closures (scope, occurred_at, habit_id, note)
     VALUES ($1, $2, $3, $4)`,
    [
      closure.scope || 'day',
      occurredAt,
      habit_id,
      closure.note || null
    ]
  )
}

// Import a reflection
async function importReflection(client, reflection, date) {
  await client.query(
    `INSERT INTO reflections (reflection_type, period_start, period_end, note)
     VALUES ($1, $2, $3, $4)`,
    [
      reflection.reflection_type || 'day',
      reflection.period_start || date,
      reflection.period_end || date,
      reflection.note || ''
    ]
  )
}

// Main import function
async function runImport(specificFile = null) {
  const client = await pool.connect()
  const habitsData = loadHabitsData()
  const lookups = buildLookups(habitsData)

  const stats = { files: 0, entries: 0, preparations: 0, closures: 0, reflections: 0, errors: 0 }

  try {
    await client.query('BEGIN')

    const logsDir = path.join(__dirname, '..', '..', 'data', 'logs')

    if (specificFile) {
      // Import single file
      const filePath = path.join(logsDir, specificFile)
      if (fs.existsSync(filePath)) {
        await importLogFile(client, filePath, lookups, stats)
      } else {
        console.log(`File not found: ${specificFile}`)
      }
    } else {
      // Import all log files (sorted by date)
      const files = fs.readdirSync(logsDir)
        .filter(f => f.endsWith('.json') && !fs.statSync(path.join(logsDir, f)).isDirectory())
        .sort()

      console.log(`Found ${files.length} log files`)

      for (const file of files) {
        await importLogFile(client, path.join(logsDir, file), lookups, stats)
      }
    }

    await client.query('COMMIT')

    console.log('\nImport complete!')
    console.log(`  Files: ${stats.files}`)
    console.log(`  Entries: ${stats.entries}`)
    console.log(`  Preparations: ${stats.preparations}`)
    console.log(`  Closures: ${stats.closures}`)
    console.log(`  Reflections: ${stats.reflections}`)
    if (stats.errors > 0) {
      console.log(`  Errors: ${stats.errors}`)
    }

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Import failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

// Parse command line args
const args = process.argv.slice(2)
let specificFile = null

for (const arg of args) {
  if (arg.startsWith('--file=')) {
    specificFile = arg.replace('--file=', '')
  }
}

runImport(specificFile).catch(err => {
  console.error(err)
  process.exit(1)
})
