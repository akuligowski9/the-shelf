# Claude Context for The Shelf

This file contains important terminology and concepts that Claude needs to understand when working on this project.

## Critical Terminology

### Transitions (Habit Transitions)

**IMPORTANT: "Transitions" refer to HABIT status changes, NOT target status changes.**

A **Transition** occurs when a habit is activated or deactivated. The "Transition Window" is a UI dialog in AttentionView that appears when:
- A habit is being activated (inactive → active)
- A habit is being deactivated (active → inactive)

The transition window:
- Allows toggling multiple habits at once
- Captures a **note** explaining why habits are being activated/deactivated
- Has **cascading effects**: deactivating a habit also deactivates its practices and parks its linked targets
- Records the transition with timestamp and note for history
- A transition is only counted when the transition window is **closed/completed**

**Implementation:**
- `habit_transitions` table in database
- `HabitsContext.jsx`: `startTransition()`, `completeTransition(note)`, `cancelTransition()`
- `habitTransitions` state holds the history
- API: `GET/POST /transitions`
- Settings > Data Health shows transition history

This is different from targets changing status (planned → active → completed). Target status changes are just status updates, not "transitions."

### Habits vs Targets

- **Habits**: Categories of activity (e.g., "Exercise", "Software", "Dog Training")
  - Have practices underneath them
  - Can be active or inactive
  - Transitioning a habit has cascading effects

- **Targets**: Projects/milestones/ideas you're working toward
  - Have statuses: planned, active, parked, completed, archived
  - Linked to habits
  - Status changes are NOT called "transitions"

## UI Components

- **Transition Window**: Dialog in AttentionView for activating/deactivating habits with note capture
- **Shelf View**: Main view showing habits with their practices and activity
- **Attention View**: Kanban-style view of targets by status + transition window
- **Settings > Data Health**: Audit info, habit coverage percentages, and transition history
