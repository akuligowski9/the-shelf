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
> - SHELF-050: Automated Database Backup - verify scheduled runs after Jan 27

## SHELF-001: Mobile Phase 7: Polish

### Description

The React Native mobile app is feature-complete but needs final polish before release. The primary gap is offline support - when users lose connectivity, mutations should queue locally and sync when the connection is restored. Error handling also needs improvement to show user-friendly messages instead of generic failures. Haptic feedback and swipe actions on entry cards have already been implemented.

### Acceptance Criteria

- [x] Offline queue persists mutations when network unavailable
- [x] Sync resolves when connectivity restored
- [x] Error handling shows user-friendly messages
- [x] Unit tests for offline utilities (83 tests across errors.ts, offlineQueueStore.ts, syncManager.ts)

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation complete (2026-01-24):
- ✅ Core offline queue system with AsyncStorage persistence
- ✅ Network monitoring and auto-sync
- ✅ User-friendly error handling with toasts
- ✅ All 6 screens updated (today, attention, shelf, progress, review, settings)
- ✅ Documentation updated (README.md, OPS.md, TECH_SPEC.md section 7)
- ✅ Loading skeletons added to all screens (SHELF-038)
- ✅ Unit tests for offline utilities (83 tests) - errors.ts, offlineQueueStore.ts, syncManager.ts
- ✅ Jest configured for mobile app with mocks for AsyncStorage, NetInfo

Deferred to separate items:
- Manual edge case testing → SHELF-051
- Conflict resolution → SHELF-045 (Full Offline Support)
- E2E tests for offline scenarios → future work

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

## SHELF-066: Balance Agent Duplicate Entry Detection

### Description

The Balance Agent parser (`agentParser.js`) currently adds all entries from the GPT response without checking if similar entries already exist for that day. This can lead to duplicate entries when users re-run the agent or paste the same response twice. The parser should detect potential duplicates by comparing habit, practice, and approximate time, then either skip them automatically or flag them for user review before adding.

### Acceptance Criteria

- [ ] Parser checks existing entries for the selected date before adding
- [ ] Duplicates detected by matching habit + practice + similar time window
- [ ] Duplicate entries flagged in review UI (or auto-skipped)
- [ ] User can choose to add anyway if needed

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

Database schema changes are now managed through a versioned migration system with transaction-wrapped execution, rollback support, and multi-layer production safety guards. The system includes JavaScript-based migration files, a CLI tool for running migrations, and a schema_migrations table for tracking state.

### Acceptance Criteria

- [x] Migration files track schema changes (timestamp-based naming)
- [x] Up migrations apply changes (with transaction wrapping)
- [x] Down migrations revert changes (with confirmation)
- [x] Migration state tracked in database (schema_migrations table)
- [x] CLI commands to run migrations (run, status, rollback, create)
- [x] Production safety guards (env var + interactive confirmation)
- [x] Initial schema migration (with existing table detection)
- [x] habit_prompts table migration
- [x] Backup integration (schema_migrations included in backups)
- [x] Documentation (MIGRATIONS.md, OPS.md updates)
- [x] Demo database migrated successfully
- [x] Production database migrated successfully

### Metadata

- **Status:** Done
- **Priority:** High (was Low - elevated during implementation)
- **Type:** Maintenance
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

### Implementation Notes

**Completed:** 2026-01-25

**Files Created:**
- `backend/api/migrate.js` - Migration CLI (420 lines)
- `db/migrations/20260124000000_initial_schema.js` - Initial schema
- `db/migrations/20260125023705_add_habit_prompts_table.js` - habit_prompts table
- `db/migrations/20260125040215_add_missing_habit_prompts_columns.js` - Missing columns fix
- `docs/MIGRATIONS.md` - Comprehensive migration guide (500+ lines)
- `docs/MIGRATION_IMPLEMENTATION_STATUS.md` - Implementation summary

**Files Modified:**
- `backend/api/package.json` - Added migration npm scripts
- `backend/api/backup.js` - Include schema_migrations in backups
- `db/schema.sql` - Added migration notices and new tables
- `docs/OPS.md` - Added migration workflow section

