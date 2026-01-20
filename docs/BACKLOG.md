# The Shelf — Backlog

> Source of truth for committed work. Items are options to be pulled intentionally.

---

## Status Flow

```
Planned → In Progress → Done
              ↓
           Blocked
              ↓
           Archived
```

---

## Critical

*No critical items.*

---

## High

## SHELF-001: Mobile Phase 7: Polish

### Description

Final polish for React Native mobile app. Offline queue and sync, error handling improvements. Haptics and swipe actions already done.

### Acceptance Criteria

- [ ] Offline queue persists mutations when network unavailable
- [ ] Sync resolves when connectivity restored
- [ ] Error handling shows user-friendly messages
- [ ] Edge cases handled gracefully (empty states, loading, failures)

### Metadata

- **Status:** In Progress
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## Medium

## SHELF-002: Link Targets to GitHub Issues

### Description

Add optional `github_issue_url` field to targets. Display issue status/link in UI. Enable tracking software targets alongside GitHub issues.

### Acceptance Criteria

- [ ] Targets schema includes `github_issue_url` field
- [ ] Target edit form includes GitHub Issue URL input
- [ ] UI displays clickable link to GitHub issue when set
- [ ] Issue status fetched and displayed (optional enhancement)

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-003: Import Practice/Action Drill Down

### Description

Extend import preview to show practice and action resolution. Auto-create missing practices/actions during import.

### Acceptance Criteria

- [ ] Import preview shows practice/action resolution status
- [ ] Missing practices/actions flagged in preview
- [ ] Import auto-creates missing practices/actions when confirmed
- [ ] User can review what will be created before import

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-004: Template Preview with Dynamic Elements

### Description

Preview templates with variables like `{{last_session_note}}` substituted. Parse and fetch relevant data in HabitEditDialog.

### Acceptance Criteria

- [ ] Template preview shows substituted variables
- [ ] Variables like `{{last_session_note}}` fetch real data
- [ ] Preview updates as template is edited
- [ ] Unsupported variables shown with placeholder or warning

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #2

---

## SHELF-005: ProgressView Practice Breakdowns

### Description

Drill into practice-level data within habits in Progress view. Visual representation in charts with filter by practice.

### Acceptance Criteria

- [ ] Progress view shows practice-level breakdown for selected habit
- [ ] Charts visualize time per practice
- [ ] Filter allows selecting specific practices
- [ ] Drill-down from habit to practices is intuitive

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## Low

## SHELF-006: ProgressView Calendar View

### Description

Compact grid visualization for year-at-a-glance. Calendar heatmap with click to drill into day.

### Acceptance Criteria

- [ ] Calendar heatmap displays year-at-a-glance
- [ ] Color intensity indicates activity level
- [ ] Clicking a day drills into that day's details
- [ ] Navigation between years supported

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #3

---

## SHELF-007: ProgressView Transition/Caution Markers

### Description

Overlay markers on charts for transitions and caution spikes. Visual markers with tooltips on timeline charts.

### Acceptance Criteria

- [ ] Transition events marked on timeline charts
- [ ] Caution spikes highlighted visually
- [ ] Tooltips show details on hover/tap
- [ ] Markers are toggleable

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #4

---

## SHELF-008: Database Migrations System

### Description

Implement formal migration system vs direct SQL for schema versioning. Up/down migration support.

### Acceptance Criteria

- [ ] Migration files track schema changes
- [ ] Up migrations apply changes
- [ ] Down migrations revert changes
- [ ] Migration state tracked in database
- [ ] CLI command to run migrations

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Maintenance
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-009: Calendar Framing (Programs / Time Blocks)

### Description

Support time-bound programs (e.g., "4 weeks of PT", "30-day challenge"). Programs have start/end dates and link to a habit. Entries within the timeframe auto-associate. Progress view can filter by program. Schema (`programs` table), API (CRUD + query), UI (Attention create/edit, Shelf progress indicator, Progress filter, Today badge).

### Acceptance Criteria

- [ ] Programs table created with start/end dates, habit link
- [ ] CRUD API for programs
- [ ] Entries within program dates auto-associate
- [ ] Progress view filters by program
- [ ] UI for creating/editing programs in Attention view
- [ ] Program progress indicator on Shelf view

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #5

---

## SHELF-036: Unit Tests

### Description

Add unit tests for utility functions, hooks, and API handlers. Currently only E2E tests exist. Unit tests run faster, catch bugs earlier, and make contributions safer.

### Acceptance Criteria

