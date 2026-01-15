# 📚 The Shelf

**A personal attention and life-balance companion.**

The Shelf is a system for planning attention, logging what actually happened, and reviewing balance over time. It’s a place to start and end the day—taking things off the shelf when ready, and putting them back when it’s time to stop.

This project is built for a single user (me).

The goal is not productivity, streaks, or self-optimization.  
The goal is **visibility, pattern recognition, and intentional adjustment**.

---

## 🧭 Purpose

The Shelf exists to answer practical questions:

- What do I intend to focus on today?
- What actually happened?
- Where did my time go?
- Am I balanced right now—and what is influencing that balance?
- What should I adjust next?

It supports intentional living by:
- separating plans from reality
- treating life context as first-class data
- making attention visible without moralizing it
- creating reliable closure at the end of the day

---

## 🧠 Core Philosophy

- **Reality is the source of truth**  
  Logged events outweigh planned intentions.

- **Planning is context, not obligation**  
  Plans reduce friction; they don’t create debt.

- **Numbers are neutral**  
  Metrics are descriptive, not moral.

- **Balance is observable**  
  Balance is something you can see and adjust, not “win.”

- **Closure matters**  
  Ending deliberately reduces mental carryover and supports re-entry.

---

## 🧪 Core Hypothesis

> If I plan my attention, log what actually happened, and review patterns visually (screen-time style), I can adjust more calmly and intentionally—without relying on guilt, pressure, or streaks.

Success is indicated by:
- clearer understanding of attention shifts
- faster recognition of imbalance
- easier scope/habit adjustments
- stronger sense of closure and re-entry

---

## 🧩 Canonical Definitions

These terms are used consistently throughout the project:

- **Habit**
  A recurring category of attention (e.g., Software, Spanish, Exercise). Habits have a color for visual identification and an optional target_minutes for framing (not a quota).

- **Practice**
  A concrete way to fulfill a habit (e.g., Walking, Textbook, Development). Each practice belongs to exactly one habit.

- **Behavior** (also called Action)
  A granular, trackable sub-component of a practice. Only available for habits with `track_actions` enabled (e.g., Dog Training → Drills → "Crate", "Name Recall", "Place Command"). Behaviors allow fine-grained tracking within a session.

- **Target**
  The thing I'm working on (project / milestone / idea). Targets have a status: active, planned, parked, or done. They can optionally link to a habit.

- **Preparation**
  A daily framing note (soft intention). Preparation is used during start-of-day planning. Can mark the day as a rest day.

- **Warm-up**
  A ritual or script invoked before starting a habit session. Saved as templates per habit, attached to entries when used.

- **Cool-down**
  A ritual for ending a habit session cleanly. Captures closure, next steps, and reflection. Attached to entries.

- **Entry**
  A record of what actually happened (logged event). Three types: habit (with optional practice, behaviors), life (contextual events), and caution (behaviors to monitor). Entries can be highlighted and have warm-ups/cool-downs attached.

- **Highlight**
  A celebratory flag on an entry. Highlights surface in the Accomplishments section of Review.

- **Reflection**
  A stored narrative artifact used to interpret patterns. Can be triggered by prompts, metrics, accomplishments, or targets. Supports rich text formatting.

- **Transition**
  A structural change to attention allocation (activating/deactivating habits, adding practices). Transitions explain why patterns shift over time.

- **Parking Lot**
  A persistent holding area for inactive items (targets, potential habits/practices, future ideas). Parked items are preserved but not active.

---

## 🎯 Targets: Active, Parked, Planned (Single Model)

Targets replace the older “program/cycle” concept.

A target is classified by its scheduling fields:

- **Active**  
  Target is in the current time window (today or “current period”).
  - Example: a target scheduled for this week/month.

- **Planned**  
  Target is time-boxed in the future.
  - Example: start/end dates set for next month.

- **On the Shelf (Unscheduled)**  
  Target has no time box (no start/end). It is available, but not currently scheduled.

- **Parked**  
  Target is intentionally inactive but preserved for later review.

This keeps the model simple:
- one noun
- one table
- easy filtering and visualization

---

## 📝 Entries: What Actually Happened

Entries are first-class records of reality. They are intentionally typed because context matters.

### Entry Types

- **Habit (Practice) Entries**  
  Time spent doing a Practice for a Habit.
  - measured in minutes (optional if unknown)
  - supports notes and highlights

- **Life Events**  
  Contextual events that affect attention (family, travel, social, obligations).
  - may be time-based or just noted
  - included in balance visualizations

