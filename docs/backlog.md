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

## 1. Refine Core Terminology (Habits, Targets, Practices)

**Description**  
Clarify and lock in the conceptual model: what a habit is, what a target is, and how practices relate to both. Ensure the language feels natural and consistent across UI and docs.

**Acceptance Criteria**
- Written definitions for Habit, Target, Practice
- Clear examples for each
- Terminology reflected consistently in README and UI labels

**Priority**: P0  
**Story Points**: 3

---

## 2. React Dashboard Layout Refinement

**Description**  
Refine the dashboard layout to better reflect the "Shelf" metaphor: calm, scannable, and non-urgent.

**Acceptance Criteria**
- Habits, targets, and entries visually grouped
- Clear separation between Active vs Parked
- UI feels readable without scrolling fatigue

**Priority**: P0  
**Story Points**: 5

---

## 3. Parking Lot Interaction (Park / Unpark Targets)

**Description**  
Allow targets to be moved between Active and Parked states from the UI.

**Acceptance Criteria**
- Button or affordance to park/unpark a target
- Backend state updates correctly
- UI refresh reflects change immediately

**Priority**: P0  
**Story Points**: 3

---

## 4. Define and Surface Highlights

**Description**  
Decide what constitutes a "highlight" and how it is marked or surfaced.

**Acceptance Criteria**
- Decision: manual vs derived highlight
- Highlight visible on dashboard
- Highlight included in weekly metrics

**Priority**: P1  
**Story Points**: 2

---

## 5. Entry Creation (Manual Logging)

**Description**  
Enable manual creation of entries (habit or life) from the UI.

**Acceptance Criteria**
- Simple form to add an entry
- Supports habit + practice OR life entry
- Entry appears on dashboard after creation

**Priority**: P1  
**Story Points**: 5

---

## 6. Warm-Up Prompt Support (Data + UI)

**Description**  
Support optional warm-up prompts at the habit level.

**Acceptance Criteria**
- Warm-up prompt stored in backend
- UI indicates presence of warm-up
- Warm-up can be viewed (not necessarily required)

**Priority**: P2  
**Story Points**: 3

---

## 7. Cool-Down Capture and "Last Touched"

**Description**  
Capture cool-down notes and update "last touched" metadata for habits/targets.

**Acceptance Criteria**
- Cool-down note can be saved
- Last-touched timestamp updates correctly
- Visible somewhere in UI

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

## 9. Weekly Reflection View

**Description**  
Create a view for weekly reflection that emphasizes attention, balance, and learning.

**Acceptance Criteria**
- Weekly reflections visible and readable
- No streaks or scoring language
- Reflection tied to calendar week

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

## 15. "Today / Yesterday" Accomplishment View

**Description**
Provide a quick view of recent accomplishments for motivation and closure.

**Acceptance Criteria**
- Today and Yesterday entries visible
- Highlights emphasized gently
- No pressure language

**Priority**: P2
**Story Points**: 3

---

## 16. Settings: Import/Export Functionality

**Description**
Implement functional import and export in the Settings view. Currently UI placeholders exist but the actual functionality requires backend support for data persistence.

**Acceptance Criteria**
- Export downloads all data as JSON (habits, practices, behaviors, targets, entries, preparations, closures, reflections)
- Import accepts JSON file and validates structure
- Import is forgiving (unknown fields ignored, partial data accepted)
- Import/export respects the format defined in `docs/import-spec.md`
- Confirmation dialog before import (to prevent accidental overwrites)

**Priority**: P2 (blocked on backend)
**Story Points**: 5

**Note**: Revisit when backend persistence is further along.

---
