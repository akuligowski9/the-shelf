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
  A recurring category of attention (e.g., Software, Spanish, Exercise).

- **Practice**  
  A concrete way to fulfill a habit (e.g., Walking, Textbook, Personal Project Development).

- **Target**  
  The thing I’m working on (project / milestone / idea). Targets can be active, parked, or planned.

- **Preparation**  
  A daily/weekly framing note (soft intention). Preparation is used during start-of-day planning.

- **Entry**  
  A record of what actually happened (logged event).

- **Highlight**  
  A celebratory flag on an entry.

- **Reflection**  
  A stored narrative artifact used to interpret patterns (daily/weekly/monthly/ad-hoc).

- **Parking Lot**  
  A persistent holding area for inactive items (targets, potential habits/practices, future ideas).

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

## 🧱 Tech Stack

### Web
- React
- JavaScript (no TypeScript)
- Vite dev server

### Backend
- Node.js HTTP API (REST-style)
- PostgreSQL

### Local Dev
- Docker Compose for db + api + web

---

## 🛠 Local Development

Run the full stack:

docker compose -f docker-compose.dev.yml up -d

Rebuild after dependency/config changes:

docker compose -f docker-compose.dev.yml up -d --build

Stop the stack:

docker compose -f docker-compose.dev.yml down

Reset the database (destructive):

docker compose -f docker-compose.dev.yml down -v

Endpoints:
- Web UI: http://localhost:5173
- API: http://localhost:3001
- PostgreSQL: localhost:5432

Web env var (see `frontend/web/.env.example`):
- VITE_API_BASE_URL=http://localhost:3001

---

## 🚧 Project Status

The Shelf is in active exploration.

The goal is to build a system that:
- reflects reality
- reveals patterns
- supports adjustment
- and creates reliable closure

---

## 📝 License

Personal project.  
License to be determined if shared.