- **Caution Behaviors**  
  Behaviors tracked for awareness and pattern recognition.
  - counted by occurrence
  - optionally time-based
  - used as overlays in charts

- **Transitions**  
  Structural changes to attention allocation.
  - counted by occurrence
  - used as markers/overlays
  - helps explain shifts over time

### Transitions (Refined)

Transitions are **changes to structure**, not movement.

Examples:
- reducing weekly habit count from 5 to 4
- swapping one habit for another
- sustained divergence between planned habits and actual habits
- changing the way a habit is practiced (practice swap over time)

Transitions exist to explain *why* attention patterns changed.

---

## ⭐ Highlights & Celebration

The Shelf includes a dedicated **Accomplishments** view.

- Any entry can be flagged as a **Highlight**
- Accomplishments are generated from:
  - entries (especially highlights)
  - completed targets
  - meaningful life events
  - notable transitions

Accomplishments are reviewable by:
- day
- week
- month
- year

Celebration is a core feature: it’s how the system remains sustainable.

---

## 📊 Metrics & Balance Visualization (Screen Time–Style)

Metrics are a core feature. The model is inspired by **iOS Screen Time**: factual, visual, neutral.

### What is measured daily

Habits, life events, caution behaviors, and transitions are treated as **peer signals**.

- **Habits (time-based)**  
  total minutes per habit per day
- **Life Events (time-based or noted)**  
  minutes (when available) + notes
- **Caution Behaviors (occurrence-based)**  
  counts per day (and optional minutes)
- **Transitions (occurrence-based)**  
  counts per day/week (markers)

### Key visualizations

- **Daily stacked bar chart** (screen-time style)
  - color-coded segments represent time by habit and life events
  - caution behaviors and transitions appear as overlays/markers

- **Weekly / Monthly rollups**
  - totals per habit (e.g., “Spanish: 10–15 hours this week”)
  - trend lines for shifts over time

- **Calendar view**
  - each day can be color-coded by distribution
  - optional pie chart per day to visualize time allocation

### Balance view

A dedicated Balance view answers:
- “Am I balanced right now?”
- “What shifted?”
- “What is influencing the distribution?”

This is descriptive: patterns, not judgment.

---

## 🗓 Daily Workflow (Ritual)

### Start of Day (Preparation + Plan)
- Review active targets (current window)
- Add **Preparation** (soft intention for today)
- Assemble the day:
  - choose which habits are in play today
  - choose candidate practices for each habit
  - optionally select targets to focus on

Planning is lightweight and reversible. It exists to reduce friction.

### End of Day (Closure + Accomplishments)
- Log entries (what actually happened)
- Flag highlights
- Review accomplishments for the day
- Optional reflection
- **Closure**:
  - note what changed
  - park items intentionally if needed
  - record next-step context so tomorrow starts cleanly

Closure is a first-class goal. Ending deliberately supports re-entry.

---

## 🧠 Reflections

Reflections are stored, reviewable artifacts.

They can be created:
- daily
- weekly
- monthly
- ad hoc (after a transition or meaningful day)

Reflections interpret patterns; they do not replace metrics.

---

## 🧺 Parking Lot

The Parking Lot is persistent and reviewable.

It can store:
- targets not ready to schedule
- future habits/practices ideas
- “maybe later” concepts
- items waiting for more clarity

Parking preserves intent without demanding action.

---

## 📥 JSON Import

The Shelf supports importing manually created JSON logs.

Imported logs:
- become first-class entries
- contribute to metrics
- appear in accomplishments and reflections
- support retroactive capture and experimentation

---

## 🗂 Data Model (Conceptual Relationships)

- **Habit** → has many **Practices**
- **Target** → may be unscheduled (on shelf), planned (time-boxed), active (current window), or parked
- **Entry** → typed event (habit/practice, life event, caution behavior, transition)
- **Highlight** → flag on an Entry
- **Reflection** → stored narrative over a date range
- **Parking Lot Item** → stored inactive item (reviewable)
- **Metrics** → stored daily aggregates (time and counts) + visualizations

Single-user system. No auth required.

---

## 🧱 Technical Overview

This section provides a high-level summary of the system's architecture and technology choices, derived from the detailed [Technical Specification](./docs/tech-spec.md).

### Technology Stack

-   **Backend**: Node.js REST-style API using Express.js
-   **Database**: PostgreSQL (running in Docker)
-   **Frontend**: React 19 with Vite, shadcn/ui components, Tailwind CSS
-   **Charts**: Recharts for Balance/Patterns visualizations
-   **Rich Text**: Tiptap for reflection editing
-   **Drag & Drop**: @hello-pangea/dnd for Kanban boards and reordering
-   **Containerization**: Docker Compose for local development