**Safety Features:**
- Multi-layer protection: env var guard + interactive confirmation + transactions + skip detection
- Production requires `RUN_MIGRATIONS_ON_PRODUCTION=yes` environment variable
- Interactive "Type 'y' to proceed" prompt for production
- Transaction wrapping with auto-rollback on errors
- Initial migration detects existing tables (no DROP, no TRUNCATE)

**Migration Results:**
- Demo database: 3 migrations applied successfully (data preserved)
- Production database: 3 migrations applied successfully (140 entries preserved)
- habit_prompts table created with all required columns
- schema_migrations table tracking all migrations

**Commands:**
```bash
npm run migrate              # Run pending migrations
npm run migrate:status       # Show migration state
npm run migrate:rollback     # Rollback last migration
npm run migrate:create NAME  # Create new migration file
npm run migrate -- --dry-run # Preview without executing
```

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

### Notes

Initial implementation (2026-01-20) added skeletons to TodayView, ProgressView, ReviewView.
ShelfView and AttentionView skeletons added 2026-02-04 to complete all views.

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

- [x] Mobile app has full offline support (SHELF-001)
- [ ] Web PWA has offline mutation queue (SHELF-052, SHELF-053)
- [ ] Web PWA has local data cache for offline reads (SHELF-054)
- [ ] Web PWA has offline UI indicators (SHELF-055)
- [ ] Conflict resolution strategy (last-write-wins)
- [ ] Unit tests for web offline modules (SHELF-056)

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Broken down into sub-items for web implementation:
- SHELF-052: Core Infrastructure (errors, queue store, network hook, sync manager)
- SHELF-053: Offline API Layer (wrap mutations, integrate contexts)
- SHELF-054: Local Data Cache (IndexedDB for offline reads)
- SHELF-055: UI Indicators (NetworkStatus banner)
- SHELF-056: Unit Tests

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
- [x] Demo banner shows login/logout (only in demo mode)
- [x] Google OAuth credentials configured in Cloud Run
- [x] GitHub OAuth credentials configured in Cloud Run
- [x] Frontend auth integration (api.js credentials, AppShell redirect to /login)
- [x] Local dev OAuth configured (.env with all credentials)
- [x] End-to-end login flow tested in production

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Feature
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

2026-01-22 (Terminal A): Fixed OAuth integration issues
- Fixed mangled Cloud Run environment variables (were concatenated together)
- Added frontend auth redirect logic in api.js (401 → /login)
- Added auth check in AppShell.jsx to redirect unauthenticated users
- Hidden demo banner in non-demo mode (only shows when DEMO_MODE=true)
- Configured local .env with all OAuth credentials for development
- Backend and frontend running locally at http://localhost:3001 and http://localhost:5173
- OAuth redirect working: /auth/google → Google OAuth consent screen
- Remaining: Test full OAuth flow in production (Cloud Run + Vercel)

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

User data was lost when the local database was reset. Recovery data exists in JSON log files at `data/daily/*.json` and in `data/daily/habits.json`. All daily logs have been organized, filled in for Jan 16-23, and synced to the local database. A production-ready backup has been created for deployment.

### Acceptance Criteria

- [x] Run `data-recovery.sql` against production database to restore data
- [x] Run `data-recovery-user.sql` to add conversation-based updates
- [x] Create backup before recovery (data/backups/backup-prod-pre-recovery-2026-01-22.json)
- [x] Organize data directory: daily logs to data/daily/, demo to data/demo/
- [x] Fill in historical entries for Jan 16-23
- [x] Create new targets and practices (The Shelf, Spousal Visa, Abstractly, GreenRoom, Symmetrical Upper Body, Neutral Shoulders, Recovery)
- [x] Sync all daily logs to local database
- [x] Create production-ready backup (backup-2026-01-23.json)
- [x] Deploy backup to production database
- [x] Verify restored data appears correctly in production UI
- [x] Automated nightly backups implemented (GitHub Actions)
- [x] Document backup/restore procedure in OPS.md

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Maintenance
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

