# The Shelf — Import Specification (v1)

This document defines the supported JSON import format for The Shelf.

The import system is designed to be:

- forgiving
- forward-compatible
- history-preserving
- safe for repeated use
- suitable for both manual and programmatic generation

Imports mirror the system’s domain language without tightly coupling to internal schema details.

## 1. Core Import Principles

- History is preserved at all costs
- Unknown fields are ignored
- Missing optional fields are allowed
- Imports never delete or overwrite existing data
- Minimal required structure only
- Imports should not fail due to extra data

Imports are intentionally tolerant to support:

- handwritten JSON
- scripted exports
- AI-generated logs
- future format evolution

## 2. Import Unit & File Scope

Each import file represents one calendar day. The system processes imports day by day, not as bulk timelines.

### Required Top-Level Shape

A valid import file must include:

- `date` (YYYY-MM-DD)

_Example:_

```json
{
  "date": "2026-01-07"
}
```

All other fields are optional.

## 3. Supported Top-Level Fields

A full import file may include:

```json
{
  "date": "2026-01-07",
  "preparations": [],
  "closures": [],
  "entries": [],
  "reflections": [],
  "transitions": []
}
```

**Rules:**

- All arrays are optional
- Empty arrays are valid
- Unknown arrays are ignored
- Order does not matter

## 4. Date & Time Handling

- `date` represents the local calendar day
- Timestamps may be provided without timezone
- The system converts timestamps to EST
- Timezone is resolved using system settings

**Accepted timestamp formats:**

- `YYYY-MM-DDTHH:mm`
- `YYYY-MM-DDTHH:mm:ss`

## 5. Preparations (Start-of-Day / Session Framing)

Preparations represent intentional framing.

_Shape example:_

```json
{
  "occurred_at": "2026-01-07T08:15",
  "period_type": "day",
  "note": "Light day. Focus on presence."
}
```

**Supported fields:**

- `occurred_at` (optional but recommended)
- `period_type`: `day` | `week`
- `note`
- `habit` (string, optional)
- `practice` (string, optional)
- `target` (string, optional)
- `rest_day` (boolean, optional)

**Notes:**

- Preparations do not invalidate rest days
- Preparation count is tracked as a metric

## 6. Closures (End-of-Day / Session Stopping)

Closures represent intentional stopping.

_Shape example:_

```json
{
  "occurred_at": "2026-01-07T22:10",
  "scope": "day",
  "note": "Enough for today."
}
```

**Supported fields:**

- `occurred_at`
- `scope`: `day` | `session`
- `note`
- `habit` (optional)
- `practice` (optional)

**Notes:**

- Closures are not summaries
- Closure count is tracked as a metric
- Closures enable last-session retrieval

## 7. Entries (Canonical Ledger)

Entries record what actually happened.

**Required fields:**

- `type`: `habit` | `life` | `caution`
- `occurred_at`

**Supported fields:**

- `habit` (string, required for `habit` entries)
- `practice` (string, optional)
- `target` (string, optional)
- `duration_minutes` (number, optional)
- `note` (string, optional)
- `is_highlight` (boolean, optional)
- `actions` (array of strings, optional — see 7.1)

_Example — Habit Entry:_

```json
{
  "type": "habit",
  "habit": "Spanish",
  "practice": "Conversation",
  "occurred_at": "2026-01-07T14:30",
  "duration_minutes": 45,
  "note": "Call with family",
  "is_highlight": true
}
```

_Example — Life Entry:_

```json
{
  "type": "life",
  "occurred_at": "2026-01-07T18:00",
  "duration_minutes": 120,
  "note": "Dinner with family"
}
```

_Example — Caution Entry:_

```json
{
  "type": "caution",
  "occurred_at": "2026-01-07T16:10",
  "note": "Distracted scrolling"
}
```

**Notes:**

- Duration is optional for all types
- Caution entries are usually occurrence-based
- Entries may be edited later in the UI
- Entries are never hard-deleted

### 7.1 Actions (for habits with track_actions)

Habit entries may include an `actions` array for granular tracking within a session.

_Example — Entry with Actions:_

```json
{
  "type": "habit",
  "habit": "Dog Training",
  "practice": "Drills",
  "occurred_at": "2026-01-12T12:00:00",
  "duration_minutes": 60,
  "actions": ["Crate", "Name Recall", "Greeting Practice"]
}
```

**Rules:**

- `actions` is optional
- Only meaningful for habits with `track_actions: true`
- Action names are strings (matched to practice's action list)
- Unknown actions are preserved but may not display in UI

## 8. Reflections

Reflections are optional narrative artifacts.

_Shape example:_

```json
{
  "note": "Reducing habits helped this week."
}
```

**Supported fields:**

- `note`
- `reflection_type`: `day` | `week` | `month` | `adhoc` (optional)
- `period_start` (optional)
- `period_end` (optional)
- `habit` (optional)
- `target` (optional)

**Notes:**

- Reflections are never inferred
- Reflections are never required
- Multiple reflections per day are allowed

## 9. Rest Days

A rest day is inferred when:

- no `habit` entries exist
- no `life` entries exist

Rest days:

- are counted as metrics
- appear in visualizations
- do not require explicit import

**Optional:**

- mark intent via `rest_day: true` in a preparation or closure

## 10. Validation Rules (Minimal)

An import file is valid if:

- `date` exists
- arrays (if present) are arrays
- entries include `type` and `occurred_at`

Invalid objects are skipped. The import continues.

## 11. Forward Compatibility

- Unknown fields are ignored
- Unknown arrays are ignored
- No schema version is required
- Versioning will be introduced only for breaking changes

## 12. Import Outcomes

On successful import:

- entries are appended
- history is preserved
- daily metrics are recalculated
- rest days are inferred

Imports never:

- delete data
- overwrite history
- remove archived items

## 13. Transitions (Structural Changes)

Log files may include a `transitions` array to record structural changes to habits, practices, or actions.

_Example:_

```json
{
  "date": "2026-01-15",
  "transitions": [
    {
      "type": "add_practice",
      "habit": "Exercise",
      "practice": "Yoga",
      "note": "Starting yoga practice"
    },
    {
      "type": "add_action",
      "habit": "Dog Training",
      "practice": "Drills",
      "action": "Place Command",
      "note": "Added new drill"
    }
  ],
  "entries": []
}
```

**Supported transition types:**

- `add_habit` — Add a new habit
- `add_practice` — Add practice to existing habit
- `add_action` — Add action to existing practice
- `deactivate_habit` — Set habit.active = false
- `deactivate_practice` — Set practice.active = false

**Rules:**

- Transitions are processed before entries for that day
- `data/habits.json` is the baseline; transitions extend it over time
- Transitions create a timeline of structural evolution
- Unknown transition types are ignored

## 14. Source of Truth

1. **`data/habits.json`** — Canonical baseline structure
   - Defines all habits, practices, actions as of initial setup
   - Contains `practice_aliases` for import normalization

2. **Log files (`data/logs/*.json`)** — Timeline data + structural evolution
   - Entries, preparations, closures, reflections
   - Optional `transitions` array for adding practices/actions

3. **Import process** merges:
   - habits.json (baseline)
   - All transitions from log files (in date order)
   - Creates final structure for database/frontend