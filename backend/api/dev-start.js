#!/usr/bin/env node
/**
 * Development startup script
 *
 * Automatically restores from latest backup before starting the dev server.
 * Skips restore if:
 *   - No backup files exist
 *   - SKIP_RESTORE=true is set
 *   - Local database already has data and backup hasn't changed
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

const BACKUP_DIR = path.join(__dirname, '..', '..', 'data', 'backups')
const LAST_RESTORE_FILE = path.join(__dirname, '.last-restore')

async function shouldRestore() {
  // Skip if explicitly disabled
  if (process.env.SKIP_RESTORE === 'true') {
    console.log('⏭️  SKIP_RESTORE=true, skipping restore\n')
    return false
  }

  // Find latest backup
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('⏭️  No backup directory found, skipping restore\n')
    return false
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
    .sort()
    .reverse()

  if (backups.length === 0) {
    console.log('⏭️  No backup files found, skipping restore\n')
    return false
  }

  const latestBackup = backups[0]
  const backupPath = path.join(BACKUP_DIR, latestBackup)
  const backupStat = fs.statSync(backupPath)

  // Check if we already restored this backup
  if (fs.existsSync(LAST_RESTORE_FILE)) {
    const lastRestore = fs.readFileSync(LAST_RESTORE_FILE, 'utf8').trim()
    if (lastRestore === `${latestBackup}:${backupStat.mtime.toISOString()}`) {
      console.log(`⏭️  Already restored ${latestBackup}, skipping\n`)
      return false
    }
  }

  // Check if local DB has data
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
  })

  try {
    const result = await pool.query('SELECT COUNT(*) FROM habits')
    const habitCount = parseInt(result.rows[0].count)

    if (habitCount > 0) {
      console.log(`📊 Local DB has ${habitCount} habits`)
      console.log(`📦 New backup available: ${latestBackup}`)
      console.log('🔄 Restoring to sync with production...\n')
    } else {
      console.log(`📦 Local DB empty, restoring from ${latestBackup}...\n`)
    }

    return { backup: latestBackup, mtime: backupStat.mtime.toISOString() }
  } catch (err) {
    // DB might not exist yet
    console.log(`📦 Restoring from ${latestBackup}...\n`)
    return { backup: latestBackup, mtime: backupStat.mtime.toISOString() }
  } finally {
    await pool.end()
  }
}

async function main() {
  console.log('🚀 The Shelf - Development Server\n')

  const restoreInfo = await shouldRestore()

  if (restoreInfo) {
    try {
      // Run restore non-interactively by piping 'y' to confirm
      execSync('echo y | node restore.js', {
        stdio: 'inherit',
        cwd: __dirname
      })

      // Record successful restore
      fs.writeFileSync(LAST_RESTORE_FILE, `${restoreInfo.backup}:${restoreInfo.mtime}`)
      console.log('')
    } catch (err) {
      console.error('⚠️  Restore failed, continuing with existing data\n')
    }
  }

  // Start nodemon
  console.log('Starting development server...\n')
  const nodemon = spawn('npx', ['nodemon', 'index.js'], {
    stdio: 'inherit',
    cwd: __dirname
  })

  nodemon.on('close', code => process.exit(code))
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
