# The Shelf — Data Model (Single User)

This project is a personal attention and life-balance companion.

The system is **single-tenant** (no users table).  
**Entries are the canonical source of truth**, and the system also supports **stored daily metrics** to enable fast, stable, Screen Time–style visualizations.

> Metrics can be derived from entries, but the product intentionally **persists daily aggregates** to make long-range charting fast, resilient to edits, and easy to query.

The primary goal of the data model is **long-term memory preservation**:  
data recorded in 2026 should still be explorable and meaningful in 2028 and beyond.

---

## Core principles

- **Entries are the canonical ledger** of what happened.
- **Targets unify** projects, milestones, and ideas.
- **Programs are removed** as a noun/entity; time-boxing lives directly on **Targets**.
- **Parking Lot is a status**, not a separate entity: `targets.status = 'parked'`.
- **Habits and Practices are distinct**:
  - habits define *domains of attention*
  - practices define *ways attention is expressed*
- **Metrics are descriptive**, not evaluative.
- **History is never destroyed**:
  - archival removes items from active views
  - archival never removes data from metrics
- **Rest days are valid data**, not gaps.
- **Transitions are structural events**, not effort events.
- **The system must support demo / sample data** for portfolio presentation.

---

## Canonical definitions (domain language)

- **Habit**  
  A recurring domain of attention (e.g., Software, Spanish, Exercise).

- **Practice**  
  A concrete way to fulfill a habit (e.g., Walking, Conversations, Personal Project Development).

- **Target**  
  The thing you are working toward (project, milestone, idea).  
  Targets give *direction*, not obligation.

- **Preparation**  
  A soft framing note used to start a day or week intentionally.

- **Closure**  
  An intentional stopping marker used to end a day or session.

- **Entry**  
  A logged event representing what actually happened.

- **Highlight**  
  A celebratory flag on an entry.

- **Reflection**  
  A stored narrative artifact interpreting patterns over a time range.

- **Transition Window**  
  An intentional period where the set of active habits is adjusted.

- **Parking Lot**  
  Inactive targets held intentionally for later attention.

---

## Entities

### Habits

Habits represent long-running pillars of attention.

Examples:
- Software
- Spanish
- Exercise
- Dog Training

Fields / behavior:
- `id`
- `name`
- `active` (boolean)
- `target_minutes` (default framing value; not a requirement)
- `sort_order`
- timestamps

Notes:
- Activating or deactivating a habit **may trigger a transition window**
- Editing habit metadata does **not** trigger a transition
- Habits persist historically even when inactive

---

### Practices

Practices are concrete expressions of a habit.

Examples:
- Exercise → Walking
- Software → Open Source
- Spanish → Conversation

Fields / behavior:
- `id`
- `habit_id` (FK)
- `name`
- `active` (boolean)
- `sort_order`
- timestamps

Notes:
- Practices are normalized to avoid duplication
- Practices can be inactive (hidden from selection) without deleting history
- Practices enable sub-habit pattern analysis in metrics

---

### Targets

Targets unify projects, milestones, and ideas.

Targets have **status**:
- `active`
- `parked` (parking lot)
- `planned`
- `done`
- `archived`

Targets support **optional scheduling**:
- `start_date` (nullable)
- `end_date` (nullable)
- `done_at` (nullable)

Time-boxing semantics:
- **Planned**: date window exists and is in the future
- **Active (scheduled)**: today is inside `[start_date, end_date]`
- **On the shelf (unscheduled)**: no dates set
- **Done / Archived**: removed from current attention regardless of dates

Targets may optionally relate to:
- a habit
- a default practice
- or neither (life/admin targets)

Targets may overlap freely.

---

### Entries (Canonical Ledger)

Entries are the primary record of what happened.

Entries are **appendable, editable, and archivable** — never hard-deleted.

#### Entry types
- `habit`
- `life`
- `caution`

> **Note:** Transitions are no longer an entry type.  
> They are tracked separately as structural events.

Key fields:
- `id`
- `type`: `habit` | `life` | `caution`
- `occurred_on`: date (day-level grouping)
- `occurred_at`: timestamp (stored in EST)
- `habit_id`: nullable; required for `type=habit`
- `practice_id`: nullable; encouraged for `type=habit`
- `target_id`: nullable
- `duration_minutes`: nullable (valid for habit and life)
- `note`: nullable text
- `is_highlight`: boolean
- `source`: `manual` | `import` | `auto`
- `archived_at`: nullable
- timestamps

