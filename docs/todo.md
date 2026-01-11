# The Shelf — To-Do List

Tasks organized by priority and area. Each task includes its source.

---

## Frontend — High Priority

### AttentionView
- [ ] **Warm-up/Cool-down Template Library** — Create UI to manage warm-up and cool-down templates per habit. Users should be able to create, edit, delete, and preview templates with dynamic elements.
  - Source: tech-spec.md (Section 3.5.1, 5.5)

- [ ] **Transition Window Flow** — Implement enter/exit transition window. When in a transition window, track habit changes as a single transition event.
  - Source: README.md (Transitions section), tech-spec.md (Section 3.8)

- [ ] **Target Edit Dialog** — Add ability to edit target name and habit association.
  - Source: conversation context

- [ ] **Hash Navigation** — Support `/attention#habits` and `/attention#targets` for direct navigation from Shelf view.
  - Source: tech-spec.md (Section 5.5)

### ProgressView
- [ ] **Install Recharts** — Add recharts dependency for chart visualizations.
  - Source: tech-spec.md (Section 4.4)

- [ ] **Balance View — Stacked Bar Chart** — Daily stacked bars showing habits (color-coded), life entries, and caution behaviors.
  - Source: README.md (Metrics section), tech-spec.md (Section 4.4)

- [ ] **Patterns View — Line Charts** — One line per habit with toggle on/off. Preserve continuity across rest days.
  - Source: tech-spec.md (Section 4.4)

- [ ] **Calendar View** — Compact composition indicator per day, clicking drills into entries.
  - Source: tech-spec.md (Section 4.4)

- [ ] **Habit/Practice Toggles** — Functional toggles to show/hide habits and drill into practice breakdowns.
  - Source: tech-spec.md (Section 5.3)

- [ ] **Time Range Selector** — Functional week/month/year selector.
  - Source: tech-spec.md (Section 5.3)

- [ ] **Transition & Caution Markers** — Overlay markers on charts for transitions and caution spikes.
  - Source: tech-spec.md (Section 4.4)

### ReviewView
- [ ] **Functional Reflection Editor** — Save reflections to state/storage, load past reflections.
  - Source: tech-spec.md (Section 5.4)

- [ ] **Real Accomplishments Data** — Surface highlighted entries and completed targets from context.
  - Source: tech-spec.md (Section 5.4)

- [ ] **Time Range Selector** — Filter accomplishments and reflections by time period.
  - Source: tech-spec.md (Section 5.4)

- [ ] **Contextual Metrics** — Show relevant metrics alongside reflections.
  - Source: tech-spec.md (Section 5.4)

---

## Frontend — Medium Priority

