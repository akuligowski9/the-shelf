#!/usr/bin/env node
/**
 * Demo Seed Script - populates database with sample data for demo mode
 * Run from backend/api: node demo-seed.js
 *
 * This script:
 * 1. Loads habits, practices, and actions from data/habits.json
 * 2. Loads demo entries from data/logs/demo/*.json
 * 3. Creates sample targets
 * 4. Creates preparations, closures, and reflections
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
})

// Demo targets for different stages
const DEMO_TARGETS = [
  {
    name: 'Build a habit tracking mobile app',
    status: 'active',
    habit_name: 'Software',
    planned_duration: '3 months',
    notes: 'React Native app with offline support and sync capabilities.'
  },
  {
    name: 'Complete Spanish B1 certification',
    status: 'planned',
    habit_name: 'Spanish',
    planned_duration: '6 months',
    notes: 'Focus on conversation skills and vocabulary building.'
  },
  {
    name: 'Run a 10K race',
    status: 'active',
    habit_name: 'Exercise',
    start_date: '2026-01-01',
    end_date: '2026-03-15',
    notes: 'Training plan with gradual distance increase.'
  },
  {
    name: 'Read 12 books this year',
    status: 'active',
    habit_name: 'Reading',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    notes: 'Mix of fiction and non-fiction.'
  },
  {
    name: 'Teach Luna loose-leash walking',
    status: 'parked',
    habit_name: 'Dog Training',
    planned_duration: '2 months',
    notes: 'Paused until weather improves.'
  },
  {
    name: 'Refactor API authentication',
    status: 'completed',
    habit_name: 'Software',
    start_date: '2025-12-01',
    end_date: '2025-12-15',
    notes: 'Migrated from sessions to JWT tokens.'
  }
]

async function demoSeed() {
  const client = await pool.connect()

  try {
    console.log('Starting demo seed...\n')

    await client.query('BEGIN')

    // ===== 1. Clear existing data =====
    console.log('Clearing existing data...')
    await client.query('DELETE FROM reflections')
    await client.query('DELETE FROM closures')
    await client.query('DELETE FROM preparations')
    await client.query('DELETE FROM entries')
    await client.query('DELETE FROM targets')
    await client.query('DELETE FROM actions')
    await client.query('DELETE FROM practices')
    await client.query('DELETE FROM habits')

    // ===== 2. Load habits.json =====
    const habitsPath = path.join(__dirname, '..', '..', 'data', 'habits.json')
    const habitsData = JSON.parse(fs.readFileSync(habitsPath, 'utf8'))

    console.log('\nSeeding habits, practices, and actions...')

    // Build lookup maps
    const habitIdByName = {}
    const practiceIdByHabitAndName = {}

    for (const habit of habitsData.habits) {
      await client.query(
        `INSERT INTO habits (id, name, active, color, target_minutes, track_actions)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [habit.id, habit.name, habit.active, habit.color, habit.target_minutes || 60, habit.track_actions]
      )
      habitIdByName[habit.name] = habit.id
      console.log(`  + Habit: ${habit.name}`)

      for (const practice of habit.practices) {
        await client.query(
          `INSERT INTO practices (id, habit_id, name, active)
           VALUES ($1, $2, $3, $4)`,
          [practice.id, habit.id, practice.name, practice.active]
        )

        const key = `${habit.name}:${practice.name}`
        practiceIdByHabitAndName[key] = practice.id

        if (practice.actions && practice.actions.length > 0) {
          for (const actionName of practice.actions) {
            await client.query(
              `INSERT INTO actions (practice_id, name, active)
               VALUES ($1, $2, $3)`,
              [practice.id, actionName, true]
            )
          }
        }
      }
    }

    // Add practice aliases to lookup
    if (habitsData.practice_aliases) {
      for (const [alias, targetName] of Object.entries(habitsData.practice_aliases)) {
        for (const [key, id] of Object.entries(practiceIdByHabitAndName)) {
          if (key.endsWith(`:${targetName}`)) {
            const habitName = key.split(':')[0]
            practiceIdByHabitAndName[`${habitName}:${alias}`] = id
          }
        }
      }
    }

    // Reset sequences
    await client.query(`SELECT setval('habits_id_seq', (SELECT COALESCE(MAX(id), 1) FROM habits))`)
    await client.query(`SELECT setval('practices_id_seq', (SELECT COALESCE(MAX(id), 1) FROM practices))`)

    // ===== 3. Load demo log files =====
    const demoLogsPath = path.join(__dirname, '..', '..', 'data', 'logs', 'demo')
    const logFiles = fs.readdirSync(demoLogsPath).filter(f => f.endsWith('.json')).sort()

    console.log(`\nSeeding entries from ${logFiles.length} demo log files...`)

    let entryCount = 0
    let prepCount = 0
    let closureCount = 0
    let reflectionCount = 0

    for (const logFile of logFiles) {
      const logPath = path.join(demoLogsPath, logFile)
      const logData = JSON.parse(fs.readFileSync(logPath, 'utf8'))
      const date = logData.date

      console.log(`  Processing ${date}...`)

      // Process preparations
      if (logData.preparations) {
        for (const prep of logData.preparations) {
          const periodStart = date
          const periodType = prep.period_type || 'day'

          // Check if preparation already exists (unique constraint)
          const existing = await client.query(
            `SELECT id FROM preparations WHERE period_type = $1 AND period_start = $2`,
            [periodType, periodStart]
          )

          if (existing.rows.length === 0) {
            await client.query(
              `INSERT INTO preparations (period_type, period_start, note, rest_day)
               VALUES ($1, $2, $3, $4)`,
              [periodType, periodStart, prep.note || null, prep.rest_day || false]
            )
            prepCount++
          }
        }
      }

      // Process entries
      if (logData.entries) {
        for (const entry of logData.entries) {
          let habitId = null
          let practiceId = null

          if (entry.type === 'habit' && entry.habit) {
            habitId = habitIdByName[entry.habit]
            if (!habitId) {
              console.log(`    Warning: Unknown habit "${entry.habit}", skipping entry`)
              continue
            }

            if (entry.practice) {
              const practiceKey = `${entry.habit}:${entry.practice}`
              practiceId = practiceIdByHabitAndName[practiceKey]
              if (!practiceId) {
                console.log(`    Warning: Unknown practice "${entry.practice}" for habit "${entry.habit}"`)
              }
            }
          }

          const occurredAt = entry.occurred_at || `${date}T12:00:00`

          await client.query(
            `INSERT INTO entries (type, occurred_at, habit_id, practice_id, duration_minutes, note, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              entry.type,
              occurredAt,
              habitId,
              practiceId,
              entry.duration_minutes || null,
              entry.note || null,
              'import'
            ]
          )
          entryCount++
        }
      }

      // Process closures
      if (logData.closures) {
        for (const closure of logData.closures) {
          const occurredAt = closure.occurred_at || `${date}T23:00:00`

          await client.query(
            `INSERT INTO closures (scope, occurred_at, note)
             VALUES ($1, $2, $3)`,
            [closure.scope || 'day', occurredAt, closure.note || null]
          )
          closureCount++
        }
      }

      // Process reflections
      if (logData.reflections) {
        for (const reflection of logData.reflections) {
          await client.query(
            `INSERT INTO reflections (reflection_type, period_start, period_end, note)
             VALUES ($1, $2, $3, $4)`,
            ['day', date, date, reflection.note]
          )
          reflectionCount++
        }
      }
    }

    console.log(`\n  Entries: ${entryCount}`)
    console.log(`  Preparations: ${prepCount}`)
    console.log(`  Closures: ${closureCount}`)
    console.log(`  Reflections: ${reflectionCount}`)

    // ===== 4. Create demo targets =====
    console.log('\nSeeding targets...')

    for (const target of DEMO_TARGETS) {
      const habitId = target.habit_name ? habitIdByName[target.habit_name] : null

      await client.query(
        `INSERT INTO targets (name, status, habit_id, start_date, end_date, planned_duration, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          target.name,
          target.status,
          habitId,
          target.start_date || null,
          target.end_date || null,
          target.planned_duration || null,
          target.notes || null
        ]
      )
      console.log(`  + Target: ${target.name} (${target.status})`)
    }

    // ===== 5. Add a weekly reflection =====
    console.log('\nSeeding weekly reflection...')
    await client.query(
      `INSERT INTO reflections (reflection_type, period_start, period_end, note)
       VALUES ($1, $2, $3, $4)`,
      [
        'weekly',
        '2026-01-06',
        '2026-01-12',
        '## Week 2 Reflection\n\n**What went well:**\n- Consistent exercise routine\n- Good progress on software project\n- Quality reading time\n\n**What to improve:**\n- Earlier bedtimes\n- More focused dog training sessions\n\n**Focus for next week:**\n- Complete API refactor\n- Start 10K training plan'
      ]
    )

    await client.query('COMMIT')

    // ===== Summary =====
    console.log('\n' + '='.repeat(40))
    console.log('Demo seed complete!')
    console.log('='.repeat(40))

    const counts = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM habits) as habits,
        (SELECT COUNT(*) FROM practices) as practices,
        (SELECT COUNT(*) FROM actions) as actions,
        (SELECT COUNT(*) FROM entries) as entries,
        (SELECT COUNT(*) FROM targets) as targets,
        (SELECT COUNT(*) FROM preparations) as preparations,
        (SELECT COUNT(*) FROM closures) as closures,
        (SELECT COUNT(*) FROM reflections) as reflections
    `)

    const c = counts.rows[0]
    console.log(`\nDatabase totals:`)
    console.log(`  Habits:       ${c.habits}`)
    console.log(`  Practices:    ${c.practices}`)
    console.log(`  Actions:      ${c.actions}`)
    console.log(`  Entries:      ${c.entries}`)
    console.log(`  Targets:      ${c.targets}`)
    console.log(`  Preparations: ${c.preparations}`)
    console.log(`  Closures:     ${c.closures}`)
    console.log(`  Reflections:  ${c.reflections}`)

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('\nDemo seed failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

demoSeed().catch(err => {
  console.error(err)
  process.exit(1)
})