### System Architecture

The system is designed as a classic three-tier application, containerized for consistent and easy local development. The architecture emphasizes long-term data integrity and a clear separation of concerns between its primary UI views.

#### UI Views (The 6 Core Surfaces) — All Complete

The user interface is broken down into six distinct views, each with a single responsibility:

1.  **Shelf (Home)**: The orientation dashboard. Expandable habits accordion showing practices and behaviors. Targets grouped by status (Active/Planned/Parked) with drag-drop reordering. Activity stats for Today/Week/Month. Recent Highlights section. Navigation to other views.

2.  **Today (Logging)**: The action view for daily events. Date navigation to view/edit past days. Full entry CRUD with type selection (habit/life/caution). Day Preparation and Closure cards with rest day support. Session dropdown for warm-up/cool-down flows. Behaviors displayed for habits with track_actions enabled.

3.  **Progress (Analysis)**: The analytical view with two lenses:
    - **Balance**: Stacked bar charts showing time distribution by habit
    - **Patterns**: Line charts showing trends over time
    - Time range selection (Week/Month/Year) with calendar navigation
    - Habit toggles to show/hide in charts
    - Period comparison stats (current vs previous)
    - **Balance Shift**: Shows how time allocation percentages changed
    - **Habit Deep Dive**: Sessions, gaps, hours breakdown for selected habit

4.  **Review (Reflection)**: The meaning-making view. Accomplishments section showing highlights and completed targets with type-specific icons (habit/life/caution). Rich text reflection editor with triggers (prompts, metrics, accomplishments, targets). Past reflections with context. Period summary stats.

5.  **Attention (Structure)**: The management view. Tree-style habits list with inline add/edit. Practices nested under habits with behavior counts. Warm-up/cool-down template library per habit. Targets Kanban board (Active/Planned/Parked/Done) with drag-drop between columns. Transition window flow for structural changes.

6.  **Settings**: Theme selector (light/dark/auto). Timezone configuration. Data Health metrics with 8 collapsible sections (Habits Coverage, Practices by Habit, etc.). Full import/export with preview mode and duplicate detection. Pending imports UI for files in data/imports folder.

#### Data Model & Integrity

-   **Core Principle**: History is sacred. Nothing is ever hard-deleted. Data is archived to preserve historical accuracy for long-term review.
-   **Source of Truth**: The `entries` table is the canonical ledger of what actually happened. All metrics and visualizations are derived from it.
-   **Canonical Structure**: `data/habits.json` defines the baseline habit/practice/action structure. Log files can extend this via transitions.
-   **Data Import**: Supports both full database export format and per-day log files. Preview mode with duplicate detection. Imported files move to data/logs/ after successful import.

---

## 🛠 Local Development

Run the full stack:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Rebuild after dependency/config changes:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Stop the stack:

```bash
docker compose -f docker-compose.dev.yml down
```

Reset the database (destructive):

```bash
docker compose -f docker-compose.dev.yml down -v
```

**Endpoints:**

-   **Web UI**: `http://localhost:5173`
-   **API**: `http://localhost:3001`
-   **PostgreSQL**: `localhost:5432`

**Web Environment (see `frontend/web/.env.example`):**

-   `VITE_API_BASE_URL=http://localhost:3001`

### Demo Data

The `data/logs/demo` directory contains a set of 12 sample JSON import files. These can be used to populate the system with realistic data for testing and exploration. The import functionality is available in the application's settings view.

### Live Data Logging

In addition to demo data, the application creates a live log of daily activities. For each day an entry is made, a corresponding JSON file is generated in the `data/logs/` directory. These logs follow the `Entry` format described in the project's data model documentation and serve as a human-readable, file-based backup of all activities, supplementing the primary PostgreSQL database.

---

## 🚧 Project Status

**v1 Web Frontend: Complete**

All six views are fully functional:
- Shelf, Today, Progress, Review, Attention, Settings — 100% complete
- Full habit/practice/behavior management
- Entry logging with warm-up/cool-down flows
- Balance and Patterns analysis with charts
- Rich text reflections with triggers
- Import/export with preview and data health

**Next: SwiftUI iOS client**

The goal remains to build a system that:
- reflects reality
- reveals patterns
- supports adjustment
- and creates reliable closure

---

## 📝 License

Personal project.  
License to be determined if shared.
