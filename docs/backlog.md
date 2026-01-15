# 📋 The Shelf — Backlog

This backlog captures exploratory and foundational work for The Shelf.
Items are **not commitments**; they are options to be pulled intentionally.

Each task includes:
- Title
- Description
- Acceptance Criteria
- Priority (P0–P3)
- Story Points (rough, for personal sizing only)

---

## 1. ~~Refine Core Terminology (Habits, Targets, Practices)~~ DONE

**Description**
Clarify and lock in the conceptual model: what a habit is, what a target is, and how practices relate to both. Ensure the language feels natural and consistent across UI and docs.

**Acceptance Criteria**
- [x] Written definitions for Habit, Target, Practice
- [x] Clear examples for each
- [x] Terminology reflected consistently in README and UI labels

**Status**: Complete - Terminology defined in data-model.md and CLAUDE.md. UI consistently uses Habits, Practices, Behaviors (actions), and Targets.

**Priority**: P0
**Story Points**: 3

---

## 2. ~~React Dashboard Layout Refinement~~ DONE

**Description**
Refine the dashboard layout to better reflect the "Shelf" metaphor: calm, scannable, and non-urgent.

**Acceptance Criteria**
- [x] Habits, targets, and entries visually grouped
- [x] Clear separation between Active vs Parked
- [x] UI feels readable without scrolling fatigue

**Status**: Complete - ShelfView has expandable habits accordion, targets grouped by status, activity stats, and recent highlights. Clean, calm design.

**Priority**: P0
**Story Points**: 5

---

## 3. ~~Parking Lot Interaction (Park / Unpark Targets)~~ DONE

**Description**
Allow targets to be moved between Active and Parked states from the UI.

**Acceptance Criteria**
- [x] Button or affordance to park/unpark a target
- [x] Backend state updates correctly
- [x] UI refresh reflects change immediately

**Status**: Complete - Targets can be moved via AttentionView Kanban columns (drag-drop) and ShelfView drag-drop interaction between status groups.

**Priority**: P0
**Story Points**: 3

---

## 4. ~~Define and Surface Highlights~~ DONE

**Description**
Decide what constitutes a "highlight" and how it is marked or surfaced.

**Acceptance Criteria**
- [x] Decision: manual vs derived highlight
- [x] Highlight visible on dashboard
- [x] Highlight included in weekly metrics

**Status**: Complete - Highlights are manual (user marks entries). Visible on ShelfView and ReviewView with type-specific icons (habit/life/caution).

**Priority**: P1
**Story Points**: 2

---

## 5. ~~Entry Creation (Manual Logging)~~ DONE

**Description**
Enable manual creation of entries (habit or life) from the UI.

**Acceptance Criteria**
- [x] Simple form to add an entry
- [x] Supports habit + practice OR life entry
- [x] Entry appears on dashboard after creation

**Status**: Complete - Full entry CRUD in TodayView with form dialog, practice selection, duration, notes, highlighting, and archiving.

**Priority**: P1
**Story Points**: 5

---

## 6. ~~Warm-Up Prompt Support (Data + UI)~~ DONE

**Description**
Support optional warm-up prompts at the habit level.

**Acceptance Criteria**
- [x] Warm-up prompt stored in backend
- [x] UI indicates presence of warm-up
- [x] Warm-up can be viewed (not necessarily required)

**Status**: Complete - Implemented in HabitEditDialog with collapsible template library. Templates shown as ↑ count in habit tree.

**Priority**: P2
**Story Points**: 3

---

## 7. ~~Cool-Down Capture and "Last Touched"~~ DONE

**Description**
Capture cool-down notes and update "last touched" metadata for habits/targets.

**Acceptance Criteria**
- [x] Cool-down note can be saved
- [x] Last-touched timestamp updates correctly
- [x] Visible somewhere in UI

**Status**: Complete - Cool-down templates managed in HabitEditDialog. Templates shown as ↓ count in habit tree.

**Priority**: P1
**Story Points**: 3

---

## 8. JSON → Database Importer for Daily Logs

**Description**  
Allow importing existing JSON daily logs into the database.

**Acceptance Criteria**
- Script or endpoint accepts JSON log
- Entries correctly mapped to habits/targets
- Safe to run multiple times (idempotent or controlled)

**Priority**: P2  
**Story Points**: 5

---

## 9. ~~Weekly Reflection View~~ DONE

**Description**
Create a view for weekly reflection that emphasizes attention, balance, and learning.

**Acceptance Criteria**
- [x] Weekly reflections visible and readable
- [x] No streaks or scoring language
- [x] Reflection tied to calendar week

**Status**: Complete - ReviewView with rich text editor, triggers, past reflections, period summary stats, and accomplishments. Supports week/month/year periods.

**Priority**: P2
**Story Points**: 3

---

## 10. Balance Metrics (Lightweight)

**Description**  
Derive simple balance signals (not scores) from entries and habits.

**Acceptance Criteria**
- Metrics explain *context*, not performance
- Can answer "why was this week light?"
- No gamification or rankings

**Priority**: P3  
**Story Points**: 5

---

## 11. Calendar Framing (Programs / Time Blocks)

**Description**  
Support time-bound programs (e.g., "4 weeks of PT" or "Spanish textbook cycle").

**Acceptance Criteria**
- Program has start/end dates
- Entries can optionally associate to a program
- Program visible as contextual framing, not obligation

**Priority**: P3  
**Story Points**: 5

---

## 12. SwiftUI Dashboard Parity Planning

**Description**  
Plan how the React dashboard maps to SwiftUI.

**Acceptance Criteria**
- List of SwiftUI views to build
- API endpoints required
- Decision on what *not* to port yet

**Priority**: P1  
**Story Points**: 2

---

## 13. Docs: Re-entry Guide

**Description**  
Write a short guide for future-you on how to re-enter the project calmly.

**Acceptance Criteria**
- One-page doc in `docs/`
- Explains current state and next good moves
- Emphasizes permission to pause or pivot

**Priority**: P2  
**Story Points**: 1

---

## 14. Visual Identity (Very Light)

**Description**  
Decide on minimal visual identity elements (spacing, tone, maybe one accent color).

**Acceptance Criteria**
- One or two visual principles defined
- Applied consistently to dashboard
- No design rabbit hole

**Priority**: P3  
**Story Points**: 2

---

## 15. ~~"Today / Yesterday" Accomplishment View~~ DONE

**Description**
Provide a quick view of recent accomplishments for motivation and closure.

**Acceptance Criteria**
- [x] Today and Yesterday entries visible
- [x] Highlights emphasized gently
- [x] No pressure language

**Status**: Complete - ShelfView shows Recent Highlights, ReviewView shows Accomplishments with completed targets and highlighted entries.

**Priority**: P2
**Story Points**: 3

---

## 16. ~~Settings: Import/Export Functionality~~ DONE

**Description**
Implement functional import and export in the Settings view.

**Acceptance Criteria**
- [x] Export downloads all data as JSON (habits, practices, actions, targets, entries, preparations, closures, reflections, settings, prompts)
- [x] Import accepts JSON file and validates structure
- [x] Import is forgiving (unknown fields ignored, partial data accepted)
- [x] Import/export respects the format defined in `docs/import-spec.md`
- [x] Pending imports UI (files in data/imports/ folder)
- [x] Preview mode with duplicate detection before import
- [x] Imported files move to data/logs/ after successful import

**Status**: Complete - Full import/export with preview mode, pending imports UI, and file-based import workflow.

**Priority**: P2
**Story Points**: 5

---
