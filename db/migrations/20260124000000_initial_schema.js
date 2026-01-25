/**
 * Migration: Initial Schema
 * Created: 2026-01-24T00:00:00.000Z
 *
 * This migration creates the base schema for The Shelf application.
 * It safely skips creation if tables already exist (no data loss).
 */

module.exports = {
  async up(client) {
    // Check if core tables already exist
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'habits'
      ) as exists
    `)

    if (result.rows[0].exists) {
      console.log('    Tables already exist, skipping schema creation (safe mode)')
      return
    }

    console.log('    Creating initial schema...')

    // Enable UUID generation
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)

    // updated_at helper function
    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    // habits table
    await client.query(`
      CREATE TABLE habits (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL DEFAULT 'habit' CHECK (type IN ('habit', 'caution')),
        active BOOLEAN NOT NULL DEFAULT TRUE,
        target_minutes INT NOT NULL DEFAULT 60,
        color TEXT NOT NULL DEFAULT 'sage',
        track_actions BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TRIGGER trg_habits_updated_at
      BEFORE UPDATE ON habits
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // practices table
    await client.query(`
      CREATE TABLE practices (
        id SERIAL PRIMARY KEY,
        habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        details TEXT,
        sort_order INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (habit_id, name)
      )
    `)

    await client.query(`
      CREATE TRIGGER trg_practices_updated_at
      BEFORE UPDATE ON practices
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // actions table
    await client.query(`
      CREATE TABLE actions (
        id SERIAL PRIMARY KEY,
        practice_id INT NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (practice_id, name)
      )
    `)

    await client.query(`
      CREATE TRIGGER trg_actions_updated_at
      BEFORE UPDATE ON actions
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // targets table
    await client.query(`
      CREATE TABLE targets (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL DEFAULT 'project' CHECK (type IN ('project', 'milestone', 'idea')),
        name TEXT NOT NULL,
        description TEXT,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('active', 'parked', 'planned', 'completed', 'archived')),
        habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
        start_date DATE,
        end_date DATE,
        planned_duration TEXT,
        done_at DATE,
        sort_order INT,
        github_issue_url TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
      )
    `)

    await client.query(`
      CREATE TRIGGER trg_targets_updated_at
      BEFORE UPDATE ON targets
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // habit_transitions table
    await client.query(`
      CREATE TABLE habit_transitions (
        id SERIAL PRIMARY KEY,
        started_at TIMESTAMPTZ NOT NULL,
        ended_at TIMESTAMPTZ NOT NULL,
        note TEXT,
        changes JSONB NOT NULL DEFAULT '[]',
        cascades JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX idx_habit_transitions_ended_at
      ON habit_transitions (ended_at DESC)
    `)

    // entries table
    await client.query(`
      CREATE TABLE entries (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('habit', 'life', 'caution')),
        occurred_at TIMESTAMPTZ NOT NULL,
        habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
        practice_id INT REFERENCES practices(id) ON DELETE SET NULL,
        target_id INT REFERENCES targets(id) ON DELETE SET NULL,
        duration_minutes INT,
        note TEXT,
        actions JSONB,
        is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
        source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'auto')),
        warm_up_note TEXT,
        cool_down_note TEXT,
        archived_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
        CHECK (
          (type = 'habit' AND habit_id IS NOT NULL)
          OR (type IN ('life', 'caution'))
        )
      )
    `)

    await client.query(`
      CREATE INDEX idx_entries_occurred_at ON entries (occurred_at DESC)
    `)
    await client.query(`
      CREATE INDEX idx_entries_habit_id ON entries (habit_id)
    `)
    await client.query(`
      CREATE INDEX idx_entries_type ON entries (type)
    `)

    await client.query(`
      CREATE TRIGGER trg_entries_updated_at
      BEFORE UPDATE ON entries
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // preparations table
    await client.query(`
      CREATE TABLE preparations (
        id SERIAL PRIMARY KEY,
        period_type TEXT NOT NULL DEFAULT 'day' CHECK (period_type IN ('day', 'week')),
        period_start DATE NOT NULL,
        note TEXT,
        habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
        target_id INT REFERENCES targets(id) ON DELETE SET NULL,
        rest_day BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (period_type, period_start)
      )
    `)

    await client.query(`
      CREATE TRIGGER trg_preparations_updated_at
      BEFORE UPDATE ON preparations
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // closures table
    await client.query(`
      CREATE TABLE closures (
        id SERIAL PRIMARY KEY,
        scope TEXT NOT NULL DEFAULT 'day' CHECK (scope IN ('day', 'session')),
        occurred_at TIMESTAMPTZ NOT NULL,
        habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
        practice_id INT REFERENCES practices(id) ON DELETE SET NULL,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX idx_closures_occurred_at ON closures (occurred_at DESC)
    `)

    await client.query(`
      CREATE TRIGGER trg_closures_updated_at
      BEFORE UPDATE ON closures
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // reflections table
    await client.query(`
      CREATE TABLE reflections (
        id SERIAL PRIMARY KEY,
        reflection_type TEXT NOT NULL DEFAULT 'weekly' CHECK (reflection_type IN ('day', 'weekly', 'monthly', 'habit', 'entry', 'target', 'adhoc')),
        period_start DATE,
        period_end DATE,
        habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
        target_id INT REFERENCES targets(id) ON DELETE SET NULL,
        entry_id INT REFERENCES entries(id) ON DELETE SET NULL,
        note TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CHECK (
          reflection_type = 'adhoc'
          OR reflection_type = 'entry'
          OR (period_start IS NOT NULL AND period_end IS NOT NULL AND period_end >= period_start)
        )
      )
    `)

    await client.query(`
      CREATE TRIGGER trg_reflections_updated_at
      BEFORE UPDATE ON reflections
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
    `)

    // settings table
    await client.query(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // mutation_logs table
    await client.query(`
      CREATE TABLE mutation_logs (
        id SERIAL PRIMARY KEY,
        method TEXT NOT NULL,
        path TEXT NOT NULL,
        status INT NOT NULL,
        duration_ms INT,
        body JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX idx_mutation_logs_created_at ON mutation_logs (created_at DESC)
    `)
    await client.query(`
      CREATE INDEX idx_mutation_logs_path ON mutation_logs (path)
    `)

    console.log('    Initial schema created successfully')
  },

  async down(client) {
    // Drop all tables in reverse order (respecting foreign keys)
    console.log('    Rolling back initial schema...')

    const tables = [
      'mutation_logs',
      'reflections',
      'closures',
      'preparations',
      'entries',
      'habit_transitions',
      'targets',
      'actions',
      'practices',
      'habits',
      'settings'
    ]

    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`)
    }

    await client.query(`DROP FUNCTION IF EXISTS set_updated_at() CASCADE`)

    console.log('    Initial schema rolled back')
  }
}
