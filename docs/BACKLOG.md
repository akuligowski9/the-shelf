# The Shelf — Backlog

> All work items for The Shelf. Items are **not commitments**; they are options to be pulled intentionally.

---

## Active / In Progress

*None currently*

---

## Planned

### SHELF-001: Import Practice/Action Drill Down
**Priority:** Medium
**Description:** Extend import preview to show practice and action resolution.

**Acceptance Criteria:**
- [ ] Show which practices will be matched vs created
- [ ] Show which actions will be matched vs created
- [ ] Auto-create missing practices/actions during import (optional)

---

### SHELF-002: Template Preview with Dynamic Elements
**Priority:** Medium
**Description:** Preview templates with variables like `{{last_session_note}}` substituted.

**Acceptance Criteria:**
- [ ] Parse template content for `{{variable}}` patterns
- [ ] Fetch relevant data (last entry, etc.)
- [ ] Show preview in HabitEditDialog

---

### SHELF-003: ProgressView Practice Breakdowns
**Priority:** Medium
**Description:** Drill into practice-level data within habits in Progress view.

**Acceptance Criteria:**
- [ ] Practice-level time breakdown per habit
- [ ] Visual representation in charts
- [ ] Filter by practice

---

### SHELF-004: ProgressView Calendar View
**Priority:** Low
**Description:** Compact grid visualization for year-at-a-glance.

**Acceptance Criteria:**
- [ ] Calendar heatmap showing daily activity
- [ ] Click to drill into day
- [ ] Color intensity based on total time

---

### SHELF-005: ProgressView Transition/Caution Markers
**Priority:** Low
**Description:** Overlay markers on charts for transitions and caution spikes.

**Acceptance Criteria:**
- [ ] Visual markers on timeline charts
- [ ] Tooltip with transition details
- [ ] Toggle markers on/off

---

### SHELF-006: Playwright E2E Testing Setup
**Priority:** Medium
**Description:** Set up Playwright and write E2E tests for critical flows.

**Acceptance Criteria:**
- [ ] Playwright configured and running
- [ ] E2E test: Start → Log → Close
- [ ] E2E test: Edit history
- [ ] E2E test: Import/export round-trip

---

### SHELF-007: Database Migrations System
**Priority:** Low
**Description:** Implement formal migration system vs direct SQL for schema versioning.

**Acceptance Criteria:**
- [ ] Migration tool selected and configured
- [ ] Existing schema converted to migrations
- [ ] Up/down migration support

---

### SHELF-008: JSON → Database Importer for Daily Logs
**Priority:** Medium
**Description:** Allow importing existing JSON daily logs into the database.

**Acceptance Criteria:**
- [ ] Script or endpoint accepts JSON log
- [ ] Entries correctly mapped to habits/targets
- [ ] Safe to run multiple times (idempotent or controlled)

---

### SHELF-009: Balance Metrics (Lightweight)
**Priority:** Low
**Description:** Derive simple balance signals (not scores) from entries and habits.

**Acceptance Criteria:**
- [ ] Metrics explain *context*, not performance
- [ ] Can answer "why was this week light?"
- [ ] No gamification or rankings

---

### SHELF-010: Calendar Framing (Programs / Time Blocks)
**Priority:** Low
**Description:** Support time-bound programs (e.g., "4 weeks of PT" or "Spanish textbook cycle").

**Acceptance Criteria:**
- [ ] Program has start/end dates
- [ ] Entries can optionally associate to a program
- [ ] Program visible as contextual framing, not obligation

---

### SHELF-011: SwiftUI Dashboard Parity Planning
**Priority:** High
**Description:** Plan how the React dashboard maps to SwiftUI.

**Acceptance Criteria:**
- [ ] List of SwiftUI views to build
- [ ] API endpoints required
- [ ] Decision on what *not* to port yet

---

### SHELF-012: React Native Mobile App
**Priority:** High
**Description:** Build full-feature-parity React Native (Expo) mobile app.

**Acceptance Criteria:**
- [ ] Expo project at frontend/mobile
- [ ] All 6 tabs implemented
- [ ] Shared API and colors with web
- [ ] Offline support

