# The Shelf — Progress Report

> Session-by-session changelog and decision log.

Last updated: 2026-01-20

---

## Current Status

**v1 Web Frontend: Complete**
All six views are fully implemented and functional.

**Backend API: Complete**
Full REST API with all endpoints, PostgreSQL database, import/export with preview.

**Next Phase: React Native Mobile App (SHELF-012)**

---

## Implementation Summary

### Frontend (React + Vite)

| View | Status | Key Features |
|------|--------|--------------|
| ShelfView | 100% | Habits accordion, targets drag-drop, activity stats, highlights |
| TodayView | 100% | Entries CRUD, prep/closure, warm-up/cool-down flows |
| ProgressView | 100% | Balance/Patterns charts, calendar nav, habit deep dive |
| ReviewView | 100% | Rich text reflections, triggers, accomplishments |
| AttentionView | 100% | Kanban targets, tree habits, templates, transitions |
| SettingsView | 100% | Theme, timezone, data health, import/export |

### Backend (Node.js + Express)

- Express.js REST API
- PostgreSQL connection via pool
- All CRUD endpoints for habits, practices, actions, targets, entries
- Preparations, closures, reflections endpoints
- Metrics calculation (`/metrics/range`)
- Import/export with preview and duplicate detection
- Warm-up/cool-down templates API

### Database (PostgreSQL)

Core tables: habits, practices, actions, targets, entries, preparations, closures, reflections, settings, habit_prompts

---

## Sessions

### 2026-01-20 (Evening)

**Summary:**
- Deployed production infrastructure: Google Cloud Run (backend) + Neon (PostgreSQL) + Vercel (frontend)
- Added rich text notes field to Edit Target dialog (SHELF plan)
- Fixed rest day count bug in Review view (was using mock data)
- Removed unused mock data from mockData.js (~185 lines)
- Updated documentation for new deployment architecture

**Deployment Details:**
- Backend: `shelf-api-785607788916.us-east1.run.app` (Cloud Run, max 2 instances)
- Frontend: `the-shelf-amk.vercel.app` (Vercel)
- Database: Neon PostgreSQL (the-shelf project, aws-us-east-1)
- Created production Dockerfile for Cloud Run
- Created vercel.json for Vercel build config
- Set up budget alerts and instance limits for cost protection

**Target Notes Feature:**
- Added `notes TEXT` column to targets table
- Updated POST/PATCH /targets API routes
- Added `updateTargetNotes` function to HabitsContext
- Integrated RichTextEditor in TargetEditDialog
- Notes support bold, italic, bullet points via Tiptap

**Bug Fixes:**
- ReviewView rest day count was reading from mockPreparations instead of API
- Now fetches real preparations via `getPreparationsInRange`

**Cleanup:**
- Removed unused: mockPreparations, mockReflections, mockClosures, mockTransitions
- Removed unused functions: getActionsForPractice, habitTracksActions, getPracticesForHabit, getActiveHabits, getEntriesForDate

**Documentation:**
- README.md: Added live app link, updated tech stack with Neon and hosting
- OPS.md: Rewrote for Cloud Run + Neon + Vercel (was Render), added auth setup docs

---

### 2026-01-20 (Afternoon)

**Summary:**
- Implemented SHELF-038 (Loading Skeletons) — comprehensive skeleton components for all views
- Implemented SHELF-041 (PWA Support) — full Progressive Web App configuration
- Implemented SHELF-036 (Unit Tests) — 59 tests across frontend and backend
- Implemented SHELF-002 (Link Targets to GitHub Issues) — schema, API, and UI
- Implemented SHELF-037 (Demo Mode) — seed script, API endpoint, UI banner
- Created custom Shelf icon (bookshelf design) with all required PNG sizes
- Added SHELF-045 (Full Offline Support) to backlog for future work
- Closed GitHub issue #8 (PWA Support)

**SHELF-038 Details:**
- Created 7 skeleton variants in `skeleton.jsx`: EntryCard, Card, Stats, List, Chart, HabitAccordion, Reflection
- Integrated skeletons into TodayView, ProgressView, ReviewView using isLoading states
- Mobile already had skeletons integrated

