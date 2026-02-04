# Balance Agent Knowledge Document

This document defines the JSON format for The Shelf habit tracking system. Reference this when parsing user conversations.

## JSON Schema

### Entry Types

There are three entry types: `habit`, `life`, and `caution`.

#### Habit Entry
```json
{
  "type": "habit",
  "habit": "Software",
  "practice": "Development",
  "target": "ChiriBudget",
  "actions": ["API", "Testing"],
  "duration_minutes": 45,
  "note": "Optional context"
}
```

**Fields:**
- `type`: Always `"habit"`
- `habit`: **STRING** - Exact habit name from user's list (required)
- `practice`: **STRING or null** - Exact practice name from user's list
- `target`: **STRING or null** - Exact target name from user's Targets list (NOT a boolean!)
- `actions`: **ARRAY of STRINGS or null** - Action names shown in brackets in user's practices
- `duration_minutes`: **NUMBER or null** - Duration in minutes
- `note`: **STRING or null** - Optional context

#### Life Entry
```json
{
  "type": "life",
  "duration_minutes": 30,
  "note": "Team call"
}
```

**Fields:**
- `type`: Always `"life"`
- `duration_minutes`: **NUMBER or null**
- `note`: **STRING** - Description of what happened (required for life entries)

#### Caution Entry
```json
{
  "type": "caution",
  "practice": "PMO+",
  "duration_minutes": null,
  "note": "Optional context"
}
```

**Fields:**
- `type`: Always `"caution"`
- `practice`: **STRING or null** - Exact caution behavior name from user's Caution Behaviors list
- `duration_minutes`: **NUMBER or null**
- `note`: **STRING or null** - Optional context

### Preparation (Morning)
```json
{
  "preparation": {
    "note": "Focus on completing the project",
    "rest_day": false
  }
}
```

**Fields:**
- `note`: **STRING or null** - User's intention for the day
- `rest_day`: **BOOLEAN** - true if they mention rest day, recovery day, taking it easy

### Closure (Evening)
```json
{
  "closure": {
    "note": "Good day, got a lot done"
  }
}
```

**Fields:**
- `note`: **STRING or null** - User's reflection on the day

### Full Response Format
```json
{
  "preparation": { ... },
  "entries": [ ... ],
  "closure": { ... },
  "reflection": "Brief 1-2 sentence summary"
}
```

Only include sections that apply. Omit null/empty fields.

## User Context Format

Users paste context that includes:

### Habits and Practices
```
**Practices by Habit:**
- Software: Development, Maintenance, Project Planning
- Mental: Reading [Articles, Books, Podcasts], Spanish [Conversation, Media]
- Exercise: Walking, Core, Upper
```

Actions are shown in **brackets** after the practice name. For example:
- `Reading [Articles, Books, Podcasts]` means Reading has actions: Articles, Books, Podcasts

### Caution Behaviors
```
**Caution Behaviors:** PMO+, Alcohol, Overeating
```

These are the valid values for `practice` in caution entries.

### Targets
```
**Targets:**
- Active: ChiriBudget (Software), The Shelf (Software), Symmetrical Upper Body (Exercise)
- Planned: Abstractly (Software)
- Parked: GreenRoom (Software)
```

Target format: `Name (Habit)`. Use the **exact name** (e.g., "ChiriBudget") as the `target` field value.

## Important Rules

1. **target is a STRING, not a boolean** - Use the exact target name like `"ChiriBudget"`, not `true`/`false`
2. **Match names exactly** - Use habit, practice, action, target, and caution behavior names exactly as shown in user's context
3. **Caution behaviors go in the practice field** - For caution entries, the behavior name goes in `practice`, not a separate field
4. **Actions are arrays** - `"actions": ["Articles", "Books"]`, not a single string
5. **Omit null fields** - Don't include fields that are null or empty

## Examples

### User mentions a target
**User:** "Worked on ChiriBudget for 2 hours"

**Correct:**
```json
{
  "entries": [{
    "type": "habit",
    "habit": "Software",
    "practice": "Development",
    "target": "ChiriBudget",
    "duration_minutes": 120
  }]
}
```

**Incorrect:**
```json
{
  "entries": [{
    "type": "habit",
    "habit": "Software",
    "target": true,
    "note": "Worked on ChiriBudget"
  }]
}
```

### User mentions actions
**User:** "Read some articles and listened to a podcast"

**Correct:**
```json
{
  "entries": [{
    "type": "habit",
    "habit": "Mental",
    "practice": "Reading",
    "actions": ["Articles", "Podcasts"],
    "duration_minutes": null
  }]
}
```

### User logs a caution
**User:** "Had a PMO slip"

**Correct:**
```json
{
  "entries": [{
    "type": "caution",
    "practice": "PMO+"
  }]
}
```

### Full day example
**User context shows:**
- Habits: Software, Mental, Exercise
- Practices: Software has Development, Maintenance; Mental has Reading [Articles, Books]
- Caution Behaviors: PMO+, Alcohol
- Active Targets: ChiriBudget (Software), The Shelf (Software)

**User:** "Morning! Taking it easy today. Did some light maintenance on The Shelf, about 30 mins. Read a couple articles. Had a beer with dinner - logging that as caution."

**Response:**
```json
{
  "preparation": {
    "note": "Taking it easy today",
    "rest_day": true
  },
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
      "actions": ["Articles"]
    },
    {
      "type": "caution",
      "practice": "Alcohol",
      "note": "Beer with dinner"
    }
  ]
}
```
