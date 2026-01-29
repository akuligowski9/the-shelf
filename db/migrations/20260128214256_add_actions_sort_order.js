/**
 * Migration: add_actions_sort_order
 * Created: 2026-01-28
 *
 * Add sort_order column to actions table for drag-drop reordering.
 */

module.exports = {
  async up(client) {
    await client.query(`
      ALTER TABLE actions ADD COLUMN IF NOT EXISTS sort_order INT
    `)
  },

  async down(client) {
    await client.query(`
      ALTER TABLE actions DROP COLUMN IF EXISTS sort_order
    `)
  }
}
