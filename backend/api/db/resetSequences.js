const pool = require('./pool');

/**
 * Reset all PostgreSQL sequences to match the current max IDs in their tables.
 * This prevents "duplicate key value violates unique constraint" errors after
 * data imports or restores that insert rows with explicit IDs.
 */
async function resetAllSequences(client = null) {
  const db = client || pool;

  const sequences = [
    { table: 'habits', sequence: 'habits_id_seq' },
    { table: 'practices', sequence: 'practices_id_seq' },
    { table: 'actions', sequence: 'actions_id_seq' },
    { table: 'targets', sequence: 'targets_id_seq' },
    { table: 'entries', sequence: 'entries_id_seq' },
    { table: 'preparations', sequence: 'preparations_id_seq' },
    { table: 'closures', sequence: 'closures_id_seq' },
    { table: 'reflections', sequence: 'reflections_id_seq' },
    { table: 'habit_prompts', sequence: 'habit_prompts_id_seq' },
    { table: 'transitions', sequence: 'transitions_id_seq' },
  ];

  const results = {};

  for (const { table, sequence } of sequences) {
    try {
      // Get current max ID
      const maxResult = await db.query(`SELECT COALESCE(MAX(id), 0) as max_id FROM ${table}`);
      const maxId = maxResult.rows[0].max_id;

      // Get current sequence value
      const seqResult = await db.query(`SELECT last_value FROM ${sequence}`);
      const currentSeqValue = seqResult.rows[0].last_value;

      // Reset sequence to max ID (next insert will use max_id + 1)
      // Use max_id or 1, whichever is greater, to handle empty tables
      const newValue = Math.max(maxId, 1);
      await db.query(`SELECT setval('${sequence}', $1)`, [newValue]);

      results[table] = {
        max_id: maxId,
        previous_sequence: currentSeqValue,
        new_sequence: newValue,
        was_out_of_sync: currentSeqValue < maxId,
      };
    } catch (err) {
      results[table] = { error: err.message };
    }
  }

  return results;
}

module.exports = { resetAllSequences };
