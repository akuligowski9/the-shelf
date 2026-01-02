# The Shelf — Data Model (Single User)

This project is a personal attention and life-balance companion.
The system is **single-tenant** (no users table). Metrics are **derived**, not stored.

## Core principles

- **Entries are the source of truth** for what happened.
- **Targets unify** projects, milestones, and ideas.
- **Parking Lot is a status**, not a separate entity: `targets.status = 'parked'`.
- **Programs** are time-boxed focus blocks (month / 3 months, etc.) that provide calendar context.
- **Warm-ups and cool-downs** are habit-level prompts; responses can be logged as entries.
- **Accomplishments** are captured via `entries.is_highlight` (celebration without gamification).
- **Reflections** summarize a time range (weekly/monthly/ad-hoc), not single entries.
- **Preparations** are soft day/week framing notes (“what matters given reality”).
- **Settings** are flexible key/value JSON configuration.

## Entities

### Habits
Balancing pillars (e.g., Software, Spanish, Exercise).
- target minutes (default 60)
- optional warm-up / cool-down prompts

### Targets
Anything that can receive attention and be “on the shelf.”
Unifies:
- projects
- milestones
- ideas

Targets have a `status`:
- active
- parked (parking lot)
- planned
- done
- archived

### Programs
Time-boxed focus blocks (e.g., “Posture Month”, “3-Month PT”).
Programs can optionally reference:
- a habit (e.g., Exercise)
- a target (e.g., Overhead Mobility)
- or both

### Entries (canonical ledger)
The main event stream of what happened.

Key fields:
- `type`: `habit` | `life`
- `habit_id`: required when type is `habit`, null when type is `life`
- `practice`: required for both habit and life (e.g., "Walking", "Family / Social")
- optional links: `target_id`, `program_id`
- optional duration: `duration_minutes`
- optional celebration flag: `is_highlight`
- `source`: `manual` | `auto`

### Reflections
Weekly/monthly/ad-hoc summaries tied to a time range.
- For weekly/monthly: `period_start` and `period_end` are required.
- Ad-hoc reflections may omit the period.

### Preparations
Soft framing notes for a day or week.
- `period_type`: `day` | `week`
- `period_start`: date

### Settings
Key/value JSON config for preferences and defaults.
Examples:
- default habit duration presets
- preferred reflection cadence
- UI flags

## Derived data (not stored initially)

- Habit balance metrics are derived from entries.duration_minutes over time.
- Accomplishments views are derived from entries where is_highlight = true.
- “Last touched” is derived from the latest entry linked to a target (or habit).

## Table list

- habits
- habit_prompts
- targets
- programs
- entries
- reflections
- preparations
- settings