### SettingsView
- [ ] **Import JSON** — File upload, validate structure, merge into state.
  - Source: import-spec.md, backlog.md (#16)

- [ ] **Export JSON** — Download all data as JSON following import-spec format.
  - Source: tech-spec.md (Section 5.6), backlog.md (#16)

- [ ] **Timezone Selector** — Functional timezone selection with persistence.
  - Source: tech-spec.md (Section 5.6)

### TodayView
- [ ] **Edit Past Days** — Navigation allows viewing past days, ensure editing works correctly.
  - Source: tech-spec.md (Section 5.2 - "supports imperfect memory")

### General
- [ ] **Entry persistence** — Connect entry CRUD to backend when available.
  - Source: conversation context

---

## Backend — High Priority

- [ ] **Express.js Setup** — Initialize Express app with middleware, CORS, error handling.
  - Source: README.md (Technical Overview)

- [ ] **PostgreSQL Connection** — Database connection pool, environment config.
  - Source: README.md (Technical Overview)

- [ ] **Database Migrations** — Create migration system for schema versioning.
  - Source: data-model.md

### Core Endpoints

- [ ] **Habits API** — GET /habits, POST /habits, PATCH /habits/:id
  - Source: data-model.md

- [ ] **Practices API** — GET /practices, POST /practices, PATCH /practices/:id
  - Source: data-model.md

- [ ] **Behaviors API** — GET /behaviors, POST /behaviors, PATCH /behaviors/:id
  - Source: conversation context (behaviors are a frontend concept, may need backend support)

- [ ] **Targets API** — GET /targets, POST /targets, PATCH /targets/:id
  - Source: data-model.md

- [ ] **Entries API** — GET /entries, POST /entries, PATCH /entries/:id
  - Source: data-model.md

- [ ] **Preparations API** — GET /preparations, POST /preparations
  - Source: data-model.md

- [ ] **Closures API** — GET /closures, POST /closures
  - Source: data-model.md

- [ ] **Reflections API** — GET /reflections, POST /reflections
  - Source: data-model.md

- [ ] **Warm-up Templates API** — GET /habits/:id/warmups, POST, PATCH, DELETE
  - Source: tech-spec.md (Section 3.5.1)

- [ ] **Cool-down Templates API** — GET /habits/:id/cooldowns, POST, PATCH, DELETE
  - Source: tech-spec.md (Section 3.5.1)

### Metrics & Import

- [ ] **Daily Metrics Calculation** — Compute and store daily aggregates from entries.
  - Source: data-model.md (Daily Metrics section)

- [ ] **Metrics API** — GET /metrics/daily, GET /metrics/weekly, GET /metrics/range
  - Source: data-model.md

- [ ] **Import API** — POST /import with JSON body, validate per import-spec.md
  - Source: import-spec.md

- [ ] **Export API** — GET /export, return full data as JSON
  - Source: tech-spec.md (Section 5.6)

---

## Database

- [ ] **Schema: habits** — id, name, active, target_minutes, color, sort_order, timestamps
  - Source: data-model.md

- [ ] **Schema: practices** — id, habit_id, name, active, sort_order, timestamps
  - Source: data-model.md

- [ ] **Schema: behaviors** — id, practice_id, name, active, timestamps
  - Source: conversation context

- [ ] **Schema: habit_prompts** — id, habit_id, type (warmup/cooldown), name, content, has_dynamic_elements, active
  - Source: data-model.md, tech-spec.md (Section 3.5.1)

- [ ] **Schema: targets** — id, name, status, habit_id, start_date, end_date, done_at, timestamps
  - Source: data-model.md

- [ ] **Schema: entries** — id, type, occurred_on, occurred_at, habit_id, practice_id, target_id, duration_minutes, note, is_highlight, source, archived_at, warm_up_template_id, warm_up_note, cool_down_note, timestamps
  - Source: data-model.md, tech-spec.md

- [ ] **Schema: preparations** — id, period_type, period_start, note, habit_id, target_id, rest_day, timestamps
  - Source: data-model.md

- [ ] **Schema: closures** — id, scope, occurred_at, habit_id, practice_id, note, timestamps
  - Source: data-model.md

- [ ] **Schema: reflections** — id, reflection_type, period_start, period_end, habit_id, target_id, note, timestamps
  - Source: data-model.md

- [ ] **Schema: habit_transitions** — id, started_at, ended_at, note, timestamps
  - Source: data-model.md

- [ ] **Schema: settings** — key, value (JSON), timestamps
  - Source: data-model.md

- [ ] **Schema: daily_metrics** — date, is_rest_day, totals
  - Source: data-model.md

- [ ] **Schema: daily_metric_items** — date, bucket_type, bucket_id, minutes, count
  - Source: data-model.md

---

## Infrastructure

- [ ] **Docker Compose Verification** — Test full stack startup (db, api, web).
  - Source: README.md (Local Development)

- [ ] **Database Init Scripts** — Seed scripts for initial schema and demo data.
  - Source: tech-spec.md (Section 5.6.1)

- [ ] **Live Data Logging** — JSON file per day in data/logs/YYYY-MM-DD.json
  - Source: tech-spec.md (Section 5.6.2)

---

## Testing

- [ ] **Playwright Setup** — Install and configure Playwright for E2E tests.
  - Source: tech-spec.md (Section 7)

- [ ] **Test: Start → Log → Close** — Complete daily flow.
  - Source: tech-spec.md (Section 7)

- [ ] **Test: Edit History** — Modify past entries.
  - Source: tech-spec.md (Section 7)

- [ ] **Test: Transition Windows** — Enter, make changes, exit.
  - Source: tech-spec.md (Section 7)

- [ ] **Test: Rest Day Inference** — Days with no entries show as rest days.
  - Source: tech-spec.md (Section 7)

- [ ] **Test: Import/Export** — Round-trip data integrity.
  - Source: tech-spec.md (Section 7)

- [ ] **Test: Review Persistence** — Save and load reflections.
  - Source: tech-spec.md (Section 7)

---

## Documentation

- [ ] **API Documentation** — Document all endpoints (can use api.md).
  - Source: docs/api.md (empty file exists)

- [ ] **Re-entry Guide** — One-page guide for returning to the project after time away.
  - Source: backlog.md (#13)

---

## Deferred / Future

- [ ] **SwiftUI Planning** — Map React views to SwiftUI for potential mobile app.
  - Source: backlog.md (#12)

- [ ] **Calendar Programs** — Time-bound programs (e.g., "4 weeks of PT").
  - Source: backlog.md (#11)
