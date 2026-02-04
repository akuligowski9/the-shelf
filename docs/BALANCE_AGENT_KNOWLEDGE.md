# The Shelf - Balance Agent Knowledge Document

This is the authoritative reference for the Balance Agent Custom GPT. It describes the complete data model, relationships, and JSON output format for The Shelf habit tracking system.

---

## System Overview

The Shelf is a personal habit tracking system. It tracks:

1. **Habits** - Long-running pillars of attention (e.g., Software, Exercise, Mental)
2. **Practices** - Concrete ways to engage a habit (e.g., Software → Development, Maintenance)
3. **Actions** - Granular sub-activities within a practice (e.g., Reading → Articles, Books, Podcasts)
4. **Targets** - Projects or goals linked to habits (e.g., ChiriBudget, The Shelf)
5. **Entries** - The log of what actually happened
6. **Caution Behaviors** - Negative patterns to track (stored as practices under a special "caution" habit)

---

## Data Model & Relationships

### Hierarchy

```
Habit (e.g., "Software")
├── Practice (e.g., "Development")
│   └── Action (e.g., "API", "Testing", "Documentation")
├── Practice (e.g., "Maintenance")
├── Practice (e.g., "Project Planning")
└── Target (e.g., "ChiriBudget", "The Shelf")
    └── Linked to this habit, status: active/planned/parked/completed

Habit (e.g., "Mental")
├── Practice (e.g., "Reading")
│   └── Action (e.g., "Articles", "Books", "Podcasts", "Audiobooks")
├── Practice (e.g., "Spanish")
│   └── Action (e.g., "Conversation", "Media", "Textbook Learning")
└── Practice (e.g., "Writing")

Habit (type: "caution") - Special habit for negative behaviors
├── Practice (e.g., "PMO+") - These are "Caution Behaviors"
├── Practice (e.g., "Alcohol")
└── Practice (e.g., "Overeating")
```

### Key Relationships

1. **Habits contain Practices** - Each practice belongs to exactly one habit
2. **Practices may contain Actions** - Only for habits with `track_actions: true`
3. **Targets belong to Habits** - Each target is linked to one habit
4. **Entries reference Habits, Practices, Targets, and Actions** - An entry can include any combination
5. **Caution Behaviors are Practices** - They're practices under the special caution-type habit

---

## How User Context Appears

When users paste their context, it will look like this:

### Habits and Practices

```
**My Habits:** Software, Mental, Exercise, Relationships, Dog Training

**Practices by Habit:**
- Software: Development, Maintenance, Project Planning
- Mental: Reading [Articles, Books, Podcasts, Audiobooks], Spanish [Conversation, Media, Textbook Learning], Writing
- Exercise: Walking, Core, Upper, Legs, Physical Therapy
- Relationships: Marriage, Family, Friends, Recovery
- Dog Training: Drills [Crate, Name Recall, Place Command], Socialization
```

**How to read this:**
- Items in **brackets** are **Actions** - e.g., `Reading [Articles, Books, Podcasts]` means the practice "Reading" has actions named "Articles", "Books", "Podcasts"
- If a practice has no brackets, it has no actions

### Caution Behaviors

```
**Caution Behaviors:** PMO+, Alcohol, Overeating
```

These are the valid behavior names for caution entries. Use them in the `practice` field.

### Targets

```
**Targets:**
- Active: ChiriBudget (Software), The Shelf (Software), Symmetrical Upper Body (Exercise)
- Planned: Abstractly (Software), GreenRoom (Software)
- Parked: Old Project (Software)
```

**How to read this:**
- Format is `TargetName (HabitName)`
- The **target name** is what goes in the `target` field (e.g., `"ChiriBudget"`, `"The Shelf"`)
- The habit in parentheses tells you which habit the target belongs to
- Active, Planned, and Parked targets can all be referenced in entries

---

## JSON Output Format

### Complete Response Structure

```json
{
  "preparation": {
    "note": "String - user's intention for the day",
    "rest_day": false
  },
  "entries": [
    { ... }
  ],
  "closure": {
    "note": "String - user's end-of-day reflection"
  },
  "reflection": "String - your brief 1-2 sentence summary (optional)"
}
```

Only include sections that apply. If user isn't starting their day, omit `preparation`. If they're not closing, omit `closure`.

---

## Entry Types - Complete Specification

### Type 1: Habit Entry

For activities that match one of the user's defined habits.

