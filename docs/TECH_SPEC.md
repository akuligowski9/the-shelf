# The Shelf — Technical Specification

> Comprehensive technical documentation including system specification, data model, and import format.

---

## Purpose

**The Shelf** is a personal, single-user system for managing attention, balance, and long-term memory of effort.

It exists to answer practical questions:
- What do I intend to focus on today?
- What actually happened?
- Where did my time go?
- Am I balanced right now—and what is influencing that balance?
- What should I adjust next?

It is designed to be:
- a place to *start* the day intentionally
- a place to *stop* the day cleanly
- a system that preserves history across years
- a tool that makes balance visible without judgment

The Shelf is not a productivity app. It does not optimize output, enforce streaks, or pressure consistency.

Instead, it provides:
- neutral data
- meaningful structure
- optional reflection
- explicit closure

The system assumes one user (you). There is no social layer, no comparison, and no performance scoring.

---

## Non-Goals

These are explicitly out of scope:

- Gamification or streaks
- Scoring or rankings
- Social features or sharing
- Notifications or reminders
- AI-generated judgments
- Multi-user support

The Shelf describes reality without judging it.

---

## Table of Contents

1. [Core Concepts & Language](#1-core-concepts--language)
2. [Metrics & Balance](#2-metrics--balance)
3. [Primary UI Views](#3-primary-ui-views)
4. [Testing Strategy](#4-testing-strategy)
5. [Data Model](#5-data-model)
6. [Import Specification](#6-import-specification)
7. [Mobile Architecture](#7-mobile-architecture)

---

## 1. Core Concepts & Language

### 1.1 Habits

**Habits are long-running pillars of attention**, not tasks.

Examples:
- Software
- Spanish
- Exercise
- Dog Training
- Reading

Habits represent *domains of life*, not commitments to daily execution.

Properties:
- `active` (boolean)
- `target_minutes` (default framing value, not a quota)
- `sort_order`
- associated practices

Habits can be activated or deactivated over time.
Changing which habits are active is meaningful and tracked.

---

### 1.2 Practices

**Practices are concrete expressions of a habit.**

They answer:
> "How did I engage this habit today?"

Examples:
- Software → Development, Learning
- Exercise → Walking, Gym, Physical Therapy, Cardio
- Spanish → Textbook Learning, Conversation, Media

Rules:
- A practice belongs to exactly one habit
- Practices are reusable and stored to avoid duplication
- Practices can be active or inactive
- Practices may be ordered for UI clarity

Practices allow:
- sub-habit analysis
- variety without fragmentation
- cleaner visualizations

---

### 1.2.1 Behaviors (Actions)

**Behaviors are granular, trackable sub-components of a practice.**

They are only available for habits with `track_actions: true`.

Examples:
- Dog Training → Drills → "Crate", "Name Recall", "Place Command", "Greeting Practice"
- Dog Training → Walk Training → "Heel", "Stop at Curbs", "Ignore Distractions"

Rules:
- Behaviors belong to a specific practice
- Multiple behaviors can be logged per entry
- Behaviors are stored in the entry's `actions` JSONB field
- Behaviors allow fine-grained pattern recognition within sessions

Properties:
- `id`
- `practice_id`
- `name`
- `active` (boolean)

---

### 1.3 Targets

**Targets represent direction, not obligation.**

They unify:
- projects
- milestones
- ideas
- areas of focus

Targets may:
- exist without habits
- link to one or more habits
- overlap in time
- be paused indefinitely

Properties:
- `status`: active | planned | parked | done | archived
- optional `start_date` / `end_date`
- optional habit or practice association

Interpretation rules:
- "Current work" is computed from dates AND status
- Parked/done/archived targets never appear as current work
- Overlapping targets are allowed

Targets live on **The Shelf** when not active.

---

### 1.4 Entries (Canonical Ledger)

**Entries are the source of truth for what happened.**

Everything else — metrics, balance, accomplishments — is derived from entries.

Types:
- `habit`
- `life`
- `caution`

Common fields:
- `occurred_at` (stored in EST; timezone configurable)
- `note`
- `duration_minutes` (optional)
- `is_highlight`
- `source`: manual | import | auto

Habit entries:
- require `habit_id`
- may include `practice_id`
- may link to a target

Life entries:
- may include duration
- capture relational, social, or logistical effort

Caution entries:
- represent behaviors that detract from balance
- normalized to avoid duplication

Entries can be:
- added
- edited
- archived

They are never hard-deleted.

---

### 1.5 Preparations & Closures

Preparations and closures are **intentional framing events**, not effort tracking.

They exist at two levels:

#### Day-Level Preparations & Closures
- Frame the day as a whole
- "What matters today given my reality?"
- "The day is done. Here's how I'm stopping."
- Standalone records, not attached to entries

#### Habit-Level Warm-ups & Cool-downs
- Frame a specific habit session
- Attached directly to habit entries
- Use saved templates from the Preparation & Closure Library

**Warm-ups** are rituals or scripts you invoke before starting a habit session:
- Set intention, orient, recite permission pages
- May include dynamic elements (e.g., "what you worked on last session")
- Different habits may have different warm-up templates
- Can create an entry (warm-up first) or attach to existing entry

**Cool-downs** are rituals for ending a habit session cleanly:
- Mark stopping, freeze work, capture next steps
- Attached to the habit entry
- Use saved templates or freeform notes

Properties (day-level):
- `scope`: day
- `occurred_at`
- `note`
- `rest_day` (boolean, optional)

Properties (habit-level, on entry):
- `warm_up_template_id` (optional reference to saved template)
- `warm_up_note` (captured during warm-up)
- `cool_down_template_id` (optional reference to saved template)
- `cool_down_note` (captured during cool-down)

Counts of preparations and closures are meaningful indicators of:
- intentionality
- pacing
- closure hygiene

---

### 1.5.1 Preparation & Closure Library

The library stores reusable warm-up and cool-down templates per habit.

**Warm-up Templates:**
- Belong to a specific habit
- Can have multiple templates per habit (different contexts)
- Contain structured content: scripts, permission pages, prompts
- May include dynamic placeholders (e.g., `{{last_session_note}}`)
- Invoked when starting a habit session

**Cool-down Templates:**
- Belong to a specific habit
- Structured prompts for ending cleanly
- May include checklists, reflection prompts, next-step capture

Properties:
- `id`
- `habit_id`
- `type`: warm_up | cool_down
- `name` (e.g., "PM Assist Invocation", "Quick Focus")
- `content` (rich text / markdown)
- `has_dynamic_elements` (boolean)
- `active` (boolean)
- `created_at`

The library is managed in the Attention view alongside habits and practices.

---

### 1.6 Reflections

Reflections are **macro step-back moments**.

They are:
- never required
- never prompted automatically
- fully user-initiated

Reflections:
- are free-form text
- may reference metrics
- may reference targets, habits, or transitions
- are saved permanently

Reflections are often triggered by noticing patterns, not by the system.

---

### 1.7 Highlights (Accomplishments)

A highlight is a **celebratory marker**, not a score.

- Implemented as `entries.is_highlight`
- Can be toggled at any time
- Used to surface accomplishments in review views

Highlights allow:
- end-of-day pride
- end-of-year retrospection
- memory preservation

---

### 1.8 Habit Transitions (Transition Windows)

Transitions track **changes to the habit set**, not daily behavior.

**Important:** "Transitions" specifically refer to habit activation/deactivation changes. Target status changes (planned → active → done) are NOT called transitions.

A transition window represents:
- reducing active habits
- increasing active habits
- swapping habits intentionally

**Transition Window Behavior:**
- Entered explicitly via "Enter Transition Window" in Attention view
- Allows toggling multiple habits at once
- Captures a **note** explaining why habits are being activated/deactivated
- Exited by completing (with note) or canceling
- A transition is only counted when the window is **completed**

**Cascading Effects:**
When a habit is deactivated:
- All practices under that habit are also deactivated
- All targets linked to that habit are parked

Rules:
- Editing habit metadata does not count as a transition
- Multiple habit changes inside one window = one transition event
- Transition windows are explicitly entered and exited
- Transition history is recorded with timestamp and note

Transitions explain balance shifts without blame.

---

### 1.9 Rest Days

A rest day is defined as:

> A day with no habit entries and no life entries.

Notes:
- Preparations, closures, or reflections do not invalidate rest
- Rest days are counted and visualized
- Rest days preserve continuity in charts

Optional:
- A preparation or closure may note `rest_day: true` for intentional rest

---

## 2. Metrics & Balance

Metrics in The Shelf exist to **describe reality**, not to judge it.

They are designed to help you *notice*:
- how attention is distributed
- how that distribution changes
- what contextual factors influence those changes

Metrics never imply success, failure, or obligation.

---

### 2.1 The Central Question

> "Am I balanced — and what influenced that balance?"

This question is intentionally broad.

Balance is not defined as:
- equal time
- perfect consistency
- daily completion

Balance is defined as:
- sustainable attention
- explainable variation
- alignment with reality

Metrics exist to support reflection, adjustment, and closure.

---

### 2.2 Balance vs. Patterns (Explicit Separation)

The Progress system is intentionally split into **two analytical lenses**:

#### Balance — *Distribution*
Balance answers:
- Where did my attention go?
- How was it distributed across habits?
- How much was absorbed by life or caution behaviors?
- Was this period rest-heavy or effort-heavy?

Balance is about **composition**, not change.

#### Patterns — *Change Over Time*
Patterns answer:
- What is increasing or decreasing?
- When did attention shift?
- Did something change after a transition?
- Are certain behaviors clustering?

Patterns are about **movement**, not totals.

This separation prevents:
- misreading normal variation as failure
- overreacting to short-term noise
- collapsing reflection into optimization

---

### 2.3 Derived Metrics

All metrics are derived from persisted history.

Sources:
- entries (habit, life, caution)
- habit transitions
- preparations and closures

Core derived metrics include:

- Habit minutes per day
- Practice-level breakdown within a habit
- Life minutes alongside habits
- Caution behavior frequency
- Transition count and timing
- Preparation count
- Closure count
- Rest day count

No metric is treated as a goal.

---

### 2.4 Visualization Model

Visualizations are inspired by **iOS Screen Time**.

#### Balance Visualizations
Used for distribution and composition:

- **Daily stacked bar charts**
  - habits (color-coded)
  - life entries
  - caution behaviors
- **Calendar view**
  - each day shows a compact composition indicator
  - empty habit/life days appear as rest days
  - selecting a day drills into entries

Balance visuals:
- tolerate missing data
- do not require daily logging
- treat rest as neutral

#### Pattern Visualizations
Used for trend analysis:

- **Line charts**
  - one line per habit
  - toggle habits on/off
  - continuity preserved across rest days
- **Practice overlays**
  - drill into how a habit was engaged
- **Markers**
  - habit transition windows
  - notable life events
  - caution spikes

Patterns answer *why* balance changed.

---

### 2.5 Rest Days as a Metric

A rest day is defined as:
> No habit entries and no life entries for the day.

Rest days:
- are inferred
- are counted
- are visualized
- preserve chart continuity

Rest days may be intentional or unintentional.
Both are valid and informative.

---

## 3. Primary UI Views (Contract) — All Complete

Each view has a **clear responsibility**.
No view tries to do everything.

All six views are fully implemented as of v1.

---

### 3.1 Shelf (Macro Attention Surface) — Complete

**Purpose**
The Shelf is the home view and emotional anchor — a dashboard for orientation, not action.

It exists to:
- orient you
- remind you what's active
- show where attention has gone

**Displays**

*Welcome Header*
- Personalized greeting based on time of day
- Current date display

*Habits Card*
- Active habits count (e.g. "4 / 5 active")
- Expandable accordion per habit showing:
  - Practice/behavior counts (e.g. "3 practices · 7 behaviors")
  - Warm-up/cool-down template counts (↑/↓ icons)
  - Nested collapsible per practice to reveal behaviors
- "Go to Habits" navigation → Attention view (#habits)

*Targets Card*
- Targets grouped by status: Active, Planned, Parked
- Drag-and-drop reordering within status groups
- Drag-and-drop between status groups to change status
- Target progress indicator for targets with entries
- "Go to Targets" navigation → Attention view (#targets)

*Activity Card*
- Today: habits · life · caution · transitions · time · sun/moon icons for prep/closure status
- This Week: habits · life · caution · transitions · highlights · time
- This Month: habits · life · caution · transitions · highlights · time
- All counts shown including zeros for consistency
- "Go to Today" navigation → Today view

*Recent Highlights*
- Up to 3 most recent highlighted entries
- Shows habit, practice, and note preview
- Type-specific styling

**Interactions**
- Expand habits to view practices and behaviors (accordion)
- Expand practices to view behaviors (collapsible)
- Drag targets to reorder or change status
- Navigate to Attention view (habits or targets section via hash)
- Navigate to Today view

**Notes**
- No editing of habits/practices here — Shelf is read-only for structure
- Targets can be reordered and status-changed via drag-drop
- Day prompts ("Start your day?" / "Done for the day?") live in Today view only
- Prep/closure status shown via sun/moon icons in Activity
- Calm, grounded, safe to return to

---

### 3.2 Today (Action & Logging) — Complete

**Purpose**
Today is where the day is assembled, lived, and closed.

It is the **only place** where daily actions occur.

**Displays**

*Header*
- Date with navigation arrows (previous/next day)
- "Add Entry" button

*Day Preparation Card*
- Intentions textarea
- Rest day toggle with badge
- Sun icon indicates preparation status

*Day Summary*
- Count of entries by type (habit/life/caution)
- Total duration for the day

*Entry List*
- Entries in reverse chronological order
- Left border color by type (green=habit, blue=life, orange=caution)
- Habit badge with habit color
- Practice name
- Time and duration
- Note preview
- Behaviors displayed as comma-separated text (for habits with track_actions)
- Highlight star indicator
- Session dropdown for warm-up/cool-down

*Day Closure Card*
- Notes textarea
- Moon icon indicates closure status

**Interactions**
- Navigate between days
- Add entry via dialog (habit/life/caution selection)
- For habit entries: select habit → practice → optional behaviors
- Add/edit notes, duration, time
- Edit or archive entries (including past days)
- Toggle highlight on entries
- Add preparation (day-level framing)
- Mark rest day
- Add closure (day-level ending)
- Session dropdown: view warm-up, add warm-up note, view cool-down, add cool-down note

**Entry Form Dialog**
- Type selector (Habit/Life/Caution)
- Habit selector (for habit type)
- Practice selector (filtered by habit)
- Behaviors multi-select (for habits with track_actions)
- Target selector (optional link to target)
- Date/time picker
- Duration input
- Note textarea
- Highlight toggle

**Notes**
- Supports imperfect memory — can edit past days
- Corrections are allowed
- Encourages return throughout the day
- Warm-up/cool-down are per-entry for habits

---

### 3.3 Progress (Balance & Patterns) — Complete

**Purpose**
Progress exists to make attention visible over time.

It is analytical and read-only.

**Displays**

*Header*
- Balance/Patterns toggle buttons
- Time range selector (Week/Month/Year)
- Calendar navigation (previous/next period)
- Period label (e.g., "Jan 11 – Jan 17" for week)

*Balance View*
- Stacked bar chart (Recharts) showing time by habit
- Each habit has its assigned color
- Life entries shown in distinct color
- Custom tooltips with dark mode support
- Habit toggles to show/hide in chart

*Patterns View*
- Line chart showing trends over time
- Clean lines without dots (activeDot on hover only)
- One line per enabled habit
- Smooth curves for readability

*Stats Section*
- Distribution: total hours, habit/life/caution counts, rest days
- Averages: hrs/day, habits/day, entries/day
- Period Comparison: % change from previous period

*Balance Shift*
- Shows each habit's current % of total time
- Shows change from previous period (+/- percentage points)
- Sorted by current percentage

*Habit Deep Dive* (expandable per habit)
- Total Sessions count
- Since Last: days since last entry for this habit
- Longest Gap: maximum days between entries (all-time)
- Hours by period breakdown

*Year View*
- 52-week grid showing activity
- Tooltip with date range on hover

**Interactions**
- Toggle between Balance and Patterns views
- Toggle individual habits on/off in charts
- Change time range (Week/Month/Year)
- Navigate to previous/next period
- Expand habit deep dive sections

**Notes**
- No logging here
- No editing here
- Numbers are descriptive only
- All data from API (/metrics/range endpoint)

---

### 3.4 Review (Reflection & Accomplishments) — Complete

**Purpose**
Review is for meaning-making and celebration.

It answers:
> "What happened — and what does it mean to me?"

**Displays**

*Header*
- Time range selector (Week/Month/Year)
- Calendar navigation (previous/next period)
- Period label

*Period Summary*
- Total time logged
- Session count
- Caution count
- Action count (behaviors tracked)
- Rest days
- Each stat has a "Reflect" button to trigger reflection

*Accomplishments Section*
- Highlighted entries with type-specific icons:
  - Activity icon (blue) for habits
  - Leaf icon (green) for life events
  - Alert icon (orange) for caution behaviors
- Completed targets with target icon (green)
- Entry details: habit badge, practice, note, date, duration
- Each accomplishment has a "Reflect" button

*Reflection Editor*
- Tiptap-based rich text editor
- Bold, italic, lists, headings support
- Trigger context shown above editor (what prompted this reflection)
- Save button

*Past Reflections*
- List of saved reflections for the period
- Each shows trigger context (if any) and note content
- Expandable to see full text
- Delete option

**Triggers**
Reflections can be triggered by:
- Prompts: auto-generated insights (e.g., "This was lighter than last period...")
- Metrics: clicking "Reflect" on a summary stat
- Accomplishments: clicking "Reflect" on a highlight or target
- Free-form: writing without a trigger

**Interactions**
- Change time range and navigate periods
- Click "Reflect" on any stat or accomplishment
- Write and save reflections with rich text
- Browse and delete past reflections

**Notes**
- Reflections are never required
- Accomplishments set the tone
- Triggers provide context but don't constrain content

---

### 3.5 Attention (Targets & Habits) — Complete

**Purpose**
Attention is where structure is managed.

This is where you decide **what gets attention at all**.

**Displays**

*Transition Window Banner* (when active)
- Shows transition is in progress
- Complete Transition button with note capture
- Cancel option

*Habits Section*
- Tree-style expandable list (file explorer metaphor)
- Each habit shows:
  - Name with color indicator
  - Active/inactive badge
  - Practice count and behavior count
  - Warm-up/cool-down template counts (↑/↓)
- Expand habit to see practices
- Each practice shows behavior count
- Expand practice to see behaviors (for habits with track_actions)
- Inline "Add Habit", "Add Practice", "Add Behavior" forms
- Edit dialogs for habits, practices, behaviors

*Habit Edit Dialog*
- Name, target_minutes, color picker
- Active toggle
- track_actions toggle (enables behaviors)
- Warm-up Templates section (collapsible)
- Cool-down Templates section (collapsible)
- Template management: add, edit, delete templates

*Targets Section*
- Kanban board with 4 columns: Active, Planned, Parked, Done
- Color-coded column headers (emerald/sky/slate/violet)
- Drag-and-drop between columns to change status
- "See all" modals for each column with drag-reorder
- Add Target button with dialog
- Target Edit Dialog: name, habit, status, start/end dates

**Interactions**
- Enter/exit transition windows
- Add/edit/delete habits
- Add/edit/delete practices
- Add/edit/delete behaviors
- Toggle habit active status
- Toggle track_actions per habit
- Manage warm-up/cool-down templates per habit
- Add/edit/delete targets
- Drag targets between Kanban columns
- Reorder targets within columns

**Notes**
- Structural changes happen here
- Transitions are initiated here (Enter Transition Window button)
- Changes explain future metrics
- Hash navigation: `/attention#habits` and `/attention#targets`
- Templates authored here, used in Today view

---

### 3.6 Settings & Data Management — Complete

**Purpose**
Settings control system behavior, not behavior itself.

**Displays**

*Appearance Section*
- Theme selector: Light, Dark, Auto (6PM-6AM)
- Visual preview of current theme

*Preferences Section*
- Timezone selector (persisted to database)
- Shelf target sort order option

*Data Health Section* (8 collapsible sections)
- Habits Coverage: table showing each habit, practices count, date range, first/last entry
- Practices by Habit: nested view of practices per habit with entry counts
- Actions by Practice: behaviors/actions organized by practice
- Entries Summary: total counts by type (habit/life/caution)
- Targets Overview: counts by status (active/planned/parked/done)
- Reflections: count of saved reflections
- Transitions: history of structural changes
- Data Quality: integrity checks and warnings

*Import/Export Section*
- Export JSON button (downloads full database export)
- Import JSON button (file picker)
- Import preview with duplicate detection
- Pending imports list (files in data/imports/ folder)
- Preview and import individual pending files

**Interactions**
- Change theme (immediate effect)
- Set timezone
- Expand/collapse data health sections
- Export full database as JSON
- Import JSON file with preview
- Review and import pending files
- See duplicate detection before confirming import

**Notes**
- Import is forgiving (unknown fields ignored)
- Preview mode shows what will be imported
- Imported files move to data/logs/ after success
- History is preserved
- Designed for longevity

### 3.6.1 Demo Data

For testing and demonstration purposes, a set of sample data is available in the `data/logs/demo` directory. These files are structured according to the JSON import specification and can be used to populate the system via the import interface in the settings view. This allows developers and testers to quickly see the system's features populated with realistic data without needing to create it manually.

### 3.6.2 Live Data Logging

In addition to the database, the system will maintain a real-time log of all entries in JSON format. For each day that data is recorded, a corresponding JSON file will be created in the `data/logs/` directory. The structure of the objects within the JSON file will adhere to the format defined for `Entries` in the Data Model section.

- **File Naming:** Files will be named based on the date, e.g., `YYYY-MM-DD.json`.
- **Purpose:** This provides a simple, durable, and human-readable record of daily activity. It serves as a secondary backup and allows for easy inspection or external processing of the raw data.
- **Relationship to Database:** This file-based logging is a supplement to, not a replacement for, the primary database. The database remains the canonical source for application queries and derived metrics.

---

## 4. Testing Strategy

### Unit Tests

**Frontend (Vitest)** — `frontend/web/src/**/*.test.js`
- `colors.test.js` — Color utilities, badge classes, entry styles (23 tests)
- `mockData.test.js` — Date formatting, session lookup, template rendering (14 tests)
- Run: `cd frontend/web && npm run test`

**Backend (Jest)** — `backend/api/__tests__/*.test.js`
- `health.test.js` — Health endpoint (1 test)
- `metrics.test.js` — Metrics range validation and response (5 tests)
- `entries.test.js` — Full CRUD operations with mocked database (16 tests)
- Run: `cd backend/api && npm test`

### End-to-End (Playwright)

Critical flows:
- start → log → close
- edit history
- transition windows
- rest day inference
- import/export
- review persistence

Tests validate continuity and correctness, not performance.

---

## 5. Data Model

> The system is **single-tenant** (no users table).
> **Entries are the canonical source of truth**, and the system also supports **stored daily metrics** to enable fast, stable, Screen Time–style visualizations.

### 5.1 Core Principles

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

### 5.2 Source of Truth

1. **`data/habits.json`** — Canonical baseline for habits, practices, and actions
2. **`data/logs/*.json`** — Daily log files with entries and optional transitions
3. **`db/schema.sql`** — Database schema (the import process populates this)

---

### 5.3 Canonical Definitions (Domain Language)

- **Habit**: A recurring domain of attention (e.g., Software, Spanish, Exercise).
- **Practice**: A concrete way to fulfill a habit (e.g., Walking, Conversations, Personal Project Development).
- **Target**: The thing you are working toward (project, milestone, idea). Targets give *direction*, not obligation.
- **Preparation**: A soft framing note used to start a day or week intentionally.
- **Closure**: An intentional stopping marker used to end a day or session.
- **Entry**: A logged event representing what actually happened.
- **Highlight**: A celebratory flag on an entry.
- **Reflection**: A stored narrative artifact interpreting patterns over a time range.
- **Transition Window**: An intentional period where the set of active habits is adjusted.
- **Parking Lot**: Inactive targets held intentionally for later attention.

---

### 5.4 Entity Details

#### Habits

Habits represent long-running pillars of attention.

Fields:
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

#### Practices

Practices are concrete expressions of a habit.

Fields:
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

#### Targets

Targets unify projects, milestones, and ideas.

Status values:
- `active`
- `parked` (parking lot)
- `planned`
- `done`
- `archived`

Optional scheduling:
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

#### Entries (Canonical Ledger)

Entries are the primary record of what happened.

Entry types:
- `habit`
- `life`
- `caution`

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

#### Preparations

Preparations are soft framing notes.

Fields:
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

#### Closures

Closures represent intentional stopping.

Fields:
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
- Closures help retrieve "last session context" per habit/practice
- `occurred_at` is anchored to the selected date (noon of that day), not the current clock time, to prevent timezone drift
- Backend queries use `AT TIME ZONE 'America/New_York'` for EST-aware date boundaries (Neon server runs in UTC)

---

#### Reflections

Reflections are macro sense-making artifacts.

Fields:
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

#### Habit Prompts (Templates)

Habit-level prompts used to assist framing or closure.

Fields:
- `habit_id`
- `prompt_type`: `warmup` | `cooldown`
- `prompt_text`
- optional active flag
- sort order

Notes:
- Prompt responses are **not** stored separately
- Responses may be captured via preparations, closures, or reflections

---

#### Habit Transitions (Transition Windows)

Transitions track **changes to the active habit set**.

**Note:** "Transitions" refer specifically to habit changes. Target status changes are NOT transitions.

Fields:
- `id`
- `started_at`
- `ended_at`
- `note` (captures why habits were activated/deactivated)
- timestamp

Rules:
- A transition window may contain multiple habit activations/deactivations
- One window = one transition event for metrics
- Transition windows explain balance shifts over time

Cascading effects on deactivation:
- Practices under deactivated habit → deactivated
- Targets linked to deactivated habit → parked

---

#### Settings

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

### 5.5 Daily Metrics (Stored)

To support Screen Time–style charts, the system persists daily aggregates.

#### Why store daily metrics?

- Fast chart rendering
- Stable historical views
- Simplified weekly/monthly/yearly queries
- Insulation from entry edits

#### Metric layers

**1) `daily_metrics`**
One row per calendar day.
- `date`
- `is_rest_day` (boolean)
- optional totals (e.g. total minutes)

**2) `daily_metric_items`**
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

### 5.6 Table List

**Core:**
- `habits`
- `practices`
- `actions`
- `habit_prompts`
- `targets`
- `entries`
- `preparations`
- `closures`
- `reflections`
- `habit_transitions`
- `settings`

**Metrics:**
- `daily_metrics`
- `daily_metric_items`

> Note: "Parking Lot" is not a table; it is `targets.status = 'parked'`

---

## 6. Import Specification

> The import system is designed to be forgiving, forward-compatible, history-preserving, safe for repeated use, and suitable for both manual and programmatic generation.

### 6.1 Core Import Principles

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

### 6.2 Import Unit & File Scope

Each import file represents one calendar day. The system processes imports day by day, not as bulk timelines.

#### Required Top-Level Shape

A valid import file must include:
- `date` (YYYY-MM-DD)

_Example:_

```json
{
  "date": "2026-01-07"
}
```

All other fields are optional.

### 6.3 Supported Top-Level Fields

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

### 6.4 Date & Time Handling

- `date` represents the local calendar day
- Timestamps may be provided without timezone
- The system converts timestamps to EST
- Timezone is resolved using system settings

**Accepted timestamp formats:**
- `YYYY-MM-DDTHH:mm`
- `YYYY-MM-DDTHH:mm:ss`

### 6.5 Preparations (Start-of-Day / Session Framing)

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

### 6.6 Closures (End-of-Day / Session Stopping)

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

### 6.7 Entries (Canonical Ledger)

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
- `actions` (array of strings, optional)

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

#### Actions (for habits with track_actions)

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

### 6.8 Reflections

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

### 6.9 Rest Days

A rest day is inferred when:
- no `habit` entries exist
- no `life` entries exist

Rest days:
- are counted as metrics
- appear in visualizations
- do not require explicit import

**Optional:**
- mark intent via `rest_day: true` in a preparation or closure

### 6.10 Validation Rules (Minimal)

An import file is valid if:
- `date` exists
- arrays (if present) are arrays
- entries include `type` and `occurred_at`

Invalid objects are skipped. The import continues.

### 6.11 Forward Compatibility

- Unknown fields are ignored
- Unknown arrays are ignored
- No schema version is required
- Versioning will be introduced only for breaking changes

### 6.12 Import Outcomes

On successful import:
- entries are appended
- history is preserved
- daily metrics are recalculated
- rest days are inferred

Imports never:
- delete data
- overwrite history
- remove archived items

### 6.13 Transitions (Structural Changes)

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

---

## 7. Mobile Architecture

### 7.1 Overview

The mobile app (React Native + Expo) provides the same 6 views as the web app with mobile-optimized UX and offline-first architecture.

**Key Features:**
- Full offline support with mutation queueing
- Automatic sync when connectivity restored
- Network status monitoring
- User-friendly error handling
- Haptic feedback on interactions
- Swipeable entry cards for quick actions

### 7.2 Offline Queue System

**Architecture:**

```
User Action → Check Network → Online?
  ├─ Yes → Execute API call → Update store
  └─ No  → Queue mutation → Update store optimistically → Show "Offline" banner
           ↓
       Connectivity Restored → Auto-sync queue → Remove from queue
```

**Components:**

1. **Network Monitoring** (`useNetwork` hook)
   - Uses `@react-native-community/netinfo`
   - Monitors `isConnected` and `isInternetReachable`
   - Real-time updates via event subscription

2. **Offline Queue Store** (`offlineQueueStore`)
   - Zustand store managing queued mutations
   - Persists to AsyncStorage for durability across app restarts
   - Tracks retry attempts and error states
   - FIFO processing order

3. **Sync Manager** (`syncManager`)
   - Processes queue when online
   - Auto-triggers on network state change (offline → online)
   - Exponential backoff retry logic (1s → 2s → 4s → max 30s)
   - Max 3 retry attempts per mutation
   - Skips permanently failed mutations

4. **Offline API Wrapper** (`offlineApi`)
   - Wraps shared API functions
   - Detects network status before mutations
   - Queues mutations when offline or on network error
   - Read operations pass through unchanged

5. **Network Status Banner** (`NetworkStatus` component)
   - Visual indicator at top of app
   - Color-coded states:
     - Red: Offline with pending count
     - Blue: Syncing N changes
     - Amber: Pending changes waiting to sync
   - Animated slide-in/slide-out

**Queue Structure:**

```typescript
interface QueuedMutation {
  id: string                    // Unique identifier
  timestamp: number              // When queued
  endpoint: string               // API endpoint
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any                     // Request payload
  entityType: string             // For categorization
  entityId?: number              // Optional entity ID
  retryCount: number             // Attempts made
  lastError?: string             // Last failure reason
}
```

**Storage:**
- Queue persisted to AsyncStorage key: `@shelf/offline_queue`
- JSON serialized array of mutations
- Loaded on app start
- Updated after every queue change

### 7.3 Error Handling

**Error Types:**

1. **NetworkError** - No internet connection, mutation queued for sync
2. **ServerError** - API returned error (4xx/5xx)
3. **ValidationError** - Invalid data format
4. **QueueError** - Failed to persist queue

**User-Friendly Messages:**

- Network errors shown as **info toasts** ("No internet connection. Changes will sync when online.")
- Server/validation errors shown as **error toasts** with specific message
- Success operations shown as **success toasts**

**Retry Logic:**

- Network errors: Always retry
- 5xx server errors: Retry with exponential backoff
- 429 rate limit: Retry with exponential backoff
- 4xx client errors: Don't retry (except 429)
- Validation errors: Don't retry

### 7.4 Optimistic Updates

All mutations update the local store immediately (optimistic UI):

1. User performs action (e.g., create entry)
2. Store updates immediately with temporary data
3. API call executes (or queues if offline)
4. On success: Replace temporary with real data
5. On non-network error: Revert optimistic update

**Benefits:**
- Instant UI feedback
- App remains responsive offline
- Seamless online/offline transition

### 7.5 State Management

**Zustand Stores:**

- `habitsStore` - Habits, practices, actions, targets, prompts
- `entriesStore` - Entries, preparations, closures
- `offlineQueueStore` - Mutation queue and sync state
- `themeStore` - Theme preferences

All stores use offline API wrapper for mutations.

### 7.6 Known Limitations

1. **No Conflict Resolution** - Last write wins. If server data changed while offline, local changes overwrite.
2. **No Optimistic ID Mapping** - Temporary IDs for created items aren't mapped to real server IDs.
3. **No Queue Size Limit** - Queue can grow large if offline for extended periods.
4. **No Mutation Merging** - Multiple updates to same entity queue separately rather than merging.
5. **Unencrypted Queue** - AsyncStorage not encrypted, sensitive data visible if device compromised.

### 7.7 Future Enhancements

- Conflict resolution for concurrent edits
- Manual sync button
- Queue inspection/debugging UI
- Encrypted queue storage
- Mutation merging/deduplication
- Optimistic ID mapping for created entities
