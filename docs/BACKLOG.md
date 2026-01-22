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

> **Active Work (In Progress):**
> - SHELF-001: Mobile Polish - implementation & docs complete, loading skeletons added (SHELF-038), testing remains (Terminal A)
> - SHELF-046: OAuth Authentication - needs prod testing (Terminal B)
> - SHELF-047: Demo Data Separation - demo DB seeded, needs deployment (Terminal B)
> - SHELF-049: Mutation Logging - needs backend deploy (Terminal B)
> - SHELF-048: Data Recovery - needs to run recovery SQL (Terminal B)

## SHELF-001: Mobile Phase 7: Polish

### Description

The React Native mobile app is feature-complete but needs final polish before release. The primary gap is offline support - when users lose connectivity, mutations should queue locally and sync when the connection is restored. Error handling also needs improvement to show user-friendly messages instead of generic failures. Haptic feedback and swipe actions on entry cards have already been implemented.

### Acceptance Criteria

- [x] Offline queue persists mutations when network unavailable
- [x] Sync resolves when connectivity restored
- [x] Error handling shows user-friendly messages
- [ ] Edge cases tested (long offline periods, app backgrounding, queue persistence)

### Metadata

- **Status:** In Progress
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex (Terminal A)
- **GitHub Issue:** No

### Notes

Implementation and documentation complete (2026-01-22). Remaining work to finish edge cases:
- ✅ Core offline queue system with AsyncStorage persistence
- ✅ Network monitoring and auto-sync
- ✅ User-friendly error handling with toasts
- ✅ All 6 screens updated (today, attention, shelf, progress, review, settings)
- ✅ Documentation updated (README.md, OPS.md, TECH_SPEC.md section 7)
- ✅ Loading skeletons added to all screens (SHELF-038)
- ❌ Test edge cases: long offline periods, app backgrounding, queue persistence across restarts
- ❌ Add conflict resolution for concurrent edits while offline
- ❌ Add unit tests for offline utilities and sync manager
- ❌ Add E2E tests for offline scenarios

---

## Medium

## SHELF-002: Link Targets to GitHub Issues

### Description

Targets in The Shelf represent goals or milestones within habits. For software development habits, it would be useful to link targets directly to GitHub issues so progress can be tracked in both places. This feature adds an optional `github_issue_url` field to targets, displays a clickable link in the UI, and optionally fetches/shows the issue status (open/closed). This bridges personal habit tracking with external project management.

### Acceptance Criteria

- [x] Targets schema includes `github_issue_url` field
- [x] Target edit form includes GitHub Issue URL input
- [x] UI displays clickable link to GitHub issue when set
- [ ] Issue status fetched and displayed (optional enhancement - deferred)

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-003: Import Practice/Action Drill Down

### Description

The import system currently shows a preview of what will be imported but doesn't detail how practices and actions will be resolved. When importing data that references practices or actions not yet in the database, users can't see what will happen. This feature extends the import preview to show practice/action resolution status, flag missing items, and auto-create them during import with user confirmation. This prevents import failures and gives users control over what gets created.

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

