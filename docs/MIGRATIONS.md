# Database Migrations Guide

This guide explains how to manage database schema changes for The Shelf using the migration system.

## Table of Contents

1. [Overview](#overview)
2. [Safety Features](#safety-features)
3. [Quick Start](#quick-start)
4. [Commands](#commands)
5. [Creating Migrations](#creating-migrations)
6. [Running Migrations](#running-migrations)
7. [Production Deployments](#production-deployments)
8. [Troubleshooting](#troubleshooting)
9. [Migration Best Practices](#migration-best-practices)

---

## Overview

The migration system provides versioned, trackable database schema changes with built-in safety features to prevent data loss.

**Key Features:**
- Timestamp-based versioning
- Transaction-wrapped migrations (auto-rollback on error)
- Production safety guards (env var + confirmation prompts)
- Rollback support
- Dry-run mode for testing
- Integrated backup workflow

**File Locations:**
- Migration CLI: `backend/api/migrate.js`
- Migration files: `db/migrations/*.js`
- Schema documentation: `db/schema.sql`

---

## Safety Features

### Multi-Layer Protection System

The migration system implements multiple safety layers to protect production data:

#### Layer 1: Environment Variable Guard
Production migrations require the `RUN_MIGRATIONS_ON_PRODUCTION` environment variable:

```bash
# Without env var - BLOCKS execution
DATABASE_URL=$PROD_URL npm run migrate
# Error: ⛔ PRODUCTION DATABASE DETECTED

# With env var - Proceeds to confirmation
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
```

#### Layer 2: Interactive Confirmation
Even with the environment variable, you must confirm:

```
⚠️  PRODUCTION DATABASE DETECTED ⚠️
Database: ep-...neon.tech/neondb

Run migrations on PRODUCTION? (y/n):
```

#### Layer 3: Transaction Wrapping
All migrations run inside transactions. If any query fails, everything rolls back:

```javascript
await client.query('BEGIN')
try {
  await migration.up(client)
  await client.query('COMMIT')  // Only commits if all succeeded
} catch (err) {
  await client.query('ROLLBACK')  // Automatically reverts
  throw err
}
```

#### Layer 4: Existing Database Detection
The initial schema migration detects existing tables and safely skips creation:

```javascript
// No DROP TABLE, no TRUNCATE, no data loss
if (tablesExist) {
  console.log('Tables exist, skipping creation')
  return
}
```

---

## Quick Start

### Check Migration Status

```bash
cd backend/api
npm run migrate:status
```

Output shows applied and pending migrations:
```
=== Migration Status ===

Environment: Development/Demo
Database: localhost

Migrations:
  ✓ 20260124000000_initial_schema (applied 2026-01-24, 12ms)
  ✓ 20260125023705_add_habit_prompts_table (applied 2026-01-25, 27ms)

Total: 2 | Applied: 2 | Pending: 0
```

### Create a New Migration

```bash
npm run migrate:create -- add_new_column
```

This generates: `db/migrations/20260125143022_add_new_column.js`

### Run Pending Migrations

```bash
# Development/Demo
npm run migrate

# Production (requires env var + confirmation)
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
```

---

## Commands

### `npm run migrate:status`

Shows the current state of all migrations.

**Example:**
```bash
npm run migrate:status
```

**Output:**
- ✓ Applied migrations (with date and execution time)
- ↩ Rolled back migrations
- ⏳ Pending migrations

### `npm run migrate`

Runs all pending migrations in order.

**Options:**
```bash
# Standard run
npm run migrate

# Dry run (preview without changes)
npm run migrate -- --dry-run

# Production (requires env var)
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
```

**Output:**
```
Found 1 pending migration(s):
  - 20260125143022_add_new_column

⏳ Applying: 20260125143022_add_new_column
    Creating new_column...
✓   Applied in 15ms

✅ All migrations applied!
```

### `npm run migrate:rollback`

Rolls back the most recently applied migration.

**Example:**
```bash
npm run migrate:rollback
```

**Warning:** Production rollbacks also require confirmation.

### `npm run migrate:create -- <name>`

Creates a new migration file with a timestamp prefix.

**Example:**
```bash
npm run migrate:create -- add_user_preferences
```

**Generated file:** `db/migrations/20260125143022_add_user_preferences.js`

---

## Creating Migrations

### Migration Template

New migrations use this template:

```javascript
/**
 * Migration: migration_name
 * Created: 2026-01-25T14:30:22.000Z
 */

module.exports = {
  async up(client) {
    // Add your forward migration here
    console.log('    Applying migration...')

    await client.query(`
      ALTER TABLE habits
      ADD COLUMN new_field TEXT
    `)
  },

  async down(client) {
    // Add your rollback migration here
    console.log('    Rolling back migration...')

    await client.query(`
      ALTER TABLE habits
      DROP COLUMN new_field
    `)
  }
}
```

### Best Practices for Migrations

#### ✅ DO: Use CREATE TABLE IF NOT EXISTS

```javascript
await client.query(`
  CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  )
`)
```

#### ✅ DO: Use ALTER TABLE ADD COLUMN

```javascript
await client.query(`
  ALTER TABLE habits
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ
`)
```

#### ✅ DO: Create indexes with IF NOT EXISTS

```javascript
await client.query(`
  CREATE INDEX IF NOT EXISTS idx_habits_archived
  ON habits (archived_at)
`)
```

#### ❌ DON'T: Drop tables with data

```javascript
// NEVER do this in a migration
await client.query(`DROP TABLE habits`)
```

#### ❌ DON'T: Delete data by default

```javascript
// NEVER do this without explicit user request
await client.query(`DELETE FROM entries WHERE ...`)
```

#### ❌ DON'T: Use TRUNCATE

```javascript
// NEVER truncate tables
await client.query(`TRUNCATE TABLE habits`)
```

### Migration Naming

Use descriptive names that explain what the migration does:

**Good:**
- `add_habit_prompts_table`
- `add_archived_at_to_habits`
- `create_user_preferences_table`

**Bad:**
- `update_schema`
- `fix_bugs`
- `changes`

---

## Running Migrations

### Development/Demo Database

```bash
cd backend/api

# Check what will run
npm run migrate:status

# Preview changes (dry run)
npm run migrate -- --dry-run

# Apply migrations
npm run migrate
```

### Production Database

**CRITICAL: Always backup before production migrations!**

```bash
cd backend/api

# Step 1: Backup production
DATABASE_URL=$PROD_URL npm run backup

# Step 2: Check migration status
DATABASE_URL=$PROD_URL npm run migrate:status

# Step 3: Preview migrations (dry run)
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate -- --dry-run

# Step 4: Run migrations (with confirmation)
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
# You will be prompted: "Run migrations on PRODUCTION? (y/n):"
# Type 'y' to proceed

# Step 5: Verify production site
# Check: the-shelf-amk.vercel.app

# Step 6: Verify migration status
DATABASE_URL=$PROD_URL npm run migrate:status
```

---

## Production Deployments

### Pre-Deployment Checklist

Before running migrations on production:

- [ ] All migrations tested on demo database
- [ ] Demo site verified working after migrations
- [ ] Production backup created (`npm run backup`)
- [ ] Migration files committed to git
- [ ] Team notified (if applicable)
- [ ] Dry-run completed successfully

### Step-by-Step Production Process

#### 1. Test on Demo First

```bash
# Backup demo
DATABASE_URL=$DEMO_URL npm run backup

# Run migrations
DATABASE_URL=$DEMO_URL npm run migrate

# Verify demo site
# Visit: demo-the-shelf.vercel.app
# Check all features work
```

#### 2. Backup Production

```bash
DATABASE_URL=$PROD_URL npm run backup
```

This creates: `data/backups/backup-YYYY-MM-DD.json`

**Verify backup:**
```bash
ls -lh data/backups/
cat data/backups/backup-$(date +%Y-%m-%d).json | jq '.entries | length'
# Should show: 140 (or your current entry count)
```

#### 3. Run Production Migrations

```bash
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
```

**You will see:**
```
⚠️  PRODUCTION DATABASE DETECTED ⚠️
Database: ep-...neon.tech/neondb

Found 1 pending migration(s):
  - 20260125143022_add_new_column

Run migrations on PRODUCTION? (y/n):
```

Type `y` to proceed.

#### 4. Verify Production

- Visit production site: `the-shelf-amk.vercel.app`
- Check all pages load correctly
- Verify data integrity (entry counts, habit list, etc.)
- Run status check: `DATABASE_URL=$PROD_URL npm run migrate:status`

#### 5. Rollback (If Needed)

If something goes wrong:

```bash
# Rollback last migration
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate:rollback

# Or restore from backup
DATABASE_URL=$PROD_URL npm run restore
# Select the backup from Step 2
```

---

## Troubleshooting

### Migration Fails with Transaction Error

**Problem:** Migration failed mid-execution.

**Solution:** The transaction automatically rolled back. Fix the migration file and re-run:

```bash
# Check what's pending
npm run migrate:status

# Fix the migration file in db/migrations/

# Run again
npm run migrate
```

### "Tables already exist" on Fresh Database

**Problem:** Running migrations on a database that was manually created.

**Solution:** This is expected behavior. The initial migration detects existing tables and safely skips creation. Just verify status:

```bash
npm run migrate:status
# Should show migration as applied
```

### Production Block: "RUN_MIGRATIONS_ON_PRODUCTION required"

**Problem:** Trying to run migrations on production without env var.

**Solution:** This is intentional protection. Add the environment variable:

```bash
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
```

### Can't Re-Apply After Rollback

**Problem:** This should work. If it doesn't, check:

```bash
# Verify migration was marked as rolled back
npm run migrate:status

# The rolled-back migration should show: ↩ (rolled back)
# It should be in the pending list
```

If the migration doesn't show as pending, check the `schema_migrations` table directly.

### Duplicate Key Error on Re-Apply

**Problem:** This was a bug in earlier versions. The current version uses `ON CONFLICT` to handle re-applies.

**Solution:** Update to the latest `migrate.js` from the repository.

---

## Migration Best Practices

### Schema Changes

1. **Always use IF NOT EXISTS for creates:**
   ```javascript
   CREATE TABLE IF NOT EXISTS ...
   CREATE INDEX IF NOT EXISTS ...
   ```

2. **Never drop tables with user data:**
   - migrations, closures, preparations, reflections
   - entries (most critical)
   - habits, practices, actions, targets

3. **Add columns, don't modify existing ones:**
   ```javascript
   // Good: Add new column
   ALTER TABLE habits ADD COLUMN archived_at TIMESTAMPTZ

   // Bad: Modify existing column (can lose data)
   ALTER TABLE habits ALTER COLUMN name TYPE VARCHAR(255)
   ```

4. **Use sensible defaults for new columns:**
   ```javascript
   ALTER TABLE habits
   ADD COLUMN enabled BOOLEAN DEFAULT true
   ```

### Data Migrations

If you need to migrate data (rare), document thoroughly:

```javascript
module.exports = {
  async up(client) {
    console.log('    Migrating habit colors...')

    // Add new column
    await client.query(`
      ALTER TABLE habits
      ADD COLUMN color_code TEXT DEFAULT '#8B9A7E'
    `)

    // Migrate data (if needed)
    await client.query(`
      UPDATE habits
      SET color_code = CASE
        WHEN color = 'sage' THEN '#8B9A7E'
        WHEN color = 'blue' THEN '#6B9BD1'
        ELSE '#8B9A7E'
      END
    `)

    console.log('    Migration complete')
  },

  async down(client) {
    await client.query(`
      ALTER TABLE habits DROP COLUMN color_code
    `)
  }
}
```

### Testing

1. **Test on demo first:** Always test migrations on demo database before production
2. **Use dry-run mode:** Preview migrations with `--dry-run` flag
3. **Verify rollback:** Test that `down()` function correctly reverses `up()`
4. **Check constraints:** Ensure new columns/tables don't break existing queries

### Git Workflow

1. **Commit migration files:** Always commit migration files to git
2. **Include in PR:** Migration files should be part of feature PRs
3. **Document changes:** Update schema.sql to reflect current state
4. **Tag releases:** Tag releases that include schema changes

---

## Schema Migrations Table

The `schema_migrations` table tracks which migrations have been applied:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL UNIQUE,           -- Migration filename (without .js)
  applied_at TIMESTAMPTZ DEFAULT NOW(),   -- When it was applied
  execution_time_ms INT,                  -- How long it took
  rolled_back_at TIMESTAMPTZ              -- NULL if active, timestamp if rolled back
)
```

**Example data:**
```
id | version                              | applied_at           | execution_time_ms | rolled_back_at
---+--------------------------------------+----------------------+-------------------+----------------
 1 | 20260124000000_initial_schema        | 2026-01-24 00:00:00  | 12                | NULL
 2 | 20260125023705_add_habit_prompts     | 2026-01-25 02:37:05  | 27                | NULL
```

**Never modify this table manually.** Use the migration CLI commands.

---

## Environment Detection

The migration system detects production databases by checking if `DATABASE_URL` contains `neon.tech`:

```javascript
const IS_PRODUCTION = (process.env.DATABASE_URL || '').includes('neon.tech')
```

**Environments:**
- **Production:** `DATABASE_URL` contains `neon.tech` → Safety guards enabled
- **Demo:** `DATABASE_URL` points to Neon demo database → No safety guards
- **Development:** `DATABASE_URL` points to `localhost` → No safety guards

---

## Related Documentation

- [INSTRUCTIONS.md](./INSTRUCTIONS.md) - General development guide
- [OPS.md](./OPS.md) - Operations and deployment
- [BACKLOG.md](./BACKLOG.md) - Feature tracking (SHELF-008)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify your migration file syntax
3. Test with `--dry-run` first
4. Check `npm run migrate:status` for current state
5. Review migration execution output for errors

**Emergency Rollback:**
```bash
# Immediate rollback
npm run migrate:rollback

# Or restore from backup
npm run restore
```
