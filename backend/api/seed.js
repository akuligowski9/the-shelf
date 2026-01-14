#!/usr/bin/env node
/**
 * Seed script - loads habits.json into the database
 * Run from backend/api: node seed.js
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
})

async function seed() {
  const client = await pool.connect()

  try {
    // Load habits.json
    const habitsPath = path.join(__dirname, '..', '..', 'data', 'habits.json')
    const habitsData = JSON.parse(fs.readFileSync(habitsPath, 'utf8'))

    console.log('Seeding habits, practices, and actions...')

    await client.query('BEGIN')

    // Clear existing data (in reverse dependency order)
    await client.query('DELETE FROM actions')
    await client.query('DELETE FROM practices')
    await client.query('DELETE FROM habits')

    // Insert habits
    for (const habit of habitsData.habits) {
      await client.query(
        `INSERT INTO habits (id, name, active, color, track_actions)
         VALUES ($1, $2, $3, $4, $5)`,
        [habit.id, habit.name, habit.active, habit.color, habit.track_actions]
      )
      console.log(`  + Habit: ${habit.name}`)

      // Insert practices for this habit
      for (const practice of habit.practices) {
        await client.query(
          `INSERT INTO practices (id, habit_id, name, active)
           VALUES ($1, $2, $3, $4)`,
          [practice.id, habit.id, practice.name, practice.active]
        )
        console.log(`    + Practice: ${practice.name}`)

        // Insert actions for this practice (if any)
        if (practice.actions && practice.actions.length > 0) {
          for (const actionName of practice.actions) {
            await client.query(
              `INSERT INTO actions (practice_id, name, active)
               VALUES ($1, $2, $3)`,
              [practice.id, actionName, true]
            )
            console.log(`      + Action: ${actionName}`)
          }
        }
      }
    }

    // Reset sequences to max id + 1
    await client.query(`SELECT setval('habits_id_seq', (SELECT MAX(id) FROM habits))`)
    await client.query(`SELECT setval('practices_id_seq', (SELECT MAX(id) FROM practices))`)

    await client.query('COMMIT')
    console.log('\nSeed complete!')

    // Show counts
    const habitCount = await client.query('SELECT COUNT(*) FROM habits')
    const practiceCount = await client.query('SELECT COUNT(*) FROM practices')
    const actionCount = await client.query('SELECT COUNT(*) FROM actions')

    console.log(`\nTotals:`)
    console.log(`  Habits: ${habitCount.rows[0].count}`)
    console.log(`  Practices: ${practiceCount.rows[0].count}`)
    console.log(`  Actions: ${actionCount.rows[0].count}`)

  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