Warm-up and cool-down templates support dynamic variables like `{{last_session_note}}` that get substituted with real data when displayed. Currently, users edit templates as raw text without seeing the final output. This feature adds a live preview panel in HabitEditDialog that parses variables and fetches the relevant data (e.g., the note from the user's last session). The preview should update as the template is edited and handle missing data gracefully.

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

The Progress view currently shows habit-level aggregations, but habits contain multiple practices (e.g., "Exercise" habit might have "Running", "Weights", "Stretching" practices). Users want to drill into practice-level data to understand how their time is distributed within a habit. This feature adds practice breakdowns when a habit is selected, with charts showing time per practice and filters to focus on specific practices. This enables deeper insight into where time is actually going.

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

The Progress view currently shows bar charts and time-based visualizations, but lacks a year-at-a-glance view. A calendar heatmap (similar to GitHub's contribution graph) would let users quickly see patterns - which days they're most active, gaps in tracking, and seasonal trends. Clicking a day should drill into that day's entries. The heatmap should use the existing earth-tone color palette and support dark mode.

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

The Shelf tracks "transitions" (when users switch between habits during a session) and "caution" entries (behaviors users want to monitor or reduce). These events are significant for understanding patterns but aren't visible on Progress view charts. This feature overlays visual markers on timeline charts to highlight transition events and caution spikes, helping users correlate these events with their overall activity. Markers should have tooltips with details and be toggleable to avoid clutter.

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

Database schema changes are currently applied via direct SQL edits to schema.sql, which doesn't track migration history or support rollbacks. As the project grows and potentially has multiple contributors, a formal migration system is needed. This feature implements versioned migration files with up/down support, a migrations table to track applied changes, and a CLI command to run pending migrations. This enables safe, reproducible schema evolution.

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

Users often engage in time-bound programs like "4 weeks of physical therapy", "30-day meditation challenge", or "12-week training block". Currently, The Shelf tracks habits continuously without framing activity within specific time periods. This feature introduces "Programs" - named time blocks with start/end dates linked to habits. Entries within program dates auto-associate, Progress view can filter by program, and UI elements show progress (e.g., "Day 12 of 30"). This is a larger feature touching schema, API, and multiple views.

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

The test suite currently consists only of Playwright E2E tests, which are comprehensive but slow to run and don't catch unit-level bugs early. Unit tests for utility functions, custom hooks, and API route handlers would provide faster feedback during development. This feature sets up Jest for the web frontend and backend, adds tests for critical utilities (date formatting, metrics calculations), and configures coverage reporting. This improves code quality and makes contributions safer.

### Acceptance Criteria

- [x] Vitest configured for web frontend (Jest-compatible)
- [x] Unit tests for utility functions (date formatting, color utilities)
- [ ] Unit tests for custom hooks (deferred - context-heavy)
- [x] Unit tests for API route handlers (backend)
- [x] Coverage reporting configured

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Maintenance
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-037: Demo Mode

### Description

Visitors to the GitHub repo or README currently have no way to try the app without cloning and setting up the full stack. A demo mode with realistic sample data would let potential users explore the interface and understand the app's value. This feature includes creating seed data fixtures, deploying a public demo instance (read-only or periodically reset), and linking to it from the README. OPS.md needs updated deployment documentation.

### Acceptance Criteria

- [x] Demo data seed script or fixtures
- [x] Demo mode toggle or separate demo deployment
- [x] README links to live demo
- [x] OPS.md updated with deployment instructions
- [x] Demo resets periodically or is read-only

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-038: Loading Skeletons

### Description

Loading states across the app are inconsistent - some views show skeletons, others show spinners, and some show nothing during initial load. Skeleton loaders provide better perceived performance by showing the shape of content before data arrives. This feature adds skeleton components for common patterns (cards, lists, charts) and ensures all views display appropriate skeletons during loading. Skeletons should match actual content layout and work in both light and dark mode.

### Acceptance Criteria

- [x] Skeleton components for cards, lists, charts
- [x] All views show skeletons during initial load
- [x] Skeletons match actual content layout
- [x] Works in both light and dark mode

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-039: Search Entries

### Description

As users accumulate entries over weeks and months, they need a way to find specific entries - "that note I wrote about my breakthrough" or "all entries from my vacation week". Currently there's no search functionality. This feature adds search by note content with optional date range filtering, showing results with the search term highlighted. The backend should use PostgreSQL full-text search for performance, and search must work on both web and mobile apps.

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

The Shelf should be usable by everyone, including users who rely on screen readers, keyboard navigation, or have visual impairments. Current accessibility coverage is minimal - missing ARIA labels, inconsistent focus states, and no screen reader testing. This feature systematically improves accessibility: adding ARIA labels to interactive elements, ensuring visible focus states, supporting keyboard navigation for all core flows, and meeting WCAG AA color contrast standards. Can be done incrementally, starting with TodayView.

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

Users who prefer the web app over the native mobile app should be able to install it on their device for quick access. Progressive Web App support enables installation on desktop and mobile browsers, provides an app-like experience without browser chrome, and enables basic offline functionality. This feature configures the web manifest, sets up a service worker to cache static assets, and shows an offline indicator when network is unavailable. The `vite-plugin-pwa` package simplifies implementation.

### Acceptance Criteria

- [x] Web app manifest configured (name, icons, theme color)
- [x] Service worker caches static assets
- [x] App is installable on desktop and mobile browsers
- [ ] Offline indicator shown when network unavailable
- [x] Basic offline functionality (view cached data)

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** #8

---

## SHELF-042: PDF Summary Reports

### Description

Users may want to generate PDF reports of their activity for personal review, sharing with coaches or therapists, or archival purposes. Currently, the only way to see a summary is in the app itself. This feature adds PDF export from Progress or Review view with period selection (week, month, custom range). The PDF should include time breakdown by habit, entry counts, highlighted entries, and reflection content. Libraries like `@react-pdf/renderer` or `jspdf` can generate PDFs client-side.

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

Contributors to The Shelf need to understand the existing UI component library before making changes. Storybook provides an interactive catalog where components can be viewed in isolation with all their variants and states. This feature sets up Storybook for the web frontend, creates stories for core UI components (Button, Card, Badge, Input, Dialog), and includes a dark mode toggle. This helps contributors understand components, enables visual regression testing, and documents the design system.

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

Habit tracking apps are most effective when they help users remember to log consistently. Optional notifications can remind users to log daily entries or complete weekly reflections. This feature adds push notifications on mobile (via Expo) and browser notifications on web, with all settings configurable and **off by default**. Users can set specific times for daily reminders and choose which day/time for weekly reflection prompts. All notification logic must be tested, and settings must persist to the database.

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

## SHELF-045: Full Offline Support

### Description

The current PWA setup caches static assets and API responses, allowing the app shell and previously-viewed data to load offline. However, users cannot create or edit entries when offline - mutations fail without network connectivity. For a habit tracker used daily, true offline support is valuable. This feature implements local storage (IndexedDB) to persist data client-side, a mutation queue that saves creates/edits/deletes locally when offline, automatic sync when connectivity is restored, and conflict resolution for cases where server data changed while offline. An offline indicator should inform users when they're working offline and changes are queued.

### Acceptance Criteria

- [ ] IndexedDB stores habits, entries, and other data locally
- [ ] Mutation queue persists offline creates/edits/deletes
- [ ] Automatic sync when connectivity restored
- [ ] Conflict resolution strategy (last-write-wins or user prompt)
- [ ] Offline indicator visible in UI when network unavailable
- [ ] Queued changes indicator shows pending sync count
- [ ] Works on both web PWA and mobile app

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-046: OAuth Authentication (Google + GitHub)

### Description

The app needs authentication to protect personal data while allowing demo visitors to browse. OAuth with Google and GitHub provides secure, passwordless login without managing credentials. Users stay logged in across devices via JWT cookies. When DEMO_MODE=true and user is not authenticated, the app is read-only. When authenticated as the allowed user (ALLOWED_EMAIL), full read/write access is granted.

### Acceptance Criteria

- [x] Backend OAuth routes for Google and GitHub
- [x] JWT-based session with httpOnly cookies
- [x] Auth middleware protects write operations in demo mode
- [x] Frontend login page with OAuth buttons
- [x] Auth context tracks login state
- [x] Demo banner shows login/logout
- [ ] Google OAuth credentials configured in Cloud Run
- [ ] GitHub OAuth credentials configured in Cloud Run
- [ ] End-to-end login flow tested in production

### Metadata

- **Status:** In Progress
- **Priority:** High
- **Type:** Feature
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-047: Demo Data Separation (Multi-Database)

### Description

Demo visitors and the owner need completely separate data. After evaluating options (user_id column vs multiple databases), decided on **multiple Neon databases** for complete isolation and simpler queries. This avoids adding `WHERE user_id = ?` to every query and eliminates risk of data leakage.

Architecture:
- `shelf-prod` Neon project: Owner's real data (existing)
- `shelf-demo` Neon project: Demo visitors, read-only, can reset anytime (created)
- Local PostgreSQL: Dev testing, periodic sync from prod backup

Connection strings:
- Prod: `postgresql://neondb_owner:***@ep-raspy-field-ah0w3ev0-pooler.c-3.us-east-1.aws.neon.tech/neondb`
- Demo: `postgresql://neondb_owner:***@ep-withered-sound-ah7kr1w3-pooler.c-3.us-east-1.aws.neon.tech/neondb`

### Acceptance Criteria

- [x] Create `shelf-demo` Neon project
- [x] Run schema.sql on demo database
- [x] Run demo-seed.js to populate fictional demo data (7 habits, 94 entries, 8 targets, 13 preparations, 4 reflections, 1 transition)
- [x] Demo data is completely fictional (Music, French, Fitness, Photography, Reading, Cooking) - no personal information
- [x] Demo data spans 6 months (August 2025 - January 2026)
- [x] Demo data includes entries linked to targets (57 entries with target_id for time aggregation)
- [x] Demo data includes caution entries (6 caution type entries)
- [x] Demo data includes rest days (5 preparations with rest_day=true)
- [x] Demo data includes habit transitions (1 transition: Cooking paused for kitchen renovation)
- [x] Deploy separate demo frontend (https://demo-the-shelf.vercel.app)
- [x] Configure demo backend with demo DATABASE_URL (https://shelf-api-demo-785607788916.us-east1.run.app)
- [x] Demo URL contains "demo" for clarity
- [x] Hourly demo reset via GitHub Actions cron (calls /demo/reset with secret auth)
- [x] Demo reset endpoint with DEMO_RESET_SECRET env var protection
- [x] Unauthorized login attempts → redirect to portfolio contact page (PORTFOLIO_URL env var)
- [x] Document multi-database architecture in OPS.md
- [x] Test both prod and demo end-to-end (read-only verification)
- [x] Nightly production backup via GitHub Actions (commits to data/backups/)
- [x] Auto-restore on `npm run dev` (syncs local from latest backup)

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-048: Data Recovery from JSON Logs

### Description

User data was lost when the local database was reset. Recovery data exists in JSON log files at `data/logs/*.json` and in `data/habits.json`. A recovery SQL file (`data-recovery.sql`) was generated from these sources containing habits, practices, entries, and targets from Jan 1-15, 2026. This task tracks running the recovery and implementing automated backups to prevent future data loss.

### Acceptance Criteria

- [ ] Run `data-recovery.sql` against local database to restore data
- [ ] Verify restored data appears correctly in UI
- [ ] Consider implementing automated daily backups (pg_dump to cloud storage)
- [ ] Document backup/restore procedure in OPS.md

### Metadata

- **Status:** Planned
- **Priority:** High
- **Type:** Maintenance
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-049: Mutation Logging for Data Recovery

### Description

API mutations (POST/PUT/PATCH/DELETE) need to be logged to enable data recovery if the database is lost or corrupted. The middleware in `backend/api/app.js` logs all mutating requests to a `mutation_logs` database table when `LOG_MUTATIONS=true`. This creates a persistent audit trail that can be queried to reconstruct user data. Database storage is more reliable than Cloud Logging for recovery purposes.

### Acceptance Criteria

- [x] Middleware added to `app.js` that logs mutations
- [x] Log includes timestamp, method, path, status, duration, body
- [x] Logging controlled by `LOG_MUTATIONS=true` env var
- [x] Set `LOG_MUTATIONS=true` in Cloud Run environment
- [x] Created `mutation_logs` table in schema.sql
- [x] Created `mutation_logs` table on Neon production
- [x] Middleware writes to database instead of stdout
- [ ] Deploy updated backend code to Cloud Run
- [ ] Verify logs appear in mutation_logs table
- [ ] Document log format and recovery process in OPS.md

### Metadata

- **Status:** In Progress
- **Priority:** High
- **Type:** Maintenance
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-050: Automated Database Backup System

### Description

Manual database management led to data loss when the local database was reset without a backup. To prevent this from happening again, an automated backup system is needed. This should include scheduled pg_dump to cloud storage (Google Cloud Storage bucket), retention policy to manage storage costs, and documented restore procedures. Consider both production (Neon) and local development scenarios. The goal is zero data loss even in catastrophic failure scenarios.

### Acceptance Criteria

- [ ] Production: Neon has point-in-time recovery (verify it's enabled)
- [ ] Production: Document Neon backup/restore procedure in OPS.md
- [x] Local: Script to backup local PostgreSQL to file (`npm run backup` → backup.js)
- [x] Local: Script to restore local PostgreSQL from backup file (`npm run restore` → restore.js)
- [x] Nightly GitHub Action backs up production to `data/backups/` and commits to repo
- [x] Auto-restore on `npm run dev` (syncs local from latest backup automatically)
- [x] Retention policy: 30 days (implemented in backup.js)
- [ ] Test restore procedure and document in OPS.md
- [ ] Consider Cloud Storage bucket for off-site backups (optional - GitHub repo now serves this purpose)

### Metadata

- **Status:** In Progress
- **Priority:** High
- **Type:** Maintenance
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

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
