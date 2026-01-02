-- db/schema.sql
-- The Shelf (single-user) - Postgres schema
-- Source of truth for: habits, targets, programs, entries, reflections, preparations, settings

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  target_minutes INT NOT NULL DEFAULT 60,
  active BOOLEAN NOT NULL DEFAULT TRUE,
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
-- habit_prompts
-- =========================
CREATE TABLE IF NOT EXISTS habit_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('warmup', 'cooldown')),
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_habit_prompts_updated_at ON habit_prompts;
CREATE TRIGGER trg_habit_prompts_updated_at
BEFORE UPDATE ON habit_prompts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- targets (projects / milestones / ideas)
-- =========================
CREATE TABLE IF NOT EXISTS targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('project', 'milestone', 'idea')),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'parked', 'planned', 'done', 'archived')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (type, name)
);

DROP TRIGGER IF EXISTS trg_targets_updated_at ON targets;
CREATE TRIGGER trg_targets_updated_at
BEFORE UPDATE ON targets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- programs (time-boxed focus blocks)
-- =========================
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE NOT NULL,
  end_date DATE,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  target_id UUID REFERENCES targets(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

DROP TRIGGER IF EXISTS trg_programs_updated_at ON programs;
CREATE TRIGGER trg_programs_updated_at
BEFORE UPDATE ON programs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- entries (canonical ledger)
-- =========================
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('habit', 'life')),
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  practice TEXT NOT NULL,
  note TEXT,
  duration_minutes INT,
  target_id UUID REFERENCES targets(id) ON DELETE SET NULL,
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
  is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  -- Enforce your rule:
  CHECK (
    (type = 'habit' AND habit_id IS NOT NULL)
    OR
    (type = 'life' AND habit_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_entries_occurred_at ON entries (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_habit_id ON entries (habit_id);
CREATE INDEX IF NOT EXISTS idx_entries_target_id ON entries (target_id);
CREATE INDEX IF NOT EXISTS idx_entries_program_id ON entries (program_id);
CREATE INDEX IF NOT EXISTS idx_entries_is_highlight ON entries (is_highlight);

DROP TRIGGER IF EXISTS trg_entries_updated_at ON entries;
CREATE TRIGGER trg_entries_updated_at
BEFORE UPDATE ON entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- reflections
-- =========================
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'ad_hoc')),
  period_start DATE,
  period_end DATE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    type = 'ad_hoc'
    OR (period_start IS NOT NULL AND period_end IS NOT NULL AND period_end >= period_start)
  )
);

DROP TRIGGER IF EXISTS trg_reflections_updated_at ON reflections;
CREATE TRIGGER trg_reflections_updated_at
BEFORE UPDATE ON reflections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- preparations (daily/weekly framing)
-- =========================
CREATE TABLE IF NOT EXISTS preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL CHECK (period_type IN ('day', 'week')),
  period_start DATE NOT NULL,
  note TEXT NOT NULL,
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
-- settings (key/value JSON)
-- =========================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