**SHELF-041 Details:**
- Installed and configured vite-plugin-pwa
- Created SVG icon source with gradient bookshelf design
- Generated icons: pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png, favicon.png
- PWA manifest with app metadata, theme colors, orientation settings
- Workbox service worker with NetworkFirst API caching strategy
- Updated index.html with proper meta tags

**SHELF-036 Details:**
- Frontend: Vitest configured, 37 tests for color utilities and date/template helpers
- Backend: Jest configured, 22 tests for health, metrics, and entries routes
- Refactored backend to export app.js for testable server
- Test commands: `npm run test` (frontend), `npm test` (backend)

**SHELF-002 Details:**
- Added `github_issue_url` TEXT field to targets schema
- Updated POST/PATCH /targets routes to accept new field
- Added input field in TargetEditDialog
- Added clickable link icons in ShelfView and AttentionView Kanban cards
- Migration for existing DB: `ALTER TABLE targets ADD COLUMN IF NOT EXISTS github_issue_url TEXT;`

**SHELF-037 Details:**
- Created `backend/api/demo-seed.js` - comprehensive seed script
- Loads habits from `data/habits.json`, demo entries from `data/logs/demo/*.json`
- Creates sample targets in various states (active, planned, parked, completed)
- Fixed demo log files to use correct habit/practice names from habits.json
- Created `backend/api/routes/demo.js` with `/demo/status` and `/demo/reset` endpoints
- Added `DemoBanner` component to frontend (shows when DEMO_MODE=true)
- Updated OPS.md with demo deployment instructions
- Added npm scripts: `npm run seed`, `npm run demo-seed`

**SHELF-045 (New Backlog Item):**
- Full offline support with IndexedDB, mutation queue, sync, and conflict resolution
- Builds on PWA foundation to enable true offline usage

**Decisions:**
- Used sharp (dev dependency) for SVG→PNG conversion
- NetworkFirst caching for API calls (24hr expiration)
- Standalone display mode for native app feel
- Offline indicator deferred to SHELF-045 (full offline support)
- Vitest for frontend (Vite-native), Jest for backend (Node standard)
- Custom hooks tests deferred (tightly coupled to React context)
- GitHub issue status fetch deferred (could add via GitHub API later)
- Demo mode uses environment variable DEMO_MODE=true
- Demo reset endpoint only works when DEMO_MODE=true (security)

**What's next:**
- SHELF-012 (React Native Mobile App)
- SHELF-045 (Full Offline Support) when offline usage becomes priority

---

### 2026-01-20 (Early Morning)