2026-01-24: Data recovery complete - backup deployed to production, verified in UI.

2026-01-23: Data recovery and organization complete
- Reorganized data directory structure (data/daily/, data/demo/)
- Updated all 23 daily log files to hybrid format (names + IDs)
- Filled Jan 16-23 with detailed entries: software work, exercise, relationships, dog training, caution behaviors
- Created 5 new targets and 3 new practices
- Synced to local database: 140 entries, 53 practices, 13 targets, 2 rest days
- Created backup-2026-01-23.json (307 rows) ready for production deployment
- Remaining: deploy to production and verify in UI

2026-01-22 (Terminal A): Executed data recovery against shelf-prod
- Created pre-recovery backup: backup-prod-pre-recovery-2026-01-22.json
- Before recovery: 74 entries, 19 targets
- After recovery: 148 entries (+74), 27 targets (+8)
- Recovered data from data/logs/*.json (Jan 1-15, 2026) via data-recovery.sql
- Recovered additional entries/targets from conversation logs via data-recovery-user.sql
- UI verification blocked by OAuth authentication issues (being resolved in SHELF-046)

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
- [x] Nightly GitHub Action backs up production to `data/backups/` and commits to repo (using stefanzweifel/git-auto-commit-action)
- [ ] **Verify GitHub Actions scheduled runs are working automatically** (check after Jan 27, 2026 - workflow created Jan 22, GitHub can take 3-7 days to activate new schedules)
- [x] Auto-restore on `npm run dev` (syncs local from latest backup automatically)
- [x] Retention policy: 30 days (implemented in backup.js)
- [ ] Test restore procedure and document in OPS.md
- [x] Off-site backups: GitHub repo serves this purpose (no separate cloud storage needed)

### Metadata

- **Status:** In Progress (waiting to verify scheduled runs)
- **Priority:** High
- **Type:** Maintenance
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-051: Mobile Manual Edge Case Testing

### Description

The mobile app's offline queue system has unit tests but needs manual testing on real devices to verify edge cases that are difficult to simulate in automated tests. This includes testing behavior during long offline periods, app backgrounding/foregrounding, and queue persistence across app restarts and force-quits.

### Acceptance Criteria

- [ ] Test: Go offline → create/edit entries → stay offline 5+ minutes → go online → verify sync completes
- [ ] Test: Queue mutations → background app → wait 5+ minutes → foreground → verify queue persisted and syncs
- [ ] Test: Queue mutations → force-quit app → reopen → verify queue persisted and syncs on reconnect
- [ ] Test: Queue 10+ mutations → go online → verify all sync in correct order
- [ ] Test: Verify NetworkStatus banner shows correct state during all scenarios
- [ ] Document any bugs found and fix them

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Maintenance
- **Version:** v1.1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Split from SHELF-001. Unit tests (83 tests) cover the logic; this covers real-world device behavior.
Related: SHELF-045 (Full Offline Support) covers conflict resolution.

---

## SHELF-052: Web Offline Core Infrastructure

### Description

Create the foundational modules for web offline support: error classes, offline queue store, network detection hook, and sync manager. This mirrors the mobile app's offline infrastructure but uses web-native APIs (IndexedDB, navigator.onLine) instead of React Native libraries.

### Acceptance Criteria

- [ ] Create error classes (NetworkError, ServerError, ValidationError, QueueError) in `lib/errors.js`
- [ ] Create Zustand store for offline queue with IndexedDB persistence via `idb-keyval`
- [ ] Create `useNetwork` hook using `navigator.onLine` and online/offline events
- [ ] Create sync manager with sequential queue processing and retry logic (max 3 retries)
- [ ] Add `idb-keyval` and `zustand` dependencies

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Reference implementation: `frontend/mobile/src/stores/offlineQueueStore.ts`, `frontend/mobile/src/utils/syncManager.ts`

---

## SHELF-053: Web Offline API Layer

### Description

Create an offline-aware API wrapper that intercepts mutations and queues them when offline. Integrate with existing HabitsContext and EntriesContext to handle NetworkError gracefully (keep optimistic updates instead of reverting).

### Acceptance Criteria

- [ ] Create `lib/offlineApi.js` that wraps shared API functions
- [ ] Intercept POST/PUT/PATCH/DELETE and queue when offline
- [ ] Update HabitsContext to use offlineApi and handle NetworkError
- [ ] Update EntriesContext to use offlineApi and handle NetworkError
- [ ] Optimistic updates persist on NetworkError (queued for sync)

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Depends on SHELF-052. Reference: `frontend/mobile/src/api/offlineApi.ts`

---

## SHELF-054: Web Local Data Cache

### Description

Add IndexedDB-based local storage for habits, entries, and other data to enable offline reads. On load, serve cached data immediately while fetching fresh data in background. Persist fetched data to cache for offline access.

### Acceptance Criteria

- [ ] Create `lib/localDataStore.js` with IndexedDB storage for habits/entries/practices/targets
- [ ] Update HabitsContext to load from cache first, then fetch and update cache
- [ ] Update EntriesContext to load from cache first, then fetch and update cache
- [ ] Handle cache invalidation on logout or demo mode switch
- [ ] Cached data serves when fully offline

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Depends on SHELF-053. Enables true offline reads, not just mutation queueing.

---

## SHELF-055: Web Offline UI Indicators

### Description

Add visual feedback for offline state, syncing status, and pending changes count. Users should know when they're offline and when their changes are queued vs synced.

### Acceptance Criteria

- [ ] Create NetworkStatus component (banner showing offline/syncing/pending state)
- [ ] Add NetworkStatus to AppShell layout
- [ ] Color coding: red (offline), blue (syncing), amber (pending changes)
- [ ] Show pending change count when queued mutations exist
- [ ] Initialize sync manager on app mount

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Depends on SHELF-052. Reference: `frontend/mobile/src/components/ui/NetworkStatus.tsx`

---

## SHELF-057: Voice Journal Entry

### Description

Add voice journaling to quickly log multiple entries from natural speech. User records a summary of their day, reviews the transcript, copies a pre-formatted prompt to Claude/ChatGPT (using existing subscription), pastes the JSON response back, and reviews proposed entries before bulk creation. This leverages existing LLM subscriptions without API costs.

### Acceptance Criteria

- [ ] Voice record button in Today view (new "Journal" or "Voice" section)
- [ ] Web Speech API transcribes voice to text in real-time
- [ ] Show live transcript while recording
- [ ] Editable transcript after recording stops
- [ ] Generate prompt with transcript + list of user's habits/practices/targets
- [ ] "Copy prompt" button copies to clipboard
- [ ] Paste area for JSON response from Claude/ChatGPT
- [ ] Parse JSON response into proposed entries
- [ ] Review UI showing proposed entries with edit/remove options
- [ ] "Create All" button batch-creates confirmed entries
- [ ] Graceful fallback if Speech API unavailable
- [ ] Works on desktop and mobile web browsers

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

**Flow:**
1. Tap record → speak about your day (1-5 mins)
2. Review/edit transcript
3. Copy prompt (includes transcript + your habits/practices/targets)
4. Paste into Claude/ChatGPT web (free with existing subscription)
5. Copy JSON response back
6. Review proposed entries, adjust if needed
7. Confirm → entries created

**Prompt format:**
```
Given this voice transcript and the user's habits/practices/targets, extract entries.
Return JSON array of { habit, practice, target, duration_minutes, note }.

Transcript: "..."

Habits: [...]
Practices: [...]
Targets: [...]
```

No API costs - uses existing Claude/ChatGPT subscription.

---

## SHELF-058: Automated Daily Log Export

### Description

Automatically export each day's entries to `data/daily/YYYY-MM-DD.json` at the end of each day. Uses GitHub Actions cron job (similar to nightly backup) to fetch entries from production, format as human-readable JSON with both IDs and names, and commit to repo.

### Acceptance Criteria

- [x] Create `backend/api/export-daily.js` script
- [x] Script fetches entries for a specific date from database
- [x] Output format matches existing daily logs (hybrid IDs + names)
- [x] GitHub Actions workflow runs at 11:59 PM Eastern daily
- [x] Commits to `data/daily/YYYY-MM-DD.json`
- [x] Skips if no entries for that day (no empty files)
- [x] Uses PROD_DATABASE_URL secret
- [ ] Test workflow manually via workflow_dispatch

### Metadata

- **Status:** In Progress
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1.0
- **Assignee:** Alex
- **GitHub Issue:** No

---

## SHELF-056: Web Offline Unit Tests

### Description

Add unit test coverage for the web offline support modules: error classes, queue store, sync manager, and network hook.

### Acceptance Criteria

- [ ] Tests for error classes and helper functions
- [ ] Tests for offline queue store operations (enqueue, dequeue, retry, persistence)
- [ ] Tests for sync manager (queue processing, retry logic, network detection)
- [ ] Tests for useNetwork hook state changes
- [ ] All tests passing with mocked IndexedDB and network state

### Metadata

- **Status:** Planned
- **Priority:** Low
- **Type:** Maintenance
- **Version:** Unassigned
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Can be done incrementally as each component from SHELF-052 through SHELF-055 is built.

---

## v2 - App Store Launch

> These items are planned for v2 when ready to launch on iOS App Store and Google Play.
> See `docs/V2_PLAN.md` for full implementation plan.

## SHELF-067: Privacy Policy and Terms of Service

### Description

App Store submission requires privacy policy and terms of service. Create web pages accessible at /privacy and /terms, and add links in Settings view on both web and mobile apps.

### Acceptance Criteria

- [ ] Privacy policy page at /privacy route
- [ ] Terms of service page at /terms route
- [ ] Links added to web SettingsView
- [ ] Links added to mobile settings screen

### Metadata

- **Status:** Planned
- **Priority:** Critical
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-068: iOS Privacy Manifest

### Description

iOS 17+ requires a Privacy Manifest file (`PrivacyInfo.xcprivacy`) declaring what APIs the app uses and why. Required for App Store submission.

### Acceptance Criteria

- [ ] Create `frontend/mobile/ios/PrivacyInfo.xcprivacy`
- [ ] Declare UserDefaults usage (AsyncStorage)
- [ ] Declare no tracking
- [ ] Validate with Xcode

### Metadata

- **Status:** Planned
- **Priority:** Critical
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-069: Local SQLite Data Storage (Mobile)

### Description

Enable mobile app to work standalone without backend by storing data locally in SQLite. Currently the app requires the backend API to function. Local storage allows offline-first usage with optional cloud sync.

### Acceptance Criteria

- [ ] Add expo-sqlite dependency
- [ ] Create local schema mirroring PostgreSQL tables
- [ ] Implement data access layer abstracting local vs remote
- [ ] Update Zustand stores to use local DB
- [ ] App works completely offline (no backend required)

### Metadata

- **Status:** Planned
- **Priority:** Critical
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-070: Multi-Tenant Backend (user_id)

### Description

Add `user_id` column to all data tables to support multiple users with isolated data. Currently the backend is single-user design. Required for public app where multiple people can use cloud sync.

### Acceptance Criteria

- [ ] Migration adds user_id column to all data tables
- [ ] Backfill existing data to owner's user_id
- [ ] All API routes scope queries by authenticated user
- [ ] Create users table and registration flow
- [ ] Demo mode unchanged (read-only sample data)

### Metadata

- **Status:** Planned
- **Priority:** Critical
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-071: Mobile Biometric/PIN Authentication

### Description

Protect user data on mobile with biometric (Face ID/fingerprint) or PIN authentication. App should require authentication on launch when enabled.

### Acceptance Criteria

- [ ] Add expo-local-authentication dependency
- [ ] Create LockScreen component
- [ ] Settings to enable/disable auth and change PIN
- [ ] Check auth on app foreground resume
- [ ] PIN fallback for devices without biometrics

### Metadata

- **Status:** Planned
- **Priority:** High
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-072: Optional Cloud Sync

### Description

Allow users to optionally sign in with OAuth to sync data across devices. Local-first by default, cloud sync as opt-in feature.

### Acceptance Criteria

- [ ] "Sign in for cloud sync" option in Settings
- [ ] OAuth flow (Google/GitHub) on mobile
- [ ] Bi-directional sync service
- [ ] Conflict resolution (last-write-wins)
- [ ] Clear indication of sync status

### Metadata

- **Status:** Planned
- **Priority:** High
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-073: Practice Breakdown Drill-Down

### Description

Click/tap on a habit in Progress view to see practice-level breakdown showing which practices were used, session counts, and time distribution.

### Acceptance Criteria

- [ ] Web: PracticeBreakdownDialog component
- [ ] Mobile: PracticeBreakdownSheet component
- [ ] Shows practice name, sessions, time, percentage
- [ ] Aggregates from entries by practice_id
- [ ] Works for selected time period

### Metadata

- **Status:** Planned
- **Priority:** High
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

### Notes

Enhancement to SHELF-005 (ProgressView Practice Breakdowns).

---

## SHELF-074: Caution Breakdown Drill-Down

### Description

Click/tap on Caution count in Progress view Stewardship section to see list of individual caution entries with dates, behavior names, and notes.

### Acceptance Criteria

- [ ] Web: CautionBreakdownDialog component
- [ ] Mobile: CautionBreakdownSheet component
- [ ] Shows date, behavior (practice_name), note, duration
- [ ] Filters entries by type='caution' for period
- [ ] Summary count at top

### Metadata

- **Status:** Planned
- **Priority:** High
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-075: EAS Build Configuration

### Description

Configure Expo Application Services (EAS) for building iOS and Android app store binaries. Includes build profiles, signing certificates, and app metadata.

### Acceptance Criteria

- [ ] Create `frontend/mobile/eas.json` with build profiles
- [ ] Update `app.json` with bundle IDs and version codes
- [ ] Configure iOS certificates and provisioning profiles
- [ ] Configure Android keystore
- [ ] Successful `eas build` for both platforms

### Metadata

- **Status:** Planned
- **Priority:** Critical
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-076: App Store Assets & Metadata

### Description

Create all required assets for App Store and Google Play submission: screenshots, descriptions, keywords, release notes.

### Acceptance Criteria

- [ ] App store screenshots (various device sizes)
- [ ] App description copy
- [ ] Keywords/tags for discoverability
- [ ] Release notes for v2.0
- [ ] App preview video (optional)

### Metadata

- **Status:** Planned
- **Priority:** Critical
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-077: Crash Reporting (Sentry)

### Description

Add crash reporting to mobile app for production monitoring. Essential for debugging issues reported by users.

### Acceptance Criteria

- [ ] Add Sentry SDK to mobile app
- [ ] Configure for production builds only
- [ ] Verify crashes appear in Sentry dashboard
- [ ] Source maps uploaded for readable stack traces

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
- **GitHub Issue:** No

---

## SHELF-078: Onboarding Flow

### Description

First-launch tutorial to introduce new users to The Shelf concepts (habits, practices, targets, entries). 3-4 screens explaining the app.

### Acceptance Criteria

- [ ] Detect first launch (no data exists)
- [ ] Show onboarding screens with illustrations
- [ ] Explain core concepts: habits, practices, targets
- [ ] Skip option for returning users
- [ ] Mark onboarding complete in local storage

### Metadata

- **Status:** Planned
- **Priority:** Medium
- **Type:** Feature
- **Version:** v2
- **Assignee:** Unassigned
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

---

## SHELF-059: Mobile OAuth Authentication Fix

### Description

OAuth authentication was failing silently on mobile devices (iOS Safari, Android Chrome). Users would complete the OAuth flow with Google or GitHub, but upon redirect back to the app, they remained logged out. The root cause was cross-site cookie blocking - mobile browsers aggressively block third-party cookies even with `sameSite: 'none'`, and the API domain (`shelf-api-xxx.run.app`) differs from the frontend domain (`the-shelf-amk.vercel.app`). The fix implements token-based auth via URL parameter as a fallback to cookies, storing the JWT in localStorage and sending it via Authorization header on all API requests.

### Acceptance Criteria

- [x] OAuth callback passes token in URL parameter
- [x] Frontend extracts token from URL and stores in localStorage
- [x] Token cleaned from URL after extraction
- [x] All API requests include Authorization header from localStorage
- [x] Backend auth middleware checks Authorization header before cookies
- [x] Cookie-based auth still works for desktop browsers
- [x] Logout clears localStorage token

### Metadata

- **Status:** Done
- **Priority:** High
- **Type:** Bug
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation (2026-01-28):
- Backend `middleware/auth.js`: Added `extractToken()` to check Authorization header first
- Backend `routes/auth.js`: OAuth callback redirects with `?token=xxx` in URL
- Frontend `AuthContext.jsx`: Extracts token from URL, stores in localStorage, cleans URL
- Frontend `api.js` and `lib/api.js`: Include Authorization header on all requests

---

## SHELF-060: Login Page UX Improvements

### Description

The Login page showed a "Local" navigation button on deployed environments to help developers switch to localhost. However, this button appeared on mobile devices where localhost would never be running, and clicking it caused Safari to show "can't connect to server" errors. This fix hides the Local button on mobile devices entirely, and for desktop users, checks if localhost is actually reachable before navigating. If localhost is unavailable, it shows a helpful message explaining Docker setup with a link to the README.

### Acceptance Criteria

- [x] Local button hidden on mobile devices (user agent detection)
- [x] Desktop: Local button checks localhost availability before navigating
- [x] Shows "Checking..." state during availability check
- [x] If localhost unreachable, shows helpful setup message
- [x] Setup message links to GitHub README local development section

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation (2026-01-28):
- Added `isMobileDevice()` function using user agent detection
- Added `handleLocalClick()` that fetches localhost:3001/health with 2s timeout
- Success → navigate to localhost:5173
- Failure → show sky-blue info box with Docker setup guidance

---

## SHELF-061: Demo Auth Error Handling

### Description

When users attempt OAuth login on the demo site (where OAuth credentials aren't configured), they received a raw JSON error: `{"ok": false, "error": "Unknown authentication strategy \"google\""}`. This needed to be caught gracefully and redirect to a friendly error page explaining that sign-in isn't available on demo and inviting users to reach out via the portfolio for collaboration.

### Acceptance Criteria

- [x] Backend middleware checks if OAuth is configured before attempting authentication
- [x] Unconfigured OAuth redirects to `/login?error=auth_unavailable`
- [x] Unauthorized users (wrong email) redirect to `/login?error=unauthorized` instead of portfolio
- [x] Frontend LoginView handles `auth_unavailable`, `unauthorized`, and `failed` error types
- [x] Error messages are friendly and conversational (amber styling, not alarming red)
- [x] All error states include portfolio link for contact
- [x] Backend auth tests added (8 tests)

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Bug
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation (2026-01-28):
- Backend `routes/auth.js`: Added `isOAuthConfigured()` helper and `requireOAuthConfigured()` middleware
- Middleware applied to all 4 OAuth routes (google, google/callback, github, github/callback)
- Changed unauthorized user redirect from direct portfolio URL to `/login?error=unauthorized`
- Frontend `LoginView.jsx`: Rewrote error handling with friendly messages and amber styling
- Created `backend/api/__tests__/auth.test.js` with 8 tests for auth endpoints

---

## SHELF-062: Mobile UI Polish

### Description

Mobile testing revealed UI issues with cramped x-axis labels on charts and overlapping content in Kanban cards. Fixed chart spacing to match Patterns view and made Kanban cards responsive with smaller padding/text and hidden secondary info on mobile.

### Acceptance Criteria

- [x] Balance chart x-axis uses same interval logic as Patterns chart
- [x] Month view shows every 3rd day label instead of all 31
- [x] Kanban cards have smaller padding on mobile (p-2 vs p-3)
- [x] Kanban card text smaller on mobile (text-xs vs text-sm)
- [x] Date/duration/GitHub link hidden on mobile, visible on md+
- [x] Mobile cards show only target name + habit badge

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Bug
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation (2026-01-28):
- `ProgressView.jsx`: Changed Balance chart XAxis interval from `timeRange === 'year' ? 3 : 0` to `timeRange === 'year' ? 3 : timeRange === 'month' ? 2 : 0`
- `AttentionView.jsx`: Made KanbanCard responsive with Tailwind breakpoints (md:)

---

## SHELF-063: Version Endpoint and Display

### Description

Add a version endpoint to the backend (`GET /version`) and display the deployed version in the Settings view. This allows visual confirmation of what version is deployed without checking deployment logs.

### Acceptance Criteria

- [x] Backend has `GET /version` endpoint returning `{ version: "x.y.z" }`
- [x] Version read from package.json (single source of truth)
- [x] Settings view displays current version
- [x] Version shown subtly (footer or metadata section)

### Metadata

- **Status:** Done
- **Priority:** Low
- **Type:** Feature
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Requested during v1.2.0 release discussion. Helps confirm deployment state visually.

Implementation (2026-01-28):
- Backend `app.js`: Added `GET /version` endpoint reading from package.json
- Backend `package.json`: Updated version to 1.2.0
- Frontend `SettingsView.jsx`: Fetches version from API, displays in About section

---

## SHELF-065: Balance Agent (ChatGPT Integration)

### Description

Users wanted a more conversational way to log their day instead of filling out forms for each entry. The Balance Agent is a ChatGPT Custom GPT that lets users ramble naturally about their day, then outputs structured JSON that imports directly into The Shelf. Supports three modes: morning (preparation/intentions), midday (entries), and evening (closure/reflection). The agent detects mode from context and can handle all three in a single conversation.

### Acceptance Criteria

- [x] Context prompt generator includes habits, practices, targets, recent entries, week summary
- [x] JSON parser handles preparation, entries, and closure fields
- [x] UI component with copy context, paste response, review, and add workflow
- [x] Preparation saves to existing preparation API
- [x] Entries save to existing entries API
- [x] Closure saves to existing closure API
- [x] Works on any day (today or past)
- [x] Custom GPT instructions documented

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Feature
- **Version:** v1.4.0
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation (2026-02-03):
- `docs/BALANCE_AGENT_GPT.md` — Complete Custom GPT setup instructions
- `frontend/web/src/lib/agentPrompt.js` — Generates context with day status, habits, entries, week summary
- `frontend/web/src/lib/agentParser.js` — Parses JSON, matches habit/practice names, converts to API format
- `frontend/web/src/components/today/AgentLogSection.jsx` — Collapsible UI in Today view

GPT detects mode from natural language:
- "Good morning, planning to focus on..." → preparation
- "Did 30 minutes of reading..." → entries
- "Wrapping up, solid day..." → closure

---

## SHELF-064: Fix Docker Auto-Restore from Backups

### Description

The `dev-start.js` script auto-restores from the latest production backup on startup, but when running via Docker Compose, the backup directory (`data/backups/`) was not mounted into the container. The script looks for backups at `../../data/backups` relative to `/app`, which resolves to `/data/backups` inside the container — but that path didn't exist because only `./backend/api:/app` was mounted. This meant local dev databases stayed stale while backups accumulated.

### Acceptance Criteria

- [x] Docker container can access `data/backups/` directory
- [x] Auto-restore works when containers restart
- [x] Production deployment unaffected (uses Cloud Run, not Docker Compose)

### Metadata

- **Status:** Done
- **Priority:** Medium
- **Type:** Bug
- **Version:** v1
- **Assignee:** Alex
- **GitHub Issue:** No

### Notes

Implementation (2026-01-31):
- Added volume mount `./data:/data` to api service in `docker-compose.dev.yml`
- Path `/data/backups` inside container now maps to host's `data/backups/`
- Requires container restart to pick up new backups: `docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up -d`