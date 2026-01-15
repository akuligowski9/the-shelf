# The Shelf — To-Do List

Last updated: 2026-01-15

---

## v1 — Required for Functional Use

These items are needed before the app can be used daily.

### ~~1. Warm-up/Cool-down Template Persistence~~ DONE
**Status**: Complete

- [x] Create `habit_prompts` table (id, habit_id, type, name, content, sort_order, timestamps)
- [x] Add API endpoints: GET/POST/PUT/DELETE `/habits/:id/prompts`
- [x] Connect frontend to API (HabitsContext uses API for all template operations)

**Source**: tech-spec.md Section 3.5.1

---

### ~~2. Metrics Calculation~~ DONE
**Status**: Complete

Backend provides `/metrics/range?start=X&end=Y` for any date range (week/month/year):
- Per-habit: id, name, color, minutes, days_touched, sessions
- Totals: minutes, sessions, life/caution entries, rest days, highlights by type
- Daily breakdown for charts

Frontend ProgressView uses server-side metrics (reduced data transfer, better scalability).

**Source**: data-model.md, tech-spec.md Section 4.4

---

### ~~3. Import/Export~~ DONE
**Status**: Complete

- [x] GET `/data/export` — Returns full database as JSON (habits, practices, actions, targets, entries, preparations, closures, reflections, settings, prompts)
- [x] POST `/data/import` — Accepts full export or per-day log format, validates, upserts with duplicate detection
- [x] Frontend buttons functional with loading states and results display

**Source**: import-spec.md, tech-spec.md Section 5.6

---

## v1 Complete

All v1 items needed for functional daily use are now complete.

---

## v2 — Future Enhancements

These can wait. The app is usable without them.

### Import Practice/Action Drill Down
Extend import preview to show practice and action resolution:
- [ ] Show which practices will be matched vs created
- [ ] Show which actions will be matched vs created
- [ ] Auto-create missing practices/actions during import (optional)

**Source**: User request

---

### Template Preview with Dynamic Elements
Preview templates with variables like `{{last_session_note}}` substituted.
- [ ] Parse template content for `{{variable}}` patterns
- [ ] Fetch relevant data (last entry, etc.)
- [ ] Show preview in HabitEditDialog

**Source**: tech-spec.md Section 3.5.1

---

### ProgressView Enhancements
- [ ] Practice breakdowns — Drill into practice-level data within habits
- [ ] Calendar view — Compact grid visualization
- [ ] Transition/caution markers — Overlay on charts

**Source**: tech-spec.md Section 5.3

---

### Testing
- [ ] Playwright setup
- [ ] E2E tests: Start → Log → Close
- [ ] E2E tests: Edit history
- [ ] E2E tests: Import/export round-trip

**Source**: tech-spec.md Section 7

---

### Database Migrations
Currently using direct SQL. Consider a migration system for schema versioning.

---

## Completed (Reference)

### Frontend
- [x] ShelfView — Habits, targets, activity stats, highlights, target progress
- [x] TodayView — Entries CRUD, prep/closure, warm-up/cool-down flows
- [x] ProgressView — Balance/Patterns charts, calendar nav, habit deep dive
- [x] ReviewView — Rich text reflections, triggers, past reflections, period metrics
- [x] AttentionView — Kanban targets, tree view habits, templates UI, hash nav, transition window flow
- [x] SettingsView — Theme toggle, data health metrics

### Backend
- [x] Express.js REST API
- [x] PostgreSQL connection
- [x] All core CRUD endpoints (habits, practices, actions, targets, entries, preparations, closures, reflections, settings)
- [x] Dashboard aggregation endpoint

### Database
- [x] Core tables (habits, practices, actions, targets, entries, preparations, closures, reflections, settings)

### Infrastructure
- [x] Docker Compose for local development
- [x] PostgreSQL container
