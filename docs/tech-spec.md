# The Shelf — Technical Specification

## 1. Overview

**The Shelf** is a personal, single-user system for managing attention, balance, and long-term memory of effort.

It is designed to be:
- a place to *start* the day intentionally
- a place to *stop* the day cleanly
- a system that preserves history across years
- a tool that makes balance visible without judgment

The Shelf is not a productivity app.
It does not optimize output, enforce streaks, or pressure consistency.

Instead, it provides:
- neutral data
- meaningful structure
- optional reflection
- explicit closure

The system assumes one user (you).  
There is no social layer, no comparison, and no performance scoring.

---

## 2. Design Philosophy

### 2.1 Attention over productivity

The core problem The Shelf addresses is **fragmented attention**, not insufficient effort.

The system assumes:
- effort already exists
- energy fluctuates
- life events matter
- rest is necessary

The goal is to *see where attention went*, not to maximize how much occurred.

---

### 2.2 Numbers are neutral

Metrics are not goals.
Metrics are not scores.
Metrics are not judgments.

They exist to answer questions like:
- Where did my time go?
- What patterns are emerging?
- Why did certain habits feel heavier this week?
- What changed before balance shifted?

Numbers are treated the same way iOS Screen Time treats app usage:
informative, factual, and non-moral.

---

### 2.3 Closure is as important as effort

Many systems track “doing.”
Very few systems track “stopping.”

The Shelf treats:
- preparation (framing)
- closure (ending)
- reflection (meaning)

as first-class concepts.

A day is considered *complete* when it is closed, not when all habits are executed.

---

### 2.4 History is sacred

This system is designed to be used for **years**.

Nothing meaningful is ever deleted.
Archiving removes items from current views but never from history or metrics.

The intent is that in 2028 you can still answer:
> “What did 2026 actually look like?”

---

## 3. Core Concepts & Language

### 3.1 Habits

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

### 3.2 Practices

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

### 3.2.1 Behaviors (Actions)

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

### 3.3 Targets

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
- “Current work” is computed from dates AND status
- Parked/done/archived targets never appear as current work
- Overlapping targets are allowed

Targets live on **The Shelf** when not active.

---

### 3.4 Entries (Canonical Ledger)

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

### 3.5 Preparations & Closures

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

### 3.5.1 Preparation & Closure Library

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

### 3.6 Reflections

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

### 3.7 Highlights (Accomplishments)

A highlight is a **celebratory marker**, not a score.

- Implemented as `entries.is_highlight`
- Can be toggled at any time
- Used to surface accomplishments in review views

Highlights allow:
- end-of-day pride
- end-of-year retrospection
- memory preservation

---

### 3.8 Habit Transitions (Transition Windows)

Transitions track **changes to the habit set**, not daily behavior.

A transition window represents:
- reducing active habits
- increasing active habits
- swapping habits intentionally

Rules:
- Editing habit metadata does not count
- Multiple habit changes inside one window = one transition
- Transition windows are explicitly entered and exited

Transitions explain balance shifts without blame.

---

### 3.9 Rest Days

A rest day is defined as:

> A day with no habit entries and no life entries.

Notes:
- Preparations, closures, or reflections do not invalidate rest
- Rest days are counted and visualized
- Rest days preserve continuity in charts

Optional:
- A preparation or closure may note `rest_day: true` for intentional rest

---

## 4. Metrics & Balance

Metrics in The Shelf exist to **describe reality**, not to judge it.

They are designed to help you *notice*:
- how attention is distributed
- how that distribution changes
- what contextual factors influence those changes

Metrics never imply success, failure, or obligation.

---

### 4.1 The Central Question

> “Am I balanced — and what influenced that balance?”

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

### 4.2 Balance vs. Patterns (Explicit Separation)

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

### 4.3 Derived Metrics

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

### 4.4 Visualization Model

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

### 4.5 Rest Days as a Metric

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

## 5. Primary UI Views (Contract) — All Complete

Each view has a **clear responsibility**.
No view tries to do everything.

All six views are fully implemented as of v1.

---

### 5.1 Shelf (Macro Attention Surface) — Complete

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

### 5.2 Today (Action & Logging) — Complete

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

### 5.3 Progress (Balance & Patterns) — Complete

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

### 5.4 Review (Reflection & Accomplishments) — Complete

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

### 5.5 Attention (Targets & Habits) — Complete

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

### 5.6 Settings & Data Management — Complete

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

### 5.6.1 Demo Data

For testing and demonstration purposes, a set of sample data is available in the `data/logs/demo` directory. These files are structured according to the JSON import specification and can be used to populate the system via the import interface in the settings view. This allows developers and testers to quickly see the system's features populated with realistic data without needing to create it manually.

### 5.6.2 Live Data Logging

In addition to the database, the system will maintain a real-time log of all entries in JSON format. For each day that data is recorded, a corresponding JSON file will be created in the `data/logs/` directory. The structure of the objects within the JSON file will adhere to the format defined for `Entries` in the `docs/data-model.md` document.

- **File Naming:** Files will be named based on the date, e.g., `YYYY-MM-DD.json`.
- **Purpose:** This provides a simple, durable, and human-readable record of daily activity. It serves as a secondary backup and allows for easy inspection or external processing of the raw data.
- **Relationship to Database:** This file-based logging is a supplement to, not a replacement for, the primary database. The database remains the canonical source for application queries and derived metrics.

---

## 6. Data Integrity & Persistence

- No destructive deletes
- Archival preserves metrics
- Multi-year continuity
- Designed for long-term retrospection

---

## 7. Testing Strategy

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

## 8. Visual Design Guidelines

### 8.1 Tone

- calm
- welcoming
- grounded

The app should feel safe to return to.

