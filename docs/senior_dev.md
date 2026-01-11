# The Shelf — Senior Developer Guide

This document captures architectural decisions, design patterns, and concepts that a senior developer should understand when working on this project.

---

## 1. Philosophy & Domain Language

### Core Philosophy
The Shelf is **not a productivity app**. It's an attention management system. Key distinctions:

- **Numbers are neutral** — Metrics describe reality, they don't judge it
- **Closure matters** — Ending deliberately is a first-class feature
- **Rest is valid data** — Days without entries aren't failures, they're rest days
- **History is sacred** — Nothing is ever hard-deleted, only archived

### Domain Terms (Use Consistently)

| Term | Definition | NOT This |
|------|------------|----------|
| **Habit** | A recurring domain of attention (e.g., "Software", "Spanish") | A daily task or checklist item |
| **Practice** | A concrete way to fulfill a habit (e.g., "Walking" under "Exercise") | A sub-habit or habit variant |
| **Behavior** | A specific action within a practice (e.g., "Squats" under "Legs Workout") | A practice synonym |
| **Target** | Direction/project/milestone (e.g., "The Shelf", "Spanish B1 Cert") | A goal with deadlines |
| **Transition** | A structural change to attention allocation | A completed session |
| **Preparation** | Day-level framing note | A to-do list |
| **Closure** | Day-level ending note | A summary |
| **Warm-up** | Pre-session ritual attached to habit entry | Day-level preparation |
| **Cool-down** | Post-session ritual attached to habit entry | Day-level closure |

### Transition vs Session
**Critical distinction**: A transition is NOT a session with warm-up and cool-down.

- **Transition**: Reducing active habits from 5 to 4, swapping habits, sustained practice changes
- **Session**: A single habit entry that may have warm-up/cool-down attached

---

## 2. Architecture Overview

### Three-Tier Architecture
```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│  React + Vite + shadcn/ui + Tailwind        │
│  localhost:5173                              │
└─────────────────┬───────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────┐
│                  Backend                     │
│  Node.js + Express                          │
│  localhost:3001                              │
└─────────────────┬───────────────────────────┘
                  │ SQL
┌─────────────────▼───────────────────────────┐
│                 Database                     │
│  PostgreSQL                                 │
│  localhost:5432                              │
└─────────────────────────────────────────────┘
```

### View Responsibilities (Single Responsibility)

Each view has ONE job:

| View | Responsibility | Read/Write |
|------|----------------|------------|
| **Shelf** | Orient the user | Read-only |
| **Today** | Log what happened | Read/Write |
| **Progress** | Visualize patterns | Read-only |
| **Review** | Make meaning | Read/Write (reflections) |
| **Attention** | Manage structure | Read/Write |
| **Settings** | Configure system | Read/Write |

### Data Flow

```
User Action → Context Update → Local State → (Future: API Call) → Database
                                   ↓
                              UI Re-render
```

Currently frontend-only with mock data. Backend will add persistence layer.

---

## 3. State Management Pattern

### HabitsContext (Central State)

Single context manages all domain entities:

```javascript
const value = {
  // Habits
  habits,
  activeHabits,
  updateHabitColor,
  toggleHabitActive,
  addHabit,
  updateHabitName,
  updateHabitTargetMinutes,

  // Practices
  practices,
  getPracticesForHabit,
  togglePracticeActive,
  addPractice,
  updatePracticeName,

  // Behaviors
  behaviors,
  getBehaviorsForPractice,
  toggleBehaviorActive,
  addBehavior,
  updateBehaviorName,

  // Targets
  targets,
  getTargetsByStatus,
  updateTargetStatus,
  addTarget,
  updateTargetName,
  updateTargetHabit,
}
```

### Why Single Context?
- Habits, practices, behaviors, and targets are tightly coupled
- Many views need cross-cutting access
- Simpler than multiple contexts with prop drilling
- Easy to replace with API calls later

### ThemeContext (Separate)
Theme is isolated because:
- Applied at document level
- Persisted to localStorage independently
- Auto mode requires interval checking

---

## 4. Data Model Concepts

### Entry Types
```
Entry
├── type: "habit" | "life" | "caution"
├── occurred_at: timestamp (EST)
├── duration_minutes: optional
├── is_highlight: boolean
└── For habit entries:
    ├── habit_id (required)
    ├── practice_id (optional)
    ├── behaviors[] (optional)
    ├── warm_up_template_id (optional)
    ├── warm_up_note (optional)
    └── cool_down_note (optional)
```

### Target Status Flow
```
planned → active → completed
    ↓        ↓
  parked ← parked
```

### Metrics Philosophy
Inspired by iOS Screen Time:
- **Descriptive, not prescriptive**
- **Visual, not numerical**
- **Neutral, not judgmental**

