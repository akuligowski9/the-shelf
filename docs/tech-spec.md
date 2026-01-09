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
> “How did I engage this habit today?”

Examples:
- Software → Personal Project Development
- Software → Open Source
- Exercise → Walking
- Exercise → Physical Therapy

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

Preparations and closures replace the idea of warm-ups and cool-downs.

They are **intentional framing events**, not effort tracking.

Preparations:
- define what matters given reality
- can be daily or session-scoped

Closures:
- mark stopping
- provide psychological completion
- can reference the last habit or practice worked on

Properties:
- `scope`: day | session
- optional `habit_id` / `practice_id`
- `occurred_at`
- `note`

Counts of preparations and closures are meaningful indicators of:
- intentionality
- pacing
- closure hygiene

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

## 5. Primary UI Views (Contract)

Each view has a **clear responsibility**.
No view tries to do everything.

---

### 5.1 Shelf (Macro Attention Surface)

**Purpose**  
The Shelf is the home view and emotional anchor.

It exists to:
- orient you
- remind you what’s active
- invite intentional start and stop

**Displays**
- active habits (e.g. 5 / 8)
- active targets
- planned targets (upcoming)
- parked targets count
- transition window indicator
- last touched summaries
- today / week entry counts
- rest-day context (neutral)

**Interactions**
- expand habits or targets to view context
- navigate to related views
- “Start your day?”
- “Done for the day?”

**Notes**
- no editing occurs here
- calm, read-only by default
- designed to be safe to return to

---

### 5.2 Today (Action & Logging)

**Purpose**  
Today is where the day is assembled, lived, and closed.

It is the **only place** where daily actions occur.

**Displays**
- today’s preparation (if present)
- today’s entries in chronological order
- highlights surfaced inline
- closure status

**Interactions**
- add habit entries (select habit → practice)
- add life or caution entries
- add/edit notes
- edit or archive entries (including past days)
- add preparation (day or session)
- add closure (day or session)
- toggle highlight
- mark intentional rest

**Notes**
- supports imperfect memory
- corrections are allowed
- encourages return throughout the day

---

### 5.3 Progress (Balance & Patterns)

**Purpose**  
Progress exists to make attention visible over time.

It is analytical and read-only.

**Displays**
- balance view (stacked bars, calendar)
- patterns view (line charts)
- habit toggles
- practice breakdowns
- rest days
- life overlays
- caution markers
- transition markers

**Interactions**
- toggle balance ↔ patterns
- toggle habits and practices
- change time range
- drill into specific days or habits

**Notes**
- no logging here
- no editing here
- numbers are descriptive only

---

### 5.4 Review (Reflection & Accomplishments)

**Purpose**  
Review is for meaning-making and celebration.

It answers:
> “What happened — and what does it mean to me?”

**Displays**
- time range selector
- accomplishments surfaced first
  - highlighted entries
  - completed targets
  - notable moments
- optional contextual metrics
- reflection editor
- saved reflections list

**Interactions**
- toggle highlights
- write and save reflections
- browse past reflections
- reference metrics in reflection

**Notes**
- reflections are never required
- metrics never lead
- accomplishments set the tone

---

### 5.5 Attention (Targets & Habits)

**Purpose**  
Attention is where structure is managed.

This is where you decide **what gets attention at all**.

**Displays**
- list of habits (active/inactive)
- practices per habit
- targets by status
- target timelines
- calendar view of targets
- transition window status

**Interactions**
- add/edit/archive targets
- activate/deactivate habits
- manage practices
- enter/exit transition windows
- adjust target dates

**Notes**
- structural changes happen here
- transitions are initiated here
- changes explain future metrics

---

### 5.6 Settings & Data Management

**Purpose**  
Settings control system behavior, not behavior itself.

**Displays**
- preferences
- data health
- import/export status

**Interactions**
- set timezone
- adjust defaults
- import JSON data
- export full history

**Notes**
- import is forgiving
- unknown fields ignored
- history is preserved
- designed for longevity

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

Tone:
- calm
- welcoming
- grounded

Palette:
- earth tones
- soft neutrals
- muted green accents

UI avoids:
- alarms
- badges
- streak warnings

The app should feel safe to return to.

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