**Summary:**
- Rewrote entire BACKLOG.md to unified format from INSTRUCTIONS.md
- Renumbered all items sequentially SHELF-001 through SHELF-044 (eliminated 100-series gap)
- Created 10 new GitHub issues for community contributors (#2-#11)
- Updated all GitHub issues with verbose descriptions, file paths, code examples
- Added 9 new backlog items: Unit tests, Demo mode, Loading skeletons, Search, Accessibility, PWA, PDF reports, Storybook, Notifications
- Updated INSTRUCTIONS.md to require minimum 3-sentence descriptions
- Closed GitHub issue #1 (GitHub Integration - already done)

**Decisions:**
- Unified format for backlog AND GitHub Issues (same template)
- 3-sentence minimum for descriptions (problem context, solution, implementation notes)
- Undo/redo moved to Parking Lot pending decision
- All notifications must be opt-in with settings toggle

**GitHub Issues Created:**
- #6: Search entries
- #7: Accessibility
- #8: PWA support
- #9: PDF reports
- #10: Storybook
- #11: Notifications

**What's next:**
- SHELF-001 (Mobile Phase 7: Polish) is in progress
- SHELF-037 (Demo Mode) for public visibility
- Community contributors can pick up any open GitHub issue

---

### 2026-01-19 (Night)

**Summary:**
- Rewrote entire BACKLOG.md to new unified format from INSTRUCTIONS.md
- All 34 items now use consistent structure: Description, Acceptance Criteria, Metadata
- Format now matches GitHub Issue template for seamless promotion
- Mobile prep/closure feature completed (PreparationSheet, ClosureSheet)
- Shared types fixed (Preparation/Closure interfaces matched to schema)

**Decisions:**
- Unified format for backlog AND GitHub Issues (same template)
- All items include Type field (Feature/Bug/Maintenance) and Version field
- Archived status used for superseded items (SHELF-011)

**What's next:**
- SHELF-021 (Mobile Phase 7: Polish) is in progress
- Consider promoting items to GitHub Issues using the new format

---

### 2026-01-19 (Late Evening)

**Summary:**
- Committed documentation alignment changes from earlier session
- Discovered SHELF-006 (Playwright E2E Testing) was already complete — moved to Done
- Reviewed mobile app current state (significant implementation exists)
- Started but stopped mobile prep/closure modals (user requested focus on docs only)
- Documentation sync and backlog review

**Decisions:**
- Mobile app code changes left uncommitted pending user decision
- SHELF-006 marked Done (11 test files exist)

**What's next:**
- SHELF-012 (React Native Mobile App) ready to continue
- Consider promoting SHELF-012 to GitHub Issue for collaboration

---

### 2026-01-19 (Evening)

**Summary:**
- Aligned all documentation to INSTRUCTIONS.md format
- Slimmed README.md from 427 lines to ~130 lines
- Converted BACKLOG.md to checkbox format with required fields
- Added Purpose/Non-goals at top of TECH_SPEC.md
- Deleted ROADMAP.md (redundant with BACKLOG.md priorities)
- Trimmed TECH_SPEC.md from ~1795 to ~1557 lines (removed Design Philosophy, Visual Design Guidelines, Implementation Status sections; kept Testing Strategy)
- Simplified INSTRUCTIONS.md (90-minute sync, no ROADMAP references)

**Decisions:**
- README stays concise; detailed content lives in TECH_SPEC.md
- BACKLOG items use checkbox format with Description, Status, Priority, Assignee, GitHub Issue fields
- ROADMAP.md eliminated — priorities live in BACKLOG.md, session state in PROGRESS.md
- Testing Strategy section retained in TECH_SPEC.md

**What's next:**
- Continue React Native mobile app implementation (SHELF-012)

---

### 2026-01-19 (Earlier)

**Summary:**
- Created INSTRUCTIONS.md (universal AI workflow rules)
- Created merged TECH_SPEC.md (combining tech-spec, data-model, import-spec)
- Restructured BACKLOG.md with SHELF- prefix IDs
- Created ROADMAP.md for high-level milestones
- Cleaned up redundant documentation files
- Moved DEPLOY.md to docs/OPS.md

**Decisions:**
- SHELF- prefix confirmed for all backlog items
- OPS.md committed (no secrets), OPS_PRIVATE.md gitignored
- CLAUDE.md simplified to behavior preferences only; domain knowledge in TECH_SPEC.md

**What's next:**
- Align all documentation to INSTRUCTIONS.md format

---

### 2026-01-19 (Morning)

**Summary:**
- Fixed "Last entry" showing stale date (removed mock data initialization)
- Fixed Progress view filters turning off when habits loaded async
- Changed "Total entries" to "Active entries" in Data Health

**Decisions:**
- None

**What's next:**
- Documentation restructure

---

### 2026-01-18

**Summary:**
- Made dark mode Kanban lane colors more intense
- Improved column color visibility in AttentionView

**Decisions:**
- None

**What's next:**
- Bug fixes and documentation cleanup

---

### 2026-01-15

**Summary:**
- All views implemented and functional (v1 complete)
- Import/export system complete with preview mode
- Data Health metrics in Settings
- Warm-up/cool-down template persistence

**Decisions:**
- v1 web frontend declared complete
- Next focus: mobile app

**What's next:**
- Polish, bug fixes, documentation
