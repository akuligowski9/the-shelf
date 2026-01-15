-- db/schema.sql
-- The Shelf (single-user) - Postgres schema
-- Matches frontend data model from mockData.js and data-model.md

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- updated_at helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- habits
-- =========================
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  target_minutes INT NOT NULL DEFAULT 60,
  color TEXT NOT NULL DEFAULT 'sage',
  track_actions BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_habits_updated_at ON habits;
CREATE TRIGGER trg_habits_updated_at
BEFORE UPDATE ON habits
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- practices (ways to express a habit)
-- =========================
CREATE TABLE IF NOT EXISTS practices (
  id SERIAL PRIMARY KEY,
  habit_id INT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  details TEXT,
  sort_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, name)
);

DROP TRIGGER IF EXISTS trg_practices_updated_at ON practices;
CREATE TRIGGER trg_practices_updated_at
BEFORE UPDATE ON practices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- actions (granular tracking within a practice session)
-- =========================
CREATE TABLE IF NOT EXISTS actions (
  id SERIAL PRIMARY KEY,
  practice_id INT NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (practice_id, name)
);

DROP TRIGGER IF EXISTS trg_actions_updated_at ON actions;
CREATE TRIGGER trg_actions_updated_at
BEFORE UPDATE ON actions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- targets (projects / milestones / ideas)
-- =========================
CREATE TABLE IF NOT EXISTS targets (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'project' CHECK (type IN ('project', 'milestone', 'idea')),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('active', 'parked', 'planned', 'completed', 'archived')),
  habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  planned_duration TEXT,
  done_at DATE,
  sort_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

DROP TRIGGER IF EXISTS trg_targets_updated_at ON targets;
CREATE TRIGGER trg_targets_updated_at
BEFORE UPDATE ON targets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- entries (canonical ledger)
-- =========================
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('habit', 'life', 'caution')),
  occurred_at TIMESTAMPTZ NOT NULL,
  habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
  practice_id INT REFERENCES practices(id) ON DELETE SET NULL,
  target_id INT REFERENCES targets(id) ON DELETE SET NULL,
  duration_minutes INT,
  note TEXT,
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
);

CREATE INDEX IF NOT EXISTS idx_entries_occurred_at ON entries (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_habit_id ON entries (habit_id);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries (type);

DROP TRIGGER IF EXISTS trg_entries_updated_at ON entries;
CREATE TRIGGER trg_entries_updated_at
BEFORE UPDATE ON entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- preparations (daily/weekly framing)
-- =========================
CREATE TABLE IF NOT EXISTS preparations (
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
);

DROP TRIGGER IF EXISTS trg_preparations_updated_at ON preparations;
CREATE TRIGGER trg_preparations_updated_at
BEFORE UPDATE ON preparations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- closures (end of day/session markers)
-- =========================
CREATE TABLE IF NOT EXISTS closures (
  id SERIAL PRIMARY KEY,
  scope TEXT NOT NULL DEFAULT 'day' CHECK (scope IN ('day', 'session')),
  occurred_at TIMESTAMPTZ NOT NULL,
  habit_id INT REFERENCES habits(id) ON DELETE SET NULL,
  practice_id INT REFERENCES practices(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_closures_occurred_at ON closures (occurred_at DESC);

DROP TRIGGER IF EXISTS trg_closures_updated_at ON closures;
CREATE TRIGGER trg_closures_updated_at
BEFORE UPDATE ON closures
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- reflections
-- =========================
CREATE TABLE IF NOT EXISTS reflections (
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
);

DROP TRIGGER IF EXISTS trg_reflections_updated_at ON reflections;
CREATE TRIGGER trg_reflections_updated_at
BEFORE UPDATE ON reflections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- settings (key/value JSON)
-- =========================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
