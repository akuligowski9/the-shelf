require('dotenv').config();

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncDailyLogsToDatabase() {
  const client = await pool.connect();

  try {
    console.log('Starting database sync from daily logs...\n');

    // First, ensure new practices exist
    console.log('Checking practices...');
    await client.query(`
      INSERT INTO practices (id, habit_id, name, active)
      VALUES
        (72, 3, 'Neutral Shoulders', true),
        (73, 6, 'Recovery', true)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Practices synced\n');

    // Ensure new targets exist
    console.log('Checking targets...');
    await client.query(`
      INSERT INTO targets (id, name, type, status, habit_id)
      VALUES
        (31, 'The Shelf', 'project', 'active', 1),
        (32, 'Spousal Visa', 'project', 'active', 6),
        (33, 'Abstractly', 'project', 'planned', 1),
        (34, 'GreenRoom', 'project', 'planned', 1),
        (35, 'Symmetrical Upper Body', 'project', 'active', 3)
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Targets synced\n');

    // Read all daily log files
    const dailyDir = path.join(__dirname, '../../data/daily');
    const files = fs.readdirSync(dailyDir)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/))
      .sort();

    console.log(`Found ${files.length} daily log files\n`);

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const file of files) {
      const filePath = path.join(dailyDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const date = data.date;

      console.log(`Processing ${date}...`);

      for (const entry of data.entries) {
        // Check if entry already exists based on occurred_at timestamp
        // This is the primary way to identify duplicates since timestamps should be unique
        const existing = await client.query(
          `SELECT id FROM entries WHERE occurred_at = $1`,
          [entry.occurred_at]
        );

        if (existing.rows.length > 0) {
          console.log(`  - Skipping duplicate: ${entry.occurred_at} (${entry.type})`);
          totalSkipped++;
          continue;
        }

        // Insert entry
        await client.query(
          `INSERT INTO entries (
            type, occurred_at, habit_id, practice_id, target_id,
            duration_minutes, note, actions, is_highlight, source,
            warm_up_note, cool_down_note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            entry.type,
            entry.occurred_at,
            entry.habit_id,
            entry.practice_id,
            entry.target_id,
            entry.duration_minutes,
            entry.note,
            entry.actions ? JSON.stringify(entry.actions) : null,
            entry.is_highlight,
            entry.source,
            entry.warm_up_note,
            entry.cool_down_note
          ]
        );
        totalInserted++;
      }

      console.log(`  ✓ Completed ${date}`);
    }

    console.log(`\n✓ Sync complete!`);
    console.log(`  Inserted: ${totalInserted} entries`);
    console.log(`  Skipped (duplicates): ${totalSkipped} entries`);

  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

syncDailyLogsToDatabase().catch(console.error);
