require('dotenv').config();

const app = require('./app');
const cron = require('node-cron');
const { execSync } = require('child_process');
const path = require('path');
const pool = require('./db/pool');

const port = Number(process.env.PORT || 3001);

// Backfill done_at for completed targets that don't have it set
async function backfillCompletedTargets() {
  try {
    const result = await pool.query(`
      UPDATE targets
      SET done_at = COALESCE(updated_at::date, created_at::date)
      WHERE status = 'completed'
        AND done_at IS NULL
      RETURNING id, name, done_at
    `);
    if (result.rowCount > 0) {
      console.log(`Backfilled done_at for ${result.rowCount} completed target(s):`, result.rows.map(r => r.name));
    }
  } catch (err) {
    console.error('Failed to backfill completed targets:', err.message);
  }
}

// Run backfill on startup
backfillCompletedTargets();

// Schedule nightly backup at 11:59 PM
cron.schedule('59 23 * * *', () => {
  console.log('Running scheduled backup...');
  try {
    execSync('node backup.js', {
      cwd: __dirname,
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('Scheduled backup failed:', err.message);
  }
});

app.listen(port, () => {
  console.log(`Shelf API listening on http://localhost:${port}`);
  console.log('Nightly backup scheduled for 11:59 PM');
});
