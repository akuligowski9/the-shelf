#!/usr/bin/env node
/**
 * Backup Script - exports all database data to JSON
 *
 * Run manually: node backup.js
 * Run via npm: npm run backup
 *
 * Creates: data/backups/backup-YYYY-MM-DD.json
 * Keeps: 30 days of backups (older ones are deleted)
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://shelf:shelf@localhost:5432/shelf'
})

const BACKUP_DIR = path.join(__dirname, '..', '..', 'data', 'backups')
const RETENTION_DAYS = 30

async function backup() {
  const client = await pool.connect()

  try {
    console.log('Starting backup...\n')

    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true })
    }

    // Export all tables (with their sort columns)
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
    ]

    const data = {
      exported_at: new Date().toISOString(),
      version: '1.0'
    }

    for (const table of tables) {
      const result = await client.query(`SELECT * FROM ${table.name} ORDER BY ${table.orderBy}`)
      data[table.name] = result.rows
      console.log(`  ${table.name}: ${result.rows.length} rows`)
    }

    // Write backup file
    const date = new Date().toISOString().split('T')[0]
    const filename = `backup-${date}.json`
    const filepath = path.join(BACKUP_DIR, filename)

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2))
    console.log(`\nBackup saved: ${filepath}`)

    // Count totals
    const totalRows = tables.reduce((sum, t) => sum + data[t].length, 0)
    console.log(`Total rows backed up: ${totalRows}`)

    // Clean up old backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse()

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)

    let deleted = 0
    for (const file of files) {
      const dateMatch = file.match(/backup-(\d{4}-\d{2}-\d{2})\.json/)
      if (dateMatch) {
        const fileDate = new Date(dateMatch[1])
        if (fileDate < cutoffDate) {
          fs.unlinkSync(path.join(BACKUP_DIR, file))
          deleted++
        }
      }
    }

    if (deleted > 0) {
      console.log(`Cleaned up ${deleted} old backup(s)`)
    }

    console.log('\nBackup complete!')

  } catch (err) {
    console.error('Backup failed:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

backup().catch(err => {
  console.error(err)
  process.exit(1)
})