Two lenses:
1. **Balance** — Where did attention go? (composition)
2. **Patterns** — What's changing? (trends)

---

## 5. UI Patterns

### Color System

Earth-tone palette with semantic meaning:

| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | Warm sand | Warm dark |
| Primary | Evergreen | Eucalyptus |
| Entry: Habit | Evergreen border | Eucalyptus border |
| Entry: Life | Sky blue border | Sky blue border |
| Entry: Caution | Terracotta border | Terracotta border |

15 habit badge colors available for visual differentiation.

### Collapsible Hierarchy
```
Habit (collapsible)
└── Practice (collapsible if has behaviors)
    └── Behavior (leaf)
```

Pattern: `Collapsible` > `CollapsibleTrigger` > `CollapsibleContent`

### Edit Pattern
Instead of inline controls, use modal dialogs:
- Cleaner list UI
- More room for fields
- Consistent across Habit/Practice/Behavior

### Status Transitions
Use `DropdownMenu` with contextual options:
- Active target → Complete, Park, Back to Planned
- Planned target → Activate, Park
- Parked target → Activate, Back to Planned

---

## 6. Key Technical Decisions

### Why shadcn/ui?
- Ownership of component code (not node_modules)
- Tailwind-native styling
- Accessible by default
- Easy to customize

### Why No TypeScript?
- Personal project, single developer
- Faster iteration during exploration phase
- Can migrate later if needed

### Why EST Timezone?
- Single-user system, user is in EST
- Timestamps stored consistently
- Dark mode triggers at 6PM-6AM EST

### Why Store Daily Metrics?
Per data-model.md:
- Fast chart rendering
- Stable historical views
- Insulated from entry edits
- Simplified aggregation queries

---

## 7. Security Considerations

### Single User = No Auth
- No user table
- No sessions
- No authentication middleware needed
- All data belongs to one user

### Data Privacy
- Notes may contain personal information
- Demo data uses sanitized content
- No analytics or telemetry

### No Hard Deletes
- `archived_at` timestamp instead
- Preserves audit trail
- Supports "undo" patterns

---

## 8. Testing Strategy

### E2E Over Unit Tests
For this app, user flows matter more than unit isolation:

1. **Start → Log → Close** — Complete daily ritual
2. **Edit History** — Modify past entries
3. **Transition Windows** — Structural changes
4. **Rest Day Inference** — Empty day handling
5. **Import/Export** — Data integrity

### Playwright Choice
- Real browser testing
- Catches integration issues
- Tests actual user experience

---

## 9. Future Considerations

### Backend Integration
When backend is added:
1. Replace mock data imports with API calls
2. Add loading states to context
3. Implement optimistic updates
4. Handle offline scenarios

### SwiftUI Port
If mobile app is built:
- API is the contract
- Views map 1:1 conceptually
- Share color system definitions

### Demo Mode
For portfolio:
- Separate demo data set
- Clear visual indicator
- Reset functionality

---

## 10. Common Pitfalls

### Don't Confuse These

| Wrong | Right |
|-------|-------|
| Transition = warm-up + cool-down | Transition = habit set change |
| Target = obligation | Target = direction |
| Rest day = failure | Rest day = valid data |
| Metrics = goals | Metrics = description |

### State Management
- Don't duplicate state between context and components
- Use context for shared domain data
- Use local state for UI-only concerns (dialogs, forms)

### Styling
- Don't mix Tailwind with custom CSS
- Use CSS variables for theme values
- Keep color semantics consistent

---

## 11. Code Organization

```
frontend/web/src/
├── components/
│   ├── ui/              # shadcn components (auto-generated)
│   ├── layout/          # AppShell, Navigation
│   ├── today/           # Today view components
│   ├── attention/       # Attention view components (edit dialogs)
│   └── ...
├── context/
│   ├── HabitsContext.jsx
│   └── ThemeContext.jsx
├── views/               # Route-level components
├── data/
│   └── mockData.js      # Development data
├── lib/
│   ├── utils.js         # cn() utility
│   └── colors.js        # Color palette
└── main.jsx             # Router setup
```

### Naming Conventions
- Views: `*View.jsx`
- Dialogs: `*Dialog.jsx`
- Context: `*Context.jsx`
- Components: PascalCase
- Files: PascalCase for components, camelCase for utilities

---

## 12. Questions to Ask New Features

Before implementing any feature, ask:

1. **Does this add pressure?** — If yes, reconsider
2. **Is this descriptive or prescriptive?** — Should be descriptive
3. **Which view owns this?** — Single responsibility
4. **Does this preserve history?** — Never delete data
5. **Is the language correct?** — Use domain terms consistently
