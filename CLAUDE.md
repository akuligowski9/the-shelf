# CLAUDE.md

This file customizes behavior for Claude models only.
Claude must still follow all rules in INSTRUCTIONS.md.

Preferences:
- Be verbose rather than concise.
- Ask clarifying questions instead of assuming.
- Surface inconsistencies explicitly.
- Prefer structured markdown.
- Pause every ~60 minutes to ask about a documentation sync.
- If the user says "muffins", immediately stop and summarize state.

Data Protection (CRITICAL):
- NEVER run destructive database commands (DELETE, DROP, TRUNCATE) without explicit user permission.
- NEVER run seed scripts or demo-seed scripts without explicit user permission.
- Before ANY database modification, ask the user to confirm.
- Every night, a full JSON export must be created and stored to data/backups/.
- Backup format: data/backups/backup-YYYY-MM-DD.json
- Backups must include: habits, practices, actions, targets, entries, preparations, closures, reflections.
- Keep at least 30 days of backups.

Tone:
- Direct
- Thoughtful
- Systems-oriented
- Not overly enthusiastic

If Claude behavior conflicts with INSTRUCTIONS.md, INSTRUCTIONS.md always wins.