- [ ] Jest configured for web frontend
- [ ] Unit tests for utility functions (date formatting, calculations)
- [ ] Unit tests for custom hooks
- [ ] Unit tests for API route handlers (backend)
- [ ] Coverage reporting configured

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Maintenance
- **Version:** Unassigned
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-037: Demo Mode

### Description

Create a demo mode with sample data so visitors can explore the app from the README without setting up a backend. Includes deployment planning and OPS updates.

### Acceptance Criteria

- [ ] Demo data seed script or fixtures
- [ ] Demo mode toggle or separate demo deployment
- [ ] README links to live demo
- [ ] OPS.md updated with deployment instructions
- [ ] Demo resets periodically or is read-only

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-038: Loading Skeletons

### Description

Add consistent skeleton loading states across all views. Some exist but coverage is not comprehensive.

### Acceptance Criteria

- [ ] Skeleton components for cards, lists, charts
- [ ] All views show skeletons during initial load
- [ ] Skeletons match actual content layout
- [ ] Works in both light and dark mode

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-039: Search Entries

### Description

Add search functionality to find entries by note content and filter by date range. Essential as user data grows.

### Acceptance Criteria

- [ ] Search input available in TodayView or dedicated search view
- [ ] Search matches entry note content (case-insensitive)
- [ ] Date range filter (from/to dates)
- [ ] Results show matching entries with highlighted matches
- [ ] Search works on both web and mobile

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #6

---

## SHELF-040: Accessibility Improvements

### Description

Improve accessibility across the application with proper ARIA labels, keyboard navigation, focus management, and screen reader support.

### Acceptance Criteria

- [ ] All interactive elements have appropriate ARIA labels
- [ ] Focus states are visible and follow logical order
- [ ] Keyboard navigation works for all core flows
- [ ] Screen reader announces dynamic content changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Forms have proper labels and error announcements

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #7

---

## SHELF-041: PWA Support

### Description

Make the web app installable as a Progressive Web App with offline capability and app-like experience.

### Acceptance Criteria

- [ ] Web app manifest configured (name, icons, theme color)
- [ ] Service worker caches static assets
- [ ] App is installable on desktop and mobile browsers
- [ ] Offline indicator shown when network unavailable
- [ ] Basic offline functionality (view cached data)

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #8

---

## SHELF-042: PDF Summary Reports

### Description

Generate PDF reports summarizing activity over a time period. Useful for personal review, sharing with coaches/therapists, or archival.

### Acceptance Criteria

- [ ] Export button in Progress or Review view
- [ ] Period selection (week, month, custom range)
- [ ] PDF includes: time breakdown by habit, entry counts, highlights, reflection content
- [ ] Clean, readable layout suitable for printing
- [ ] Works on web (mobile can share/download)

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #9

---

## SHELF-043: Storybook Component Documentation

### Description

Set up Storybook for documenting and visually testing UI components. Helps contributors understand the component library and catch visual regressions.

### Acceptance Criteria

- [ ] Storybook configured for React (web frontend)
- [ ] Stories for core UI components (Button, Card, Badge, Input, etc.)
- [ ] Stories show component variants and states
- [ ] Dark mode toggle in Storybook
- [ ] Deployment to static hosting (optional)

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Maintenance
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #10

---

## SHELF-044: Notifications and Reminders

### Description

Add optional notifications to remind users to log entries, complete reflections, or maintain habits. Must be fully configurable via settings and off by default.

### Acceptance Criteria

- [ ] Settings toggle to enable/disable notifications (off by default)
- [ ] Daily reminder time configurable
- [ ] Weekly reflection reminder (configurable day/time)
- [ ] Push notifications on mobile (Expo notifications)
- [ ] Browser notifications on web (with permission request)
- [ ] Notification preferences persist to database
- [ ] Tests cover notification scheduling and settings

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** #11

---

## Parking Lot

*Ideas not yet actionable. May be promoted or discarded.*

### Undo/Redo for Entry Operations

Reversible actions for entry create, edit, delete, archive. Could use command pattern or state snapshots. Unclear if complexity is worth it for this use case.

---

## Archived

## SHELF-010: SwiftUI Dashboard Parity Planning

### Description

Plan how the React dashboard maps to SwiftUI. Identify views, API needs, and what not to port yet. Superseded by React Native mobile app (SHELF-026 through SHELF-031).

### Acceptance Criteria

- [ ] N/A - Archived

### Metadata

- **Status:** Archived
- **Priority:** High
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Alex
- **GitHub Issue:** No

---

## Done

## SHELF-011: Refine Core Terminology

