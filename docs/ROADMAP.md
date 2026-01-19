# The Shelf — Roadmap

> High-level milestones and vision for The Shelf.

---

## Vision

The Shelf is a personal attention and life-balance companion designed to be used for **years**. It helps you:
- See where attention went
- Preserve memory of effort
- Enable intentional closure
- Honor rest as valid data
- Understand balance without judgment

---

## Completed Milestones

### v1.0 — Web Application (January 2026)

**Status: Complete**

Full-featured React web application with:
- 6 views: Shelf, Today, Progress, Review, Attention, Settings
- PostgreSQL backend with full REST API
- Import/export with preview and duplicate detection
- Warm-up/cool-down template library
- Balance and Patterns analytics
- Rich text reflections
- Earth-tone visual design with dark mode

---

## Current Phase

### v1.1 — Polish & Quality (Q1 2026)

**Status: In Progress**

Focus areas:
- [ ] E2E testing with Playwright (SHELF-006)
- [ ] Dynamic template preview (SHELF-002)
- [ ] Practice-level drill down in Progress (SHELF-003)
- [ ] Documentation cleanup

---

## Future Phases

### v2.0 — Mobile App (Q2 2026)

**Status: Planned**

React Native (Expo) mobile app with full feature parity.

Key deliverables:
- Expo project at `frontend/mobile`
- 6 tabs matching web views
- Shared API and colors with web
- Offline support with sync
- Haptic feedback and native gestures

*See SHELF-012 for details.*

---

### v2.1 — Enhanced Analytics (Q3 2026)

**Status: Future**

- Calendar heatmap view (SHELF-004)
- Transition/caution markers on charts (SHELF-005)
- Practice-level breakdown per habit
- Stored daily metrics for performance

---

### v3.0 — Native iOS (Future)

**Status: Future**

SwiftUI native iOS client for optimal performance and system integration.

Considerations:
- Widgets for quick entry
- Shortcuts integration
- Apple Watch companion (maybe)

*See SHELF-011 for planning.*

---

## Non-Goals

These are explicitly out of scope:
- Gamification or streaks
- Social features or sharing
- Notifications or reminders
- AI-generated judgments
- Multi-user support

The Shelf is a personal, single-user system. It describes reality without judging it.

---

## Principles

1. **Attention over productivity** — See where attention went, don't maximize output
2. **Numbers are neutral** — Metrics describe, they don't judge
3. **Closure matters** — Ending deliberately is a first-class feature
4. **History is sacred** — Nothing meaningful is ever deleted
5. **Rest is valid** — Days without entries aren't failures