UI avoids:
- alarms
- badges
- streak warnings

---

### 8.2 Color System (Light Mode)

The color palette uses warm earth tones with muted green accents. All colors are defined as HSL CSS variables.

#### Foundation Colors

| Variable | HSL Value | Purpose |
|----------|-----------|---------|
| `--background` | 38 25% 94% | Page background (warm sand) |
| `--card` | 40 28% 97% | Card backgrounds (soft cream) |
| `--border` | 35 25% 72% | Card and input borders |
| `--primary` | 160 38% 32% | Primary actions (evergreen) |

#### Text Hierarchy (3-Tier Brown System)

Text uses a coordinated brown palette on hue 20 (warm terracotta-brown):

| Tier | Variable | HSL Value | Usage |
|------|----------|-----------|-------|
| **Darkest** | `--foreground` | 20 45% 20% | Headers, stats, practice names |
| **Medium** | `--content-foreground` | 20 35% 35% | Notes, behaviors, timestamps, durations |
| **Lightest** | `--muted-foreground` | 20 30% 48% | Actions (Edit, Highlight), warm-up/cool-down notes |

The hierarchy creates clear visual layers while maintaining warmth and cohesion.

#### UI Accent vs Content Accent

| Purpose | Variable | Color |
|---------|----------|-------|
| UI interactions | `--color-ui-accent` | Evergreen (160 38% 32%) |
| Content highlights | `--accent` | Sage (150 34% 86%) |
| Secondary interactions | `--secondary` | Warm cream (40 30% 92%) |

Dropdowns and hover states use `--secondary` (neutral) to distinguish from content highlights.

#### Entry Type Colors (Left Border)

| Entry Type | Color | Variable |
|------------|-------|----------|
| Habit | Evergreen | `--color-ui-accent` |
| Life | Sky blue | `--color-sky` (200 45% 48%) |
| Caution | Terracotta | `--color-terracotta` (20 50% 48%) |

#### Day Prompt Colors

| Prompt | Background | Icon Color |
|--------|------------|------------|
| Start your day | Amber light | Amber (45 90% 50%) |
| Close the day | Slate light | Slate (200 30% 55%) |

#### Habit Badge Colors (15 Nature Tones)

Habits can be assigned distinct colors for visual differentiation:

**Greens:** sage, forest
**Blues:** teal, ocean, sky, dusk
**Purples:** lavender, plum, orchid
**Pinks/Reds:** berry, rose, coral
**Warm tones:** sienna, copper, marigold

Each color has a base and light variant for badges.

---

### 8.3 Color System (Dark Mode)

Dark mode activates automatically 6 PM - 6 AM EST. The palette shifts to warm, cozy evening tones.

#### Foundation Colors

| Variable | HSL Value | Purpose |
|----------|-----------|---------|
| `--background` | 30 20% 10% | Page background (warm dark) |
| `--card` | 30 18% 14% | Card backgrounds |
| `--border` | 30 15% 20% | Card borders |
| `--primary` | 165 40% 50% | Primary actions (eucalyptus) |

#### Text Hierarchy (3-Tier System)

Text uses warm cream tones on hue 38:

| Tier | Variable | HSL Value | Usage |
|------|----------|-----------|-------|
| **Brightest** | `--foreground` | 38 20% 88% | Headers, stats, practice names |
| **Medium** | `--content-foreground` | 38 20% 72% | Notes, behaviors, timestamps, durations |
| **Dimmest** | `--muted-foreground` | 38 18% 58% | Actions (Edit, Highlight), secondary text |

#### UI Accent

| Purpose | Variable | Color |
|---------|----------|-------|
| UI interactions | `--color-ui-accent` | Eucalyptus (165 40% 50%) |
| Content highlights | `--accent` | Muted eucalyptus (165 25% 20%) |

#### Day Prompt Colors (Dark Mode)

| Prompt | Background | Icon Color |
|--------|------------|------------|
| Start your day | Amber light (40 55% 22%) | Amber (38 70% 55%) |
| Close the day | Slate light (215 20% 20%) | Slate (215 25% 60%) |

#### Dark Mode Input Styling

- Inputs use warm dark background: `hsl(30 18% 22%)`
- Visible borders for definition: `hsl(30 20% 32%)`
- Button variants (outline, secondary, ghost) have visible borders

---

### 8.4 Shadows & Borders

- Cards use `shadow-sm` for subtle depth
- Buttons use `shadow-sm` for consistency
- Borders are warm-toned (hue 35) at 72% lightness in light mode
- Day prompt buttons inside cards use `shadow-none` to avoid doubling

---

### 8.5 Input Fields

**Light mode:**
- Input and textarea backgrounds use `bg-white/80` for contrast against card backgrounds

**Dark mode:**
- Warm dark background (`hsl(30 18% 22%)`) instead of white
- Visible borders (`hsl(30 20% 32%)`) for definition

Focus rings use the primary color (evergreen in light, eucalyptus in dark).

---

## 9. Non-Goals

- gamification
- scoring
- streaks
- social features
- notifications
- AI judgment

---

## 10. Summary

The Shelf is a system for:
- seeing attention
- preserving memory
- enabling closure
- honoring rest
- understanding balance

It is designed to grow with you, not pressure you.

---

## 11. Implementation Status

**v1 Web Frontend: Complete (January 2026)**

All six views are fully implemented and functional:
- Shelf (Home) — 100%
- Today (Logging) — 100%
- Progress (Analysis) — 100%
- Review (Reflection) — 100%
- Attention (Structure) — 100%
- Settings — 100%

**Backend API: Complete**
- Full REST API with all endpoints
- PostgreSQL database with all tables
- Import/export with preview and duplicate detection
- Metrics calculation and aggregation

**Next Phase: SwiftUI iOS Client**