Semantics:
- Habit entries are primarily time-based
- Life entries may be time-based or note-only
- Caution entries are usually occurrence-based
- Entries power all metrics and review surfaces

---

### Preparations

Preparations are soft framing notes.

Fields / behavior:
- `id`
- `period_type`: `day` | `week`
- `period_start`: date
- `note`
- optional `habit_id`
- optional `target_id`
- optional `rest_day` boolean
- timestamp

Notes:
- Preparations do not invalidate rest days
- Counts of preparations are meaningful metrics

---

### Closures

Closures represent intentional stopping.

Fields / behavior:
- `id`
- `scope`: `day` | `session`
- `occurred_at`
- optional `habit_id`
- optional `practice_id`
- `note`
- timestamp

Notes:
- Closures support end-of-day hygiene
- Closure counts are tracked as metrics
- Closures help retrieve “last session context” per habit/practice

---

### Reflections

Reflections are macro sense-making artifacts.

Fields / behavior:
- `id`
- `reflection_type`: `day` | `week` | `month` | `adhoc`
- `period_start` / `period_end` (required for week/month)
- optional `habit_id`
- optional `target_id`
- `note`
- timestamp

Notes:
- Reflections are never required
- Reflections are never auto-generated
- Reflections may reference metrics, transitions, or decisions

---

### Habit Prompts (Optional)

Habit-level prompts used to assist framing or closure.

Fields / behavior:
- `habit_id`
- `prompt_type`: `warmup` | `cooldown`
- `prompt_text`
- optional active flag
- sort order

Notes:
- Prompt responses are **not** stored separately
- Responses may be captured via preparations, closures, or reflections

---

### Habit Transitions (Transition Windows)

Transitions track **changes to the active habit set**.

Fields:
- `id`
- `started_at`
- `ended_at`
- `note` (optional)
- timestamp

Rules:
- A transition window may contain multiple habit activations/deactivations
- One window = one transition event for metrics
- Transition windows explain balance shifts over time

---

### Settings

Flexible key/value configuration.

Fields:
- `key`
- `value` (JSON)
- timestamp

Examples:
- timezone
- default habit durations
- chart preferences
- import behavior flags
- UI display toggles

---

## Daily Metrics (Stored)

To support Screen Time–style charts, the system persists daily aggregates.

### Why store daily metrics?

- Fast chart rendering
- Stable historical views
- Simplified weekly/monthly/yearly queries
- Insulation from entry edits

### Metric layers

#### 1) `daily_metrics`
One row per calendar day.
- `date`
- `is_rest_day` (boolean)
- optional totals (e.g. total minutes)

#### 2) `daily_metric_items`
Breakdown rows per day per bucket.

Buckets represent peer signals:
- Habit buckets (time-based)
- Practice buckets (time-based)
- Life buckets (time-based)
- Caution buckets (occurrence-based)
- Transition buckets (occurrence-based)
- Preparation / closure counts

Suggested fields:
- `date`
- `bucket_type`: `habit` | `practice` | `life` | `caution` | `transition` | `prep` | `closure`
- `bucket_id`: nullable (FK or text key)
- `minutes`: nullable
- `count`: nullable

This supports stacked bars with overlay markers.

---

## Derived Data (Still Used)

Even with stored metrics, some views remain derived:

- “Last touched” timestamps
- Accomplishments summaries
- Review context assembly
- Balance commentary tied to reflections

Derived data is computed dynamically or via materialized views.

---

## Demo / Showcase Data

The system should support **demo data mode** for portfolio visitors.

Demo data goals:
- illustrate habits, practices, targets, transitions
- show realistic balance and rest days
- preserve privacy (no real notes)
- visually demonstrate charts and review flows

Demo data should:
- live separately from real data
- be clearly labeled as sample
- reuse the same schema and views

---

## Table List (Updated)

Core:
- `habits`
- `practices`
- `habit_prompts`
- `targets`
- `entries`
- `preparations`
- `closures`
- `reflections`
- `habit_transitions`
- `settings`

Metrics:
- `daily_metrics`
- `daily_metric_items`

> Notes:
> - “Parking Lot” is not a table; it is `targets.status = 'parked'`
