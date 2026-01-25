/**
 * Migration: add_missing_habit_prompts_columns
 * Created: 2026-01-25T04:02:15.000Z
 *
 * Adds missing columns to habit_prompts table:
 * - has_dynamic_elements (for prompt interpolation)
 * - sort_order (for custom ordering)
 * - updated_at (for tracking changes)
 */

module.exports = {
  async up(client) {
    console.log('    Adding missing columns to habit_prompts...')

    // Add has_dynamic_elements column
    await client.query(`
      ALTER TABLE habit_prompts
      ADD COLUMN IF NOT EXISTS has_dynamic_elements BOOLEAN DEFAULT false
    `)

    // Add sort_order column
    await client.query(`
      ALTER TABLE habit_prompts
      ADD COLUMN IF NOT EXISTS sort_order INT
    `)

    // Add updated_at column
    await client.query(`
      ALTER TABLE habit_prompts
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    `)

    // Add trigger for updated_at
    await client.query(`
      DROP TRIGGER IF EXISTS trg_habit_prompts_updated_at ON habit_prompts
    `)

    await client.query(`
      CREATE TRIGGER trg_habit_prompts_updated_at
      BEFORE UPDATE ON habit_prompts
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    console.log('    Missing columns added to habit_prompts')
  },

  async down(client) {
    console.log('    Removing columns from habit_prompts...')

    await client.query(`
      DROP TRIGGER IF EXISTS trg_habit_prompts_updated_at ON habit_prompts
    `)

    await client.query(`
      ALTER TABLE habit_prompts
      DROP COLUMN IF EXISTS has_dynamic_elements,
      DROP COLUMN IF EXISTS sort_order,
      DROP COLUMN IF EXISTS updated_at
    `)

    console.log('    Columns removed from habit_prompts')
  }
}
