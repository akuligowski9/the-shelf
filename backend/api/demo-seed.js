#!/usr/bin/env node
/**
 * ██████████████████████████████████████████████████████████████████████████████
 * ██                                                                          ██
 * ██   ⛔⛔⛔  DANGER: THIS SCRIPT PERMANENTLY DELETES ALL DATA  ⛔⛔⛔      ██
 * ██                                                                          ██
 * ██   This script WIPES the entire database and replaces it with demo data.  ██
 * ██   There is NO UNDO. All your entries, habits, targets will be GONE.      ██
 * ██                                                                          ██
 * ██   DO NOT RUN THIS ON A DATABASE WITH REAL DATA.                          ██
 * ██                                                                          ██
 * ██████████████████████████████████████████████████████████████████████████████
 *
 * REQUIRED TO RUN:
 *   1. Set environment variable: I_UNDERSTAND_THIS_DELETES_ALL_DATA=yes
 *   2. Set environment variable: THIS_IS_A_DEMO_DATABASE=yes
 *   3. Type exact confirmation phrase when prompted
 *
 * Example:
 *   I_UNDERSTAND_THIS_DELETES_ALL_DATA=yes THIS_IS_A_DEMO_DATABASE=yes npm run demo-seed
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

// ========== SAFETY CHECK 1: Require BOTH environment variables ==========
if (process.env.I_UNDERSTAND_THIS_DELETES_ALL_DATA !== 'yes') {
  console.error('\n' + '='.repeat(70))
  console.error('⛔ BLOCKED: Missing I_UNDERSTAND_THIS_DELETES_ALL_DATA=yes')
  console.error('='.repeat(70))
  console.error('\nThis script PERMANENTLY DELETES ALL DATA. It cannot be undone.')
  console.error('\nTo run, you must set BOTH environment variables:')
  console.error('\n  I_UNDERSTAND_THIS_DELETES_ALL_DATA=yes THIS_IS_A_DEMO_DATABASE=yes npm run demo-seed')
  console.error('\n' + '='.repeat(70) + '\n')
  process.exit(1)
}

if (process.env.THIS_IS_A_DEMO_DATABASE !== 'yes') {
  console.error('\n' + '='.repeat(70))
  console.error('⛔ BLOCKED: Missing THIS_IS_A_DEMO_DATABASE=yes')
  console.error('='.repeat(70))
  console.error('\nThis safety check ensures you don\'t accidentally wipe your real data.')
  console.error('\nOnly run this on a dedicated demo database, NEVER on your personal data.')
  console.error('\nTo run, you must set BOTH environment variables:')
  console.error('\n  I_UNDERSTAND_THIS_DELETES_ALL_DATA=yes THIS_IS_A_DEMO_DATABASE=yes npm run demo-seed')
  console.error('\n' + '='.repeat(70) + '\n')
  process.exit(1)
}

// ========== SAFETY CHECK 2: Block running on localhost/default database ==========
const dbUrl = process.env.DATABASE_URL || ''
if (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('shelf:shelf@')) {
  console.error('\n' + '='.repeat(70))
  console.error('⛔ BLOCKED: Cannot run on local/default database')
  console.error('='.repeat(70))
  console.error('\nThis script is ONLY for dedicated demo databases on remote hosts.')
  console.error('\nYour DATABASE_URL appears to be a local or default database.')
  console.error('This script will NOT run on your personal development database.')
  console.error('\nIf you truly need to seed a demo database, use a separate Neon project.')
  console.error('\n' + '='.repeat(70) + '\n')
  process.exit(1)
}

const pool = new Pool({
  connectionString: dbUrl
})

// ========== SAFETY CHECK 2: Warn if database has existing data ==========
async function checkForExistingData() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT COUNT(*) as count FROM entries')
    const entryCount = parseInt(result.rows[0].count, 10)

    if (entryCount > 0) {
      console.error('\n' + '='.repeat(60))
      console.error(`⚠️  WARNING: Database contains ${entryCount} entries!`)
      console.error('='.repeat(60))
      console.error('\nThis script will DELETE ALL of them permanently.')
      console.error('There is NO undo. Make sure you have a backup.\n')

      // Interactive confirmation
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      return new Promise((resolve) => {
        rl.question(`Type "DELETE ${entryCount} ENTRIES" to proceed: `, (answer) => {
          rl.close()
          if (answer === `DELETE ${entryCount} ENTRIES`) {
            console.log('\nProceeding with deletion...\n')
            resolve(true)
          } else {
            console.log('\nAborted. No data was deleted.\n')
            resolve(false)
          }
        })
      })
    }
    return true // No existing data, safe to proceed
  } finally {
    client.release()
  }
}

// Demo targets for different stages - FICTIONAL DATA
const DEMO_TARGETS = [
  {
    name: 'Learn 10 jazz standards',
    status: 'active',
    habit_name: 'Music',
    start_date: '2025-09-01',
    planned_duration: '6 months',
    notes: 'Building repertoire for open mic nights. Currently on standard #6.'
  },
  {
    name: 'French A2 certification',
    status: 'active',
    habit_name: 'French',
    start_date: '2025-10-01',
    end_date: '2026-03-01',
    notes: 'DELF A2 exam scheduled for March.'
  },
  {
    name: 'Half marathon',
    status: 'active',
    habit_name: 'Fitness',
    start_date: '2025-11-01',
    end_date: '2026-04-15',
    notes: 'Spring race. Following 20-week training plan.'
  },
  {
    name: 'Photo essay: City at Dawn',
    status: 'active',
    habit_name: 'Photography',
    start_date: '2025-12-01',
    planned_duration: '3 months',
    notes: '20-image series capturing early morning urban life.'
  },
  {
    name: 'Read 24 books this year',
    status: 'active',
    habit_name: 'Reading',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    notes: '2 books per month goal. Mix of genres.'
  },
  {
    name: 'Master croissants',
    status: 'parked',
    habit_name: 'Cooking',
    planned_duration: '2 months',
    notes: 'Paused until kitchen renovation complete.'
  },
  {
    name: 'Autumn Leaves (jazz standard)',
    status: 'completed',
    habit_name: 'Music',
    start_date: '2025-09-15',
    end_date: '2025-10-20',
    notes: 'First standard learned! Can play melody and basic chord changes.'
  },
  {
    name: 'Couch to 10K',
    status: 'completed',
    habit_name: 'Fitness',
    start_date: '2025-08-01',
    end_date: '2025-10-31',
    notes: 'Built running base before half marathon training.'
  }
]

async function demoSeed() {
  // Run safety check before proceeding
  const canProceed = await checkForExistingData()
  if (!canProceed) {
    await pool.end()
    process.exit(0)
  }

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
    await client.query('DELETE FROM habit_transitions')
    await client.query('DELETE FROM habits')

    // ===== 2. Load demo-habits.json (fictional data) =====
    const habitsPath = path.join(__dirname, '..', '..', 'data', 'demo', 'demo-habits.json')
    const habitsData = JSON.parse(fs.readFileSync(habitsPath, 'utf8'))

    console.log('\nSeeding habits, practices, and actions...')

    // Build lookup maps
    const habitIdByName = {}
    const practiceIdByHabitAndName = {}

    for (const habit of habitsData.habits) {
      // Set type='caution' for Caution Behaviors habit
      const habitType = habit.name === 'Caution Behaviors' ? 'caution' : 'habit'
      await client.query(
        `INSERT INTO habits (id, name, type, active, color, target_minutes, track_actions)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [habit.id, habit.name, habitType, habit.active, habit.color, habit.target_minutes || 60, habit.track_actions]
      )
      habitIdByName[habit.name] = habit.id
      console.log(`  + Habit: ${habit.name} (${habitType})`)

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

    // ===== 3. Create demo targets (BEFORE entries so we can link) =====
    console.log('\nSeeding targets...')

    const targetIdByName = {}

    for (const target of DEMO_TARGETS) {
      const habitId = target.habit_name ? habitIdByName[target.habit_name] : null

      const result = await client.query(
        `INSERT INTO targets (name, status, habit_id, start_date, end_date, planned_duration, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
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
      targetIdByName[target.name] = result.rows[0].id
      console.log(`  + Target: ${target.name} (${target.status})`)
    }

    // ===== 4. Load demo log files =====
    const demoLogsPath = path.join(__dirname, '..', '..', 'data', 'demo')
    const logFiles = fs.readdirSync(demoLogsPath).filter(f => f.endsWith('.json') && f !== 'demo-habits.json').sort()

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
          let targetId = null

          // Handle habit entries
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

          // Handle caution entries - link to Caution Behaviors habit
          if (entry.type === 'caution') {
            habitId = habitIdByName['Caution Behaviors']
            // If caution has a practice (specific caution behavior), look it up
            if (entry.practice) {
              const practiceKey = `Caution Behaviors:${entry.practice}`
              practiceId = practiceIdByHabitAndName[practiceKey]
            }
          }

          // Link to target if specified
          if (entry.target && targetIdByName[entry.target]) {
            targetId = targetIdByName[entry.target]
          }

          const occurredAt = entry.occurred_at || `${date}T12:00:00`

          await client.query(
            `INSERT INTO entries (type, occurred_at, habit_id, practice_id, target_id, duration_minutes, note, source, is_highlight)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              entry.type,
              occurredAt,
              habitId,
              practiceId,
              targetId,
              entry.duration_minutes || null,
              entry.note || null,
              'import',
              entry.is_highlight || false
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

    // ===== 6. Add habit transitions =====
    console.log('\nSeeding habit transitions...')

    // Transition: Paused Cooking for kitchen renovation
    await client.query(
      `INSERT INTO habit_transitions (started_at, ended_at, note, changes, cascades)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        '2025-11-15T10:00:00Z',
        '2025-11-15T10:05:00Z',
        'Kitchen renovation starting. Pausing cooking habit until complete.',
        JSON.stringify([
          { habit_id: habitIdByName['Cooking'], field: 'active', from: true, to: false }
        ]),
        JSON.stringify({
          practices_deactivated: ['New Recipes', 'Baking', 'Meal Prep']
        })
      ]
    )
    console.log('  + Transition: Paused Cooking')

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
        (SELECT COUNT(*) FROM reflections) as reflections,
        (SELECT COUNT(*) FROM habit_transitions) as transitions
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
    console.log(`  Transitions:  ${c.transitions}`)

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
