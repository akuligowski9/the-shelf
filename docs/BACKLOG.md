# The Shelf — Backlog

> Source of truth for committed work. Items are options to be pulled intentionally.

---

## Status Flow

```
Planned → In Progress → Done
              ↓
           Blocked
```

---

## Critical

*No critical items.*

---

## High

- [ ] SHELF-011 SwiftUI Dashboard Parity Planning
  - Description: Plan how the React dashboard maps to SwiftUI. Identify views, API needs, and what not to port yet.
  - Status: Planned
  - Priority: High
  - Assignee: Alex
  - GitHub Issue: No

- [ ] SHELF-012 React Native Mobile App
  - Description: Build full-feature-parity React Native (Expo) mobile app with all 6 tabs, shared API and colors, offline support.
  - Status: Planned
  - Priority: High
  - Assignee: Alex
  - GitHub Issue: No
  - Notes: See plan file for detailed implementation phases.

---

## Medium

- [ ] SHELF-001 Import Practice/Action Drill Down
  - Description: Extend import preview to show practice and action resolution. Auto-create missing practices/actions during import.
  - Status: Planned
  - Priority: Medium
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-002 Template Preview with Dynamic Elements
  - Description: Preview templates with variables like `{{last_session_note}}` substituted. Parse and fetch relevant data in HabitEditDialog.
  - Status: Planned
  - Priority: Medium
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-003 ProgressView Practice Breakdowns
  - Description: Drill into practice-level data within habits in Progress view. Visual representation in charts with filter by practice.
  - Status: Planned
  - Priority: Medium
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-006 Playwright E2E Testing Setup
  - Description: Set up Playwright and write E2E tests for critical flows: Start → Log → Close, Edit history, Import/export round-trip.
  - Status: Planned
  - Priority: Medium
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-008 JSON → Database Importer for Daily Logs
  - Description: Allow importing existing JSON daily logs into the database. Safe to run multiple times (idempotent or controlled).
  - Status: Planned
  - Priority: Medium
  - Assignee: Unassigned
  - GitHub Issue: No

---

## Low

- [ ] SHELF-004 ProgressView Calendar View
  - Description: Compact grid visualization for year-at-a-glance. Calendar heatmap with click to drill into day.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-005 ProgressView Transition/Caution Markers
  - Description: Overlay markers on charts for transitions and caution spikes. Visual markers with tooltips on timeline charts.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-007 Database Migrations System
  - Description: Implement formal migration system vs direct SQL for schema versioning. Up/down migration support.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-009 Balance Metrics (Lightweight)
  - Description: Derive simple balance signals (not scores) from entries and habits. Metrics explain context without gamification.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-010 Calendar Framing (Programs / Time Blocks)
  - Description: Support time-bound programs (e.g., "4 weeks of PT"). Program has start/end dates, entries can associate to it.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: No

- [ ] SHELF-013 GitHub Projects Integration
  - Description: Integrate backlog with GitHub Projects for visual work management. Sync backlog items to GitHub Issues.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: #1

- [ ] SHELF-014 Re-entry Guide Documentation
  - Description: Write a short guide for future-you on how to re-enter the project calmly. One-page doc emphasizing permission to pause.
  - Status: Planned
  - Priority: Low
  - Assignee: Unassigned
  - GitHub Issue: No

---

## Parking Lot

*Ideas not yet actionable. May be promoted or discarded.*

*Empty.*

---

## Done

- [x] SHELF-100 Refine Core Terminology
  - Description: Clarified and locked in conceptual model: habit, target, practice definitions. Terminology reflected consistently in README and UI.
  - Status: Done
  - Priority: Critical
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-101 React Dashboard Layout Refinement
  - Description: Refined dashboard layout with calm, scannable "Shelf" metaphor. Expandable habits accordion, targets grouped by status, activity stats.
  - Status: Done
  - Priority: Critical
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-102 Parking Lot Interaction
  - Description: Targets can be moved via AttentionView Kanban columns (drag-drop) and ShelfView drag-drop between status groups.
  - Status: Done
  - Priority: Critical
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-103 Define and Surface Highlights
  - Description: Highlights are manual (user marks entries). Visible on ShelfView and ReviewView with type-specific icons.
  - Status: Done
  - Priority: High
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-104 Entry Creation (Manual Logging)
  - Description: Full entry CRUD in TodayView with form dialog, practice selection, duration, notes, highlighting, and archiving.
  - Status: Done
  - Priority: High
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-105 Warm-Up Prompt Support
  - Description: Implemented in HabitEditDialog with collapsible template library. Templates shown as count in habit tree.
  - Status: Done
  - Priority: Medium
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-106 Cool-Down Capture
  - Description: Cool-down templates managed in HabitEditDialog. Templates shown as count in habit tree.
  - Status: Done
  - Priority: High
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-107 Weekly Reflection View
  - Description: ReviewView with rich text editor, triggers, past reflections, period summary stats, and accomplishments. Supports week/month/year.
  - Status: Done
  - Priority: Medium
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-108 Today/Yesterday Accomplishment View
  - Description: ShelfView shows Recent Highlights, ReviewView shows Accomplishments with completed targets and highlighted entries.
  - Status: Done
  - Priority: Medium
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-109 Settings Import/Export
  - Description: Full import/export with preview mode, pending imports UI, and file-based import workflow.
  - Status: Done
  - Priority: Medium
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-110 Warm-up/Cool-down Template Persistence
  - Description: Created `habit_prompts` table. API endpoints for template CRUD. Frontend connected via HabitsContext.
  - Status: Done
  - Priority: Critical
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-111 Metrics Calculation
  - Description: Backend provides `/metrics/range?start=X&end=Y` for any date range. Frontend ProgressView uses server-side metrics.
  - Status: Done
  - Priority: Critical
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-112 Import/Export System
  - Description: GET `/data/export`, POST `/data/import` with validation, upsert, duplicate detection. Frontend buttons functional.
  - Status: Done
  - Priority: Critical
  - Assignee: Alex
  - GitHub Issue: No

- [x] SHELF-113 Visual Identity
  - Description: Earth-tone color palette with 15 habit badge colors. Warm sand backgrounds, evergreen accents, 3-tier brown text hierarchy. Dark mode.
  - Status: Done
  - Priority: Low
  - Assignee: Alex
  - GitHub Issue: No
