/**
 * Migration: add_habit_prompts_table
 * Created: 2026-01-25T02:37:05.547Z
 *
 * Adds the habit_prompts table for storing warmup/cooldown prompts
 * associated with habits. This table exists in production but was
 * not previously tracked in schema.sql.
 */

module.exports = {
  async up(client) {
    console.log('    Creating habit_prompts table...')

    await client.query(`
      CREATE TABLE IF NOT EXISTS habit_prompts (
        id SERIAL PRIMARY KEY,
        habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('warmup', 'cooldown')),
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_habit_prompts_habit_id
      ON habit_prompts (habit_id)
    `)

    console.log('    habit_prompts table created')
  },

  async down(client) {
    console.log('    Dropping habit_prompts table...')
    await client.query(`DROP TABLE IF EXISTS habit_prompts`)
    console.log('    habit_prompts table dropped')
  }
}