### Description

Clarified and locked in conceptual model: habit, target, practice definitions. Terminology reflected consistently in README and UI.

### Acceptance Criteria

- [x] Terminology documented in TECH_SPEC.md
- [x] README uses consistent terminology
- [x] UI labels match documented terms

### Metadata

- **Status:** Done
- **Priority:** Critical
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-012: React Dashboard Layout Refinement

### Description

Refined dashboard layout with calm, scannable "Shelf" metaphor. Expandable habits accordion, targets grouped by status, activity stats.

### Acceptance Criteria

- [x] Habits displayed in expandable accordion
- [x] Targets grouped by status
- [x] Activity stats visible on dashboard
- [x] Layout supports scanning at a glance

### Metadata

- **Status:** Done
- **Priority:** Critical
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-013: Parking Lot Interaction

### Description

Targets can be moved via AttentionView Kanban columns (drag-drop) and ShelfView drag-drop between status groups.

### Acceptance Criteria

- [x] Kanban columns in AttentionView support drag-drop
- [x] ShelfView supports drag-drop between status groups
- [x] Status updates persist to database

### Metadata

- **Status:** Done
- **Priority:** Critical
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-014: Define and Surface Highlights

### Description

Highlights are manual (user marks entries). Visible on ShelfView and ReviewView with type-specific icons.

### Acceptance Criteria

- [x] Entries can be marked as highlights
- [x] Highlights visible on ShelfView
- [x] Highlights visible in ReviewView
- [x] Type-specific icons displayed

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-015: Entry Creation (Manual Logging)

### Description

Full entry CRUD in TodayView with form dialog, practice selection, duration, notes, highlighting, and archiving.

### Acceptance Criteria

- [x] Create entries via form dialog
- [x] Edit existing entries
- [x] Delete entries
- [x] Archive entries
- [x] Practice selection, duration, notes supported
- [x] Highlight toggle available

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-016: Warm-Up Prompt Support

### Description

Implemented in HabitEditDialog with collapsible template library. Templates shown as count in habit tree.

### Acceptance Criteria

- [x] Warm-up templates manageable in HabitEditDialog
- [x] Template library is collapsible
- [x] Template count shown in habit tree

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-017: Cool-Down Capture

### Description

Cool-down templates managed in HabitEditDialog. Templates shown as count in habit tree.

### Acceptance Criteria

- [x] Cool-down templates manageable in HabitEditDialog
- [x] Template count shown in habit tree

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-018: Weekly Reflection View

### Description

ReviewView with rich text editor, triggers, past reflections, period summary stats, and accomplishments. Supports week/month/year.

### Acceptance Criteria

- [x] Rich text editor for reflections
- [x] Triggers section available
- [x] Past reflections viewable
- [x] Period summary stats displayed
- [x] Accomplishments section
- [x] Week/month/year periods supported

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-019: Today/Yesterday Accomplishment View

### Description

ShelfView shows Recent Highlights, ReviewView shows Accomplishments with completed targets and highlighted entries.

### Acceptance Criteria

- [x] Recent Highlights on ShelfView
- [x] Accomplishments section in ReviewView
- [x] Completed targets displayed
- [x] Highlighted entries displayed

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-020: Settings Import/Export

### Description

Full import/export with preview mode, pending imports UI, and file-based import workflow.

### Acceptance Criteria

- [x] Export all data to JSON file
- [x] Import from JSON file
- [x] Preview mode shows what will be imported
- [x] Pending imports UI for review
- [x] Duplicate detection

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-021: Warm-up/Cool-down Template Persistence

### Description

Created `habit_prompts` table. API endpoints for template CRUD. Frontend connected via HabitsContext.

### Acceptance Criteria

- [x] habit_prompts table in database
- [x] CRUD API endpoints for templates
- [x] Frontend loads and saves templates
- [x] Templates persist across sessions

### Metadata

- **Status:** Done
- **Priority:** Critical
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-022: Metrics Calculation

### Description

Backend provides `/metrics/range?start=X&end=Y` for any date range. Frontend ProgressView uses server-side metrics.

### Acceptance Criteria

- [x] /metrics/range endpoint returns metrics for date range
- [x] Metrics include habit minutes, life minutes, caution count
- [x] ProgressView consumes server-side metrics

### Metadata

- **Status:** Done
- **Priority:** Critical
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-023: Import/Export System

### Description

GET `/data/export`, POST `/data/import` with validation, upsert, duplicate detection. Frontend buttons functional.

### Acceptance Criteria

