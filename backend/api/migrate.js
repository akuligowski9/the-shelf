#!/usr/bin/env node
/**
 * Database Migration CLI
 *
 * Commands:
 *   npm run migrate              - Run pending migrations
 *   npm run migrate:status       - Show migration state
 *   npm run migrate:rollback     - Rollback last migration
 *   npm run migrate:create NAME  - Create new migration file
 *
 * Safety Features:
 *   - Production requires RUN_MIGRATIONS_ON_PRODUCTION env var
 *   - Interactive confirmation for production
 *   - All migrations run in transactions (auto-rollback on error)
 *   - Initial migration detects existing tables (no DROP/TRUNCATE)
 *   - schema_migrations table tracks state
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
})

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'db', 'migrations')
const IS_PRODUCTION = (process.env.DATABASE_URL || '').includes('neon.tech')

// =========================
// Helpers
// =========================

function log(msg, level = 'info') {
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '⛔',
    pending: '⏳',
    done: '✓'
  }
  console.log(`${symbols[level] || ''} ${msg}`)
}

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'y')
    })
  })
}

// =========================
// Migration Table Management
// =========================

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      version TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ DEFAULT NOW(),
      execution_time_ms INT,
      rolled_back_at TIMESTAMPTZ
    )
  `)
}

async function getAppliedMigrations(client) {
  const result = await client.query(`
    SELECT version, applied_at, execution_time_ms, rolled_back_at
    FROM schema_migrations
    ORDER BY version
  `)
  return result.rows
}

async function getAvailableMigrations() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true })
  }

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort()

  return files.map(f => ({
    version: f.replace('.js', ''),
    filename: f,
    filepath: path.join(MIGRATIONS_DIR, f)
  }))
}

async function getPendingMigrations(client) {
  const applied = await getAppliedMigrations(client)
  const available = await getAvailableMigrations()

  const appliedVersions = new Set(
    applied
      .filter(m => !m.rolled_back_at)
      .map(m => m.version)
  )

  return available.filter(m => !appliedVersions.has(m.version))
}

// =========================
// Migration Operations
// =========================

async function applyMigration(client, migration, dryRun = false) {
  const migrationModule = require(migration.filepath)

  if (typeof migrationModule.up !== 'function') {
    throw new Error(`Migration ${migration.version} missing up() function`)
  }

  log(`Applying: ${migration.version}`, 'pending')

  if (dryRun) {
    log('  (dry run - no changes made)', 'info')
    return
  }

  const startTime = Date.now()

  try {
    await client.query('BEGIN')

    // Run the migration
    await migrationModule.up(client)

    // Record in schema_migrations (or update if previously rolled back)
    const executionTime = Date.now() - startTime
    await client.query(`
      INSERT INTO schema_migrations (version, execution_time_ms, applied_at, rolled_back_at)
      VALUES ($1, $2, NOW(), NULL)
      ON CONFLICT (version) DO UPDATE SET
        applied_at = NOW(),
        rolled_back_at = NULL,
        execution_time_ms = $2
    `, [migration.version, executionTime])

    await client.query('COMMIT')

    log(`  Applied in ${executionTime}ms`, 'done')
  } catch (err) {
    await client.query('ROLLBACK')
    log(`  FAILED: ${err.message}`, 'error')
    throw err
  }
}

async function rollbackMigration(client, migration) {
  const migrationModule = require(migration.filepath)

  if (typeof migrationModule.down !== 'function') {
    throw new Error(`Migration ${migration.version} missing down() function`)
  }

  log(`Rolling back: ${migration.version}`, 'pending')

  const startTime = Date.now()

  try {
    await client.query('BEGIN')

    // Run the rollback
    await migrationModule.down(client)

    // Mark as rolled back
    await client.query(`
      UPDATE schema_migrations
      SET rolled_back_at = NOW()
      WHERE version = $1
    `, [migration.version])

    await client.query('COMMIT')

    const executionTime = Date.now() - startTime
    log(`  Rolled back in ${executionTime}ms`, 'done')
  } catch (err) {
    await client.query('ROLLBACK')
    log(`  ROLLBACK FAILED: ${err.message}`, 'error')
    throw err
  }
}

// =========================
// Commands
// =========================

async function runMigrations(dryRun = false) {
  const client = await pool.connect()

  try {
    // Safety check for production
    if (IS_PRODUCTION) {
      if (!process.env.RUN_MIGRATIONS_ON_PRODUCTION) {
        log('PRODUCTION DATABASE DETECTED', 'error')
        log('Migrations on production require RUN_MIGRATIONS_ON_PRODUCTION=yes', 'warning')
        log('Example: DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate', 'info')
        process.exit(1)
      }

      log('⚠️  PRODUCTION DATABASE DETECTED ⚠️', 'warning')
      log(`Database: ${process.env.DATABASE_URL.split('@')[1]}`, 'info')

      const confirmed = await confirm('\nRun migrations on PRODUCTION? (y/n): ')
      if (!confirmed) {
        log('Cancelled by user', 'info')
        process.exit(0)
      }
      console.log()
    }

    // Ensure migrations table exists
    await ensureMigrationsTable(client)

    // Get pending migrations
    const pending = await getPendingMigrations(client)

    if (pending.length === 0) {
      log('No pending migrations', 'success')
      return
    }

    log(`Found ${pending.length} pending migration(s):\n`, 'info')
    pending.forEach(m => console.log(`  - ${m.version}`))
    console.log()

    if (dryRun) {
      log('DRY RUN MODE - no changes will be made\n', 'warning')
    }

    // Run each migration
    for (const migration of pending) {
      await applyMigration(client, migration, dryRun)
    }

    console.log()
    log(dryRun ? 'Dry run complete!' : 'All migrations applied!', 'success')

  } catch (err) {
    console.error('\nMigration failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

async function showStatus() {
  const client = await pool.connect()

  try {
    // Ensure migrations table exists
    await ensureMigrationsTable(client)

    const applied = await getAppliedMigrations(client)
    const available = await getAvailableMigrations()
    const pending = await getPendingMigrations(client)

    console.log('\n=== Migration Status ===\n')

    if (IS_PRODUCTION) {
      log('Environment: PRODUCTION', 'warning')
    } else {
      log('Environment: Development/Demo', 'info')
    }

    console.log(`Database: ${(process.env.DATABASE_URL || 'localhost').split('@')[1] || 'localhost'}\n`)

    if (available.length === 0) {
      log('No migration files found', 'info')
      return
    }

    console.log('Migrations:')
    console.log()

    const appliedMap = new Map(applied.map(m => [m.version, m]))

    for (const migration of available) {
      const record = appliedMap.get(migration.version)

      if (record && !record.rolled_back_at) {
        const date = new Date(record.applied_at).toISOString().split('T')[0]
        console.log(`  ✓ ${migration.version} (applied ${date}, ${record.execution_time_ms}ms)`)
      } else if (record && record.rolled_back_at) {
        const date = new Date(record.rolled_back_at).toISOString().split('T')[0]
        console.log(`  ↩ ${migration.version} (rolled back ${date})`)
      } else {
        console.log(`  ⏳ ${migration.version} (pending)`)
      }
    }

    console.log()
    log(`Total: ${available.length} | Applied: ${applied.filter(m => !m.rolled_back_at).length} | Pending: ${pending.length}`, 'info')
    console.log()

  } catch (err) {
    console.error('Status check failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

async function rollbackLast() {
  const client = await pool.connect()

  try {
    // Safety check for production
    if (IS_PRODUCTION) {
      log('⚠️  PRODUCTION DATABASE DETECTED ⚠️', 'warning')

      const confirmed = await confirm('\nRollback last migration on PRODUCTION? (y/n): ')
      if (!confirmed) {
        log('Cancelled by user', 'info')
        process.exit(0)
      }
      console.log()
    }

    await ensureMigrationsTable(client)

    // Get last applied migration
    const applied = await getAppliedMigrations(client)
    const lastApplied = applied
      .filter(m => !m.rolled_back_at)
      .sort((a, b) => b.version.localeCompare(a.version))[0]

    if (!lastApplied) {
      log('No migrations to roll back', 'info')
      return
    }

    // Find migration file
    const available = await getAvailableMigrations()
    const migration = available.find(m => m.version === lastApplied.version)

    if (!migration) {
      log(`Migration file not found: ${lastApplied.version}`, 'error')
      process.exit(1)
    }

    await rollbackMigration(client, migration)

    console.log()
    log('Rollback complete!', 'success')

  } catch (err) {
    console.error('\nRollback failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

async function createMigration(name) {
  if (!name) {
    log('Please provide a migration name', 'error')
    log('Example: npm run migrate:create -- add_habit_prompts_table', 'info')
    process.exit(1)
  }

  // Ensure migrations directory exists
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true })
  }

  // Generate timestamp-based filename
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14)

  const filename = `${timestamp}_${name}.js`
  const filepath = path.join(MIGRATIONS_DIR, filename)

  // Migration template
  const template = `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */

module.exports = {
  async up(client) {
    // Add your forward migration here
    // Example:
    // await client.query(\`
    //   CREATE TABLE IF NOT EXISTS example (
    //     id SERIAL PRIMARY KEY,
    //     name TEXT NOT NULL
    //   )
    // \`)
  },

  async down(client) {
    // Add your rollback migration here
    // Example:
    // await client.query(\`DROP TABLE IF EXISTS example\`)
  }
}
`

  fs.writeFileSync(filepath, template)

  log(`Created migration: ${filename}`, 'success')
  log(`Edit: ${filepath}`, 'info')
}

// =========================
// CLI Entry Point
// =========================

async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'run'

  try {
    if (command === 'status') {
      await showStatus()
    } else if (command === 'rollback') {
      await rollbackLast()
    } else if (command === 'create') {
      await createMigration(args[1])
    } else if (command === 'run' || command === '--dry-run') {
      const dryRun = command === '--dry-run' || args.includes('--dry-run')
      await runMigrations(dryRun)
    } else {
      console.log('Usage:')
      console.log('  npm run migrate              - Run pending migrations')
      console.log('  npm run migrate:status       - Show migration state')
      console.log('  npm run migrate:rollback     - Rollback last migration')
      console.log('  npm run migrate:create NAME  - Create new migration file')
      console.log('  npm run migrate -- --dry-run - Preview without executing')
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