*See plan file for detailed implementation phases.*

---

### SHELF-013: GitHub Projects Integration
**Priority:** Low
**Description:** Integrate backlog with GitHub Projects for visual work management.

**Acceptance Criteria:**
- [ ] Sync backlog items to GitHub Issues
- [ ] Project board with status columns
- [ ] Bi-directional sync (optional)

*GitHub Issue: #1*

---

### SHELF-014: Re-entry Guide Documentation
**Priority:** Low
**Description:** Write a short guide for future-you on how to re-enter the project calmly.

**Acceptance Criteria:**
- [ ] One-page doc in `docs/`
- [ ] Explains current state and next good moves
- [ ] Emphasizes permission to pause or pivot

---

## Blocked

*None currently*

---

## Done

### SHELF-100: Refine Core Terminology
**Priority:** Critical | **Status:** Done

Clarified and locked in conceptual model: habit, target, practice definitions. Terminology reflected consistently in README and UI labels.

---

### SHELF-101: React Dashboard Layout Refinement
**Priority:** Critical | **Status:** Done

Refined dashboard layout with calm, scannable "Shelf" metaphor. ShelfView has expandable habits accordion, targets grouped by status, activity stats, and recent highlights.

---

### SHELF-102: Parking Lot Interaction
**Priority:** Critical | **Status:** Done

Targets can be moved via AttentionView Kanban columns (drag-drop) and ShelfView drag-drop between status groups.

---

### SHELF-103: Define and Surface Highlights
**Priority:** High | **Status:** Done

Highlights are manual (user marks entries). Visible on ShelfView and ReviewView with type-specific icons.

---

### SHELF-104: Entry Creation (Manual Logging)
**Priority:** High | **Status:** Done

Full entry CRUD in TodayView with form dialog, practice selection, duration, notes, highlighting, and archiving.

---

### SHELF-105: Warm-Up Prompt Support
**Priority:** Medium | **Status:** Done

Implemented in HabitEditDialog with collapsible template library. Templates shown as ↑ count in habit tree.

---

### SHELF-106: Cool-Down Capture
**Priority:** High | **Status:** Done

Cool-down templates managed in HabitEditDialog. Templates shown as ↓ count in habit tree.

---

### SHELF-107: Weekly Reflection View
**Priority:** Medium | **Status:** Done

ReviewView with rich text editor, triggers, past reflections, period summary stats, and accomplishments. Supports week/month/year periods.

---

### SHELF-108: Today/Yesterday Accomplishment View
**Priority:** Medium | **Status:** Done

ShelfView shows Recent Highlights, ReviewView shows Accomplishments with completed targets and highlighted entries.

---

### SHELF-109: Settings Import/Export
**Priority:** Medium | **Status:** Done

Full import/export with preview mode, pending imports UI, and file-based import workflow.

---

### SHELF-110: Warm-up/Cool-down Template Persistence
**Priority:** Critical | **Status:** Done

Created `habit_prompts` table. API endpoints for template CRUD. Frontend connected via HabitsContext.

---

### SHELF-111: Metrics Calculation
**Priority:** Critical | **Status:** Done

Backend provides `/metrics/range?start=X&end=Y` for any date range. Frontend ProgressView uses server-side metrics.

---

### SHELF-112: Import/Export System
**Priority:** Critical | **Status:** Done

GET `/data/export`, POST `/data/import` with validation, upsert, duplicate detection. Frontend buttons functional.

---

### SHELF-113: Visual Identity
**Priority:** Low | **Status:** Done

Earth-tone color palette with 15 habit badge colors. Warm sand backgrounds, evergreen accents, 3-tier brown text hierarchy. Dark mode with warm evening tones.

---

## Reference

### Priority Guide

| Priority | When to use |
|----------|-------------|
| `Critical` | Blocking other work or broken functionality |
| `High` | Important for current milestone |
| `Medium` | Should be done soon |
| `Low` | Nice to have, no urgency |

### Status Flow

```
Planned → In Progress → Done
    ↓
 Blocked
```