- [x] /data/export returns full data export
- [x] /data/import accepts and processes import
- [x] Validation prevents bad data
- [x] Duplicate detection prevents duplicates
- [x] Frontend export/import buttons work

### Metadata

- **Status:** Done
- **Priority:** Critical
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-024: Visual Identity

### Description

Earth-tone color palette with 15 habit badge colors. Warm sand backgrounds, evergreen accents, 3-tier brown text hierarchy. Dark mode.

### Acceptance Criteria

- [x] Earth-tone color palette implemented
- [x] 15 habit badge colors available
- [x] Dark mode supported
- [x] Consistent visual hierarchy

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-025: Playwright E2E Testing Setup

### Description

Set up Playwright and write E2E tests for critical flows: Start → Log → Close, Edit history, Import/export round-trip. 11 test files in frontend/web/tests/ covering navigation, entries, attention, shelf, settings, reflections, metrics, import/export.

### Acceptance Criteria

- [x] Playwright configured
- [x] Navigation tests pass
- [x] Entry CRUD tests pass
- [x] Import/export tests pass
- [x] Critical user flows covered

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Maintenance
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-026: Mobile Phase 1: Foundation

### Description

Create Expo project, setup Expo Router with 6 tabs, create shared API/colors/types, Zustand stores, base UI components.

### Acceptance Criteria

- [x] Expo project created at frontend/mobile
- [x] Expo Router with 6 tabs configured
- [x] frontend/shared with API, colors, types
- [x] Zustand stores for habits, entries, theme
- [x] Base UI components (Button, Card, Badge, Input)

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-027: Mobile Phase 2: Today View

### Description

Date navigator, entry list with pull-to-refresh, entry form modal, day stats, preparation/closure modals.

### Acceptance Criteria

- [x] Date navigator component
- [x] Entry list with pull-to-refresh
- [x] Entry form modal
- [x] Day stats summary
- [x] Preparation modal
- [x] Closure modal

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-028: Mobile Phase 3: Shelf View

### Description

Target cards with status badges, draggable target list, expandable habit sections, activity stats.

### Acceptance Criteria

- [x] Target cards with status badges
- [x] Draggable target list
- [x] Expandable habit sections
- [x] Activity stats displayed

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-029: Mobile Phase 4: Attention View

### Description

Habits management (add/edit/delete), practices and actions management, targets Kanban with drag between columns.

### Acceptance Criteria

- [x] Habits CRUD
- [x] Practices and actions CRUD
- [x] Targets Kanban view
- [x] Drag between Kanban columns

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-030: Mobile Phase 5: Progress View

### Description

Period selector, bar charts with Victory Native, time split visualization, habit filters.

### Acceptance Criteria

- [x] Period selector (week/month/year)
- [x] Bar charts with Victory Native
- [x] Time split visualization
- [x] Habit filters

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-031: Mobile Phase 6: Review & Settings

### Description

Period metrics summary, reflection editor, settings (theme, timezone), data export/import.

### Acceptance Criteria

- [x] Period metrics summary
- [x] Reflection editor
- [x] Theme settings
- [x] Timezone settings
- [x] Data export/import

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-032: JSON → Database Importer for Daily Logs

### Description

Allow importing existing JSON daily logs into the database. Safe to run multiple times (idempotent or controlled). Covered by existing import/export system (SHELF-020, SHELF-023).

### Acceptance Criteria

- [x] JSON logs can be imported
- [x] Import is idempotent
- [x] Duplicate detection prevents double-imports

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-033: GitHub Integration

### Description

Integrate with GitHub Issues for work tracking and collaboration. Issues workflow established. Projects board not needed.

### Acceptance Criteria

- [x] GitHub Issues used for tracking
- [x] Workflow documented
- [x] Integration functional

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Maintenance
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** #1

---

## SHELF-034: Re-entry Guide

### Description

Documentation for re-entering the project after a break. INSTRUCTIONS.md and PROGRESS.md serve this purpose.

### Acceptance Criteria

- [x] INSTRUCTIONS.md provides session start guidance
- [x] PROGRESS.md tracks where work left off
- [x] Re-entry workflow documented

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Maintenance
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-035: Balance Metrics (Lightweight)

### Description

Derive simple balance signals (not scores) from entries and habits. Metrics explain context without gamification. Implemented in ProgressView balance mode with time split, trends, neglected habits, active days.

### Acceptance Criteria

- [x] Time split visualization
- [x] Trend indicators
- [x] Neglected habits highlighted
- [x] Active days tracked
- [x] No gamification or scores

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No
