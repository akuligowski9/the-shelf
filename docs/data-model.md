# The Shelf — Data Model (Single User)

This project is a personal attention and life-balance companion.
The system is **single-tenant** (no users table). **Entries are the source of truth**, and the system also supports **stored daily metrics** for Screen Time–style visualization.

> Note: Metrics can be derived from entries, but the product intends to **persist daily aggregates** to make charting fast, stable, and easy to query.

---

## Core principles

- **Entries are the canonical ledger** of what happened.
- **Targets unify** projects, milestones, and ideas.
- **Programs are removed** as a noun/entity. Time-boxing is handled directly on **Targets** (planned/active via date window).
- **Parking Lot is a status**, not a separate entity: `targets.status = 'parked'`.
- **Habits and Practices** are separate: habits define attention categories; practices define ways to fulfill them.
- **Entry types are first-class**: habits, life events, caution behaviors, and transitions are tracked as peer signals.
- **Highlights** are celebration flags on entries: `entries.is_highlight`.
- **Reflections** are stored artifacts over a time range (daily/weekly/monthly/ad-hoc).
- **Preparations** are stored framing notes used at start-of-day/week.
- **Metrics are Screen Time–style**: daily time distribution + overlays (counts) for caution behaviors and transitions.
- **Settings** are flexible key/value JSON configuration.

---

## Canonical definitions (domain language)

- **Habit**: a recurring category of attention (Software, Spanish, Exercise).
- **Practice**: a way to fulfill a habit (Walking, Conversations, Textbook).
- **Target**: the thing you’re working on (project / milestone / idea); may be unscheduled, planned, active, parked, done, archived.
- **Preparation**: soft framing note (day/week).
- **Entry**: logged event (what happened).
- **Highlight**: celebratory flag on an entry.
- **Reflection**: stored narrative interpretation over a time range.
- **Parking Lot**: targets (and other future items) that are intentionally inactive.

---

## Entities

### Habits
Balancing pillars (e.g., Software, Spanish, Exercise).

Fields / behavior:
- `target_minutes` (default 60)
- `active` flag
- optional warm-up / cool-down prompts (habit-level)
- owns a set of practices

---

### Practices
Concrete ways to fulfill a habit (e.g., Walking, Personal Project Development, Conversations).

Fields / behavior:
- belongs to exactly one habit
- may be active/inactive over time
- reused across entries to standardize reporting and charting

---

### Targets
Anything that can receive focus and appear “on the shelf.”

Targets unify:
- projects
- milestones
- ideas

Targets have **status**:
- `active`
- `parked` (parking lot)
- `done`
- `archived`

Targets also support **optional scheduling**:
- `start_date` (nullable)
- `end_date` (nullable)

Time-boxing semantics:
- **Planned**: `start_date` and/or `end_date` is set and the window is in the future
- **Active (scheduled)**: today is inside `[start_date, end_date]`
- **On the shelf (unscheduled)**: no dates set (but still can be status=active or parked)

Targets can optionally relate to:
- a habit (e.g., Spanish)
- a default practice (optional convenience)
- or neither (some targets are life/admin/etc.)

---

### Entries (canonical ledger)
The main event stream of what happened.

Entries are typed, because context matters.

#### Entry types
- `habit` — practice under a habit
- `life` — life context (family, travel, social)
- `caution` — caution behavior (tracked for awareness)
- `transition` — structural change marker

Key fields:
- `type`: `habit` | `life` | `caution` | `transition`
- `occurred_on`: date (day-level grouping)
- `occurred_at`: timestamp (optional)
- `habit_id`: nullable; required for `type=habit`
- `practice_id`: nullable; usually present for `type=habit`, optional for others
- `target_id`: nullable; optional link for context/focus
- `duration_minutes`: nullable (time-based when available)
- `note`: nullable free text
- `is_highlight`: boolean (celebration)
- `source`: `manual` | `import` | `auto`

Semantics:
- Habits are primarily **time-based** (minutes)
- Life events may be time-based or note-only
- Caution behaviors are often **occurrence-based** (duration optional)
- Transitions are typically **occurrence-based** (duration usually null)

---

### Preparations
Soft framing notes for a day or week (start-of-day/week intention).

Fields / behavior:
- `period_type`: `day` | `week`
- `period_start`: date
- `note`: text
- optional linkage: `target_id` (what matters), optional `habit_id`

---

### Reflections
Stored narrative artifacts used to interpret metrics and patterns.

Fields / behavior:
- `reflection_type`: `day` | `week` | `month` | `adhoc`
- `period_start` / `period_end` (required for week/month; optional for adhoc)
- optional linkage: `target_id`, `habit_id`
- text fields (prompt responses, closing note, context)

---

### Habit Prompts (Warm-ups & Cool-downs)
Habit-level prompts for framing and closure.

Fields / behavior:
- `habit_id`
- `prompt_type`: `warmup` | `cooldown`
- `prompt_text`
- optional active flag / ordering

Prompt responses:
- can be stored as **entries** (`type=habit` or `type=transition`) with notes
- or stored as reflections (depending on UI flow)

---

### Settings
Flexible key/value JSON config for preferences and defaults.

Examples:
- default habit duration presets
- preferred reflection cadence
- UI flags (show totals, default overlays)
- charting preferences (stack order, grouping rules)

---

### Daily Metrics (stored)
To support Screen Time–style charts, the system persists daily aggregates.

**Why store these?**
- fast chart loads
- stable historical view even if raw entries are edited
- simplified queries for weekly/monthly/yearly summaries

Two layers:

#### 1) `daily_metrics`
One row per day.
- `date`
- optional high-level totals (total minutes logged, etc.)

#### 2) `daily_metric_items`
Breakdown rows per day per “bucket.”
Buckets represent peer signals:
- Habit buckets (time-based): minutes per habit
- Life buckets (time-based when available): minutes per life practice/category
- Caution buckets (occurrence-based): count per caution behavior
- Transition buckets (occurrence-based): count per transition type

Suggested shape:
- `date`
- `bucket_type`: `habit` | `life` | `caution` | `transition`
- `bucket_id`: nullable (habit_id for habit; practice_id for habit/life if used; or a text key for caution/transition subtype)
- `minutes`: nullable
- `count`: nullable

> This supports stacked bars (minutes) and overlays (count markers) in one consistent model.

---

## Derived data (still useful even with stored metrics)

Even if daily metrics are stored, some views can still be derived:

- “Last touched” for a target can be derived from the latest entry referencing that target.
- Accomplishments views can be derived from:
  - entries where `is_highlight = true`
  - targets where `status = done`
  - notable life entries
- Balance commentary can be derived from reflections + transitions.

---

## Table list (updated)

Core:
- `habits`
- `practices`
- `habit_prompts`
- `targets`
- `entries`
- `reflections`
- `preparations`
- `settings`

Metrics (stored):
- `daily_metrics`
- `daily_metric_items`

> Note: “Parking Lot” is not a table; it is `targets.status = 'parked'`.
> Note: “Programs” table removed; time-boxing is handled on `targets` via start/end dates.