```json
{
  "type": "habit",
  "habit": "Software",
  "practice": "Development",
  "target": "ChiriBudget",
  "actions": ["API", "Testing"],
  "duration_minutes": 120,
  "note": "Finished the authentication flow"
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | YES | Always `"habit"` |
| `habit` | string | YES | Exact habit name from user's list |
| `practice` | string or null | NO | Exact practice name from user's list |
| `target` | string or null | NO | Exact target name from user's Targets list |
| `actions` | array of strings or null | NO | Array of action names (shown in brackets in context) |
| `duration_minutes` | number or null | NO | Duration in minutes as an integer |
| `note` | string or null | NO | Additional context |

**CRITICAL RULES:**
- `habit` is a **STRING** containing the exact habit name (e.g., `"Software"`)
- `practice` is a **STRING** containing the exact practice name (e.g., `"Development"`) or `null`
- `target` is a **STRING** containing the exact target name (e.g., `"ChiriBudget"`) - **NOT a boolean!**
- `actions` is an **ARRAY OF STRINGS** (e.g., `["Articles", "Books"]`) - **NOT a single string!**

### Type 2: Life Entry

For notable events that don't fit a habit category.

```json
{
  "type": "life",
  "duration_minutes": 30,
  "note": "Team standup call"
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | YES | Always `"life"` |
| `duration_minutes` | number or null | NO | Duration in minutes |
| `note` | string | YES | Description of what happened |

### Type 3: Caution Entry

For negative patterns or behaviors to track.

```json
{
  "type": "caution",
  "practice": "PMO+",
  "duration_minutes": null,
  "note": "Stress-related"
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | YES | Always `"caution"` |
| `practice` | string or null | NO | Exact caution behavior name from user's Caution Behaviors list |
| `duration_minutes` | number or null | NO | Duration if applicable |
| `note` | string or null | NO | Context about the behavior |

**CRITICAL RULES:**
- `practice` for caution entries should match one of the user's **Caution Behaviors** (e.g., `"PMO+"`, `"Alcohol"`)
- This is different from habit entries where `practice` refers to a practice under the habit

---

## Preparation Object (Morning Mode)

```json
{
  "preparation": {
    "note": "Focus on finishing the API integration. Light day otherwise.",
    "rest_day": false
  }
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `note` | string or null | NO | User's stated intention or plan |
| `rest_day` | boolean | NO | `true` if user mentions rest day, recovery day, taking it easy |

---

## Closure Object (Evening Mode)

```json
{
  "closure": {
    "note": "Good productive day. Got the main feature done. Feeling tired but satisfied."
  }
}
```

**Field Specifications:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `note` | string or null | NO | User's reflection on the day |

---

## Common Mistakes to Avoid

### WRONG: target as boolean
```json
{
  "type": "habit",
  "habit": "Software",
  "target": true,
  "note": "Worked on ChiriBudget"
}
```

### CORRECT: target as string
```json
{
  "type": "habit",
  "habit": "Software",
  "target": "ChiriBudget"
}
```

---

### WRONG: actions as single string
```json
{
  "type": "habit",
  "habit": "Mental",
  "practice": "Reading",
  "actions": "Articles"
}
```

### CORRECT: actions as array
```json
{
  "type": "habit",
  "habit": "Mental",
  "practice": "Reading",
  "actions": ["Articles"]
}
```

---

### WRONG: caution behavior in note instead of practice
```json
{
  "type": "caution",
  "note": "PMO+ incident"
}
```

### CORRECT: caution behavior in practice field
```json
{
  "type": "caution",
  "practice": "PMO+",
  "note": "Stress-related"
}
```

---

### WRONG: putting target info in note
```json
{
  "type": "habit",
  "habit": "Software",
  "practice": "Development",
  "note": "Worked on ChiriBudget (target)"
}
```

### CORRECT: using target field
```json
{
  "type": "habit",
  "habit": "Software",
  "practice": "Development",
  "target": "ChiriBudget"
}
```

---

## Complete Examples

### Example 1: Morning Start with Intention

**User says:** "Good morning! Taking it a bit easy today - it's a recovery day after a busy week. Might do some light reading and a short walk."

**Correct response:**
```json
{
  "preparation": {
    "note": "Recovery day after a busy week. Planning light reading and a short walk.",
    "rest_day": true
  }
}
```

### Example 2: Logging Work on a Target with Actions

**User says:** "Just finished 2 hours working on ChiriBudget. Did mostly API work and some testing."

**User's context shows:**
- Habit: Software
- Practices: Development (with actions: API, Testing, Documentation, UI)
- Active Target: ChiriBudget (Software)

**Correct response:**
```json
{
  "entries": [
    {
      "type": "habit",
      "habit": "Software",
      "practice": "Development",
      "target": "ChiriBudget",
      "actions": ["API", "Testing"],
      "duration_minutes": 120
    }
  ]
}
```

### Example 3: Multiple Activities Including Caution

**User says:** "Did 30 mins of maintenance on The Shelf this morning. Read some articles over lunch, about 20 mins. Had a slip with PMO this afternoon - stress got to me. Then took a 45 min walk to clear my head."

**User's context shows:**
- Habits: Software, Mental, Exercise
- Practices: Software → Maintenance; Mental → Reading [Articles, Books]; Exercise → Walking
- Active Targets: The Shelf (Software)
- Caution Behaviors: PMO+

**Correct response:**
```json
{
  "entries": [
    {
      "type": "habit",
      "habit": "Software",
      "practice": "Maintenance",
      "target": "The Shelf",
      "duration_minutes": 30
    },
    {
      "type": "habit",
      "habit": "Mental",
      "practice": "Reading",
      "actions": ["Articles"],
      "duration_minutes": 20
    },
    {
      "type": "caution",
      "practice": "PMO+",
      "note": "Stress-related"
    },
    {
      "type": "habit",
      "habit": "Exercise",
      "practice": "Walking",
      "duration_minutes": 45,
      "note": "Walk to clear head"
    }
  ]
}
```

### Example 4: Evening Closure

**User says:** "Wrapping up for the day. Got a lot done on ChiriBudget - feeling good about the progress. Didn't exercise but that's okay. Ready for bed."

**Correct response:**
```json
{
  "entries": [
    {
      "type": "habit",
      "habit": "Software",
      "practice": "Development",
      "target": "ChiriBudget"
    }
  ],
  "closure": {
    "note": "Got a lot done on ChiriBudget. Feeling good about the progress. Didn't exercise but that's okay."
  },
  "reflection": "A productive day focused on ChiriBudget with meaningful progress."
}
```

### Example 5: Full Day in One Conversation

**User says:** "Morning - focusing on software today, specifically wrapping up ChiriBudget. [later] Did 3 hours of development on ChiriBudget, mostly API and testing. Grabbed lunch with a friend - that was nice, about an hour. [later] Closing out. Solid day, got ChiriBudget to a good stopping point."

**Correct response:**
```json
{
  "preparation": {
    "note": "Focusing on software today, specifically wrapping up ChiriBudget",
    "rest_day": false
  },
  "entries": [
    {
      "type": "habit",
      "habit": "Software",
      "practice": "Development",
      "target": "ChiriBudget",
      "actions": ["API", "Testing"],
      "duration_minutes": 180
    },
    {
      "type": "life",
      "duration_minutes": 60,
      "note": "Lunch with a friend"
    }
  ],
  "closure": {
    "note": "Solid day, got ChiriBudget to a good stopping point."
  },
  "reflection": "Productive day with focused development work and good social connection."
}
```

---

## Matching Names

**Always use exact names from the user's context:**

- If context shows `Software`, use `"Software"` (not `"software"` or `"SW"`)
- If context shows `ChiriBudget`, use `"ChiriBudget"` (not `"Chiri Budget"` or `"chiribudget"`)
- If context shows `PMO+`, use `"PMO+"` (not `"PMO"` or `"pmo+"`)

**If you can't find an exact match:**
- For habits: Ask the user to clarify, or use `"life"` type if it's clearly not a habit
- For targets: Omit the target field rather than guessing
- For caution behaviors: Omit the practice field and just use the note

---

## Duration Estimation

When users give hints instead of exact times:

| User says | Estimate |
|-----------|----------|
| "quick", "brief" | 15 minutes |
| "a bit", "some" | 30 minutes |
| "about an hour" | 60 minutes |
| "a couple hours" | 120 minutes |
| "all morning" | 180 minutes |
| "half the day" | 240 minutes |

When in doubt, omit `duration_minutes` rather than guess wrong.

---

## When NOT to Output JSON

Respond conversationally (no JSON) when:
- User asks meta questions ("how does this work?", "what can you do?")
- User says "just chatting" or "not logging"
- User asks something unrelated to their day
- Message is debugging ("is this working?", "test")

---

## Summary of Field Types

| Field | Correct Type | Example |
|-------|--------------|---------|
| `habit` | string | `"Software"` |
| `practice` | string or null | `"Development"` |
| `target` | string or null | `"ChiriBudget"` |
| `actions` | array of strings or null | `["API", "Testing"]` |
| `duration_minutes` | number or null | `120` |
| `note` | string or null | `"Focused session"` |
| `rest_day` | boolean | `true` or `false` |

**Remember:**
- `target` is always a STRING (the target name), never a boolean
- `actions` is always an ARRAY, never a single string
- Caution behaviors go in the `practice` field for caution entries
