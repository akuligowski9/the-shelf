#!/usr/bin/env node
/**
 * Restore local backup to production Neon database
 *
 * DESTRUCTIVE: This will delete all production data and replace it with the backup
 *
 * Usage: node restore-to-production.js <backup-file-path>
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node restore-to-production.js <backup-file-path>');
  process.exit(1);
}

const backupPath = process.argv[2];

// Read production connection string from environment
const prodUrl = process.env.PROD_DATABASE_URL || process.env.DATABASE_URL;

if (!prodUrl) {
  console.error('ERROR: PROD_DATABASE_URL or DATABASE_URL not set');
  process.exit(1);
}

if (prodUrl.includes('localhost')) {
  console.error('ERROR: DATABASE_URL points to localhost. This script is for production only.');
  console.error('Set PROD_DATABASE_URL to your production Neon connection string.');
  process.exit(1);
}

console.log('⚠️  WARNING: This will DELETE all data in production and restore from backup');
console.log(`Production database: ${prodUrl.split('@')[1]?.split('/')[0] || 'unknown'}`);
console.log(`Backup file: ${backupPath}`);
console.log('\nCreating safety backup first...\n');

const pool = new Pool({ connectionString: prodUrl });

async function createSafetyBackup() {
  const client = await pool.connect();
  try {
    const tables = [
      { name: 'habits', orderBy: 'id' },
      { name: 'practices', orderBy: 'id' },
      { name: 'actions', orderBy: 'id' },
      { name: 'targets', orderBy: 'id' },
      { name: 'entries', orderBy: 'id' },
      { name: 'preparations', orderBy: 'id' },
      { name: 'closures', orderBy: 'id' },
      { name: 'reflections', orderBy: 'id' },
      { name: 'habit_transitions', orderBy: 'id' },
      { name: 'settings', orderBy: 'key' }
    ];

    const data = {
      exported_at: new Date().toISOString(),
      version: '1.0'
    };

    for (const table of tables) {
      const result = await client.query(`SELECT * FROM ${table.name} ORDER BY ${table.orderBy}`);
      data[table.name] = result.rows;
      console.log(`  ${table.name}: ${result.rows.length} rows`);
    }

    const backupDir = path.join(__dirname, '../../data/backups');
    const filename = `backup-prod-before-restore-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`\n✓ Safety backup saved: ${filepath}\n`);

    return filepath;
  } finally {
    client.release();
  }
}

async function restoreBackup() {
  const client = await pool.connect();
  try {
    // Read backup file
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`Restoring from backup: ${backup.exported_at}\n`);

    // Delete all data (in reverse dependency order)
    console.log('Clearing production database...');
    const tablesToClear = [
      'mutation_logs', 'entries', 'preparations', 'closures', 'reflections',
      'habit_transitions', 'habit_prompts', 'targets', 'actions', 'practices',
      'habits', 'settings'
    ];

    for (const table of tablesToClear) {
      try {
        await client.query(`DELETE FROM ${table}`);
      } catch (err) {
        if (err.code === '42P01') {
          console.log(`  ${table}: table doesn't exist (skipped)`);
        } else {
          throw err;
        }
      }
    }
    console.log('✓ Production database cleared\n');

    // Restore each table
    console.log('Restoring data...');

    const tables = ['habits', 'practices', 'actions', 'targets', 'entries',
                    'preparations', 'closures', 'reflections', 'habit_transitions', 'settings'];

    for (const table of tables) {
      const rows = backup[table] || [];
      if (rows.length === 0) {
        console.log(`  ${table}: 0 rows (skipped)`);
        continue;
      }

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map(val => {
          // Convert arrays and objects to JSON strings for JSONB columns
          if (Array.isArray(val) || (val && typeof val === 'object' && val.constructor === Object)) {
            return JSON.stringify(val);
          }
          return val;
        });
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        await client.query(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          values
        );
      }
      console.log(`  ${table}: ${rows.length} rows restored`);
    }

    console.log('\n✓ Restore complete!');

  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  try {
    await createSafetyBackup();
    await restoreBackup();
    console.log('\n✓ Production database successfully restored from local backup');
  } catch (error) {
    console.error('\n❌ Restore failed:', error.message);
    throw error;
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
