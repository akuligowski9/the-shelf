# Project Orientation & AI Collaboration Contract

**Version:** 1.0
**Last Updated:** 2026-01-19

---

## Session Start Instruction (Read First)

At the beginning of **ANY** work session on this repository:

1. Read THIS FILE (`docs/INSTRUCTIONS.md`) in full.
2. Then read `docs/PROGRESS.md` to understand where work last stopped.
3. Do NOT assume missing context.
4. Do NOT invent intent, structure, or rationale.
5. If there is any discrepancy, gap, or ambiguity between documentation, code, or conversation, **ASK QUESTIONS** before proceeding.

You may respond with:

- "I see a gap between documentation and implementation — do you want to update docs or preserve current behavior?"
- "This repository appears to be partially migrated to the standard structure — should I normalize it now while preserving existing material?"
- "There is no recorded decision explaining this — should we log it before continuing?"

> **Hallucination is strictly disallowed.**
> **Assumptions are strictly disallowed.**
> **Preservation of existing material is required unless explicitly overridden.**

---

## Purpose of This Document

This file defines the authoritative documentation structure, workflow rules, and collaboration expectations for this project.

**Goals:**

- Consistency across all Alex Kuligowski software projects
- Seamless resumption across sessions and AI models
- Zero documentation drift
- Explicit, intentional promotion of work to GitHub Issues
- Safe handling of partial or legacy documentation structures
- Prevention of silent assumptions or hallucinated intent

> If any rule in this document is violated, you must pause and ask how to proceed.

---

## Source of Truth Hierarchy

When conflicts arise, resolve them in this order:

1. **INSTRUCTIONS.md** – collaboration rules and structure
2. **PROGRESS.md** – most recent recorded intent, decisions, and state
3. **BACKLOG.md** – committed work and priorities
4. **TECH_SPEC.md** – design and technical reasoning
5. **ROADMAP.md** – narrative planning intent
6. **README.md** – public-facing summary

> If a lower-priority document contradicts a higher-priority one, pause and ask how to reconcile.

---

## Authoritative Document Structure

### Root

- `README.md` — Public-facing overview (rendered by GitHub)

### docs/

- `INSTRUCTIONS.md` — This file (authoritative rules)
- `PROGRESS.md` — Chronological log of progress and decisions
- `BACKLOG.md` — Source of truth for committed work
- `TECH_SPEC.md` — Deep technical + feature/view breakdown
- `ROADMAP.md` — High-level narrative plan
- `OPS.md` — Operational documentation (committed, redacted)
- `OPS_PRIVATE.md` — Sensitive operational details (gitignored)

### Root (Claude-specific)

- `CLAUDE.md` — Claude model behavior preferences (tone, style, reminders)

`CLAUDE.md` customizes Claude's behavior but does NOT override this file. If there is a conflict, `INSTRUCTIONS.md` always wins.

See "CLAUDE.md Responsibilities" section below for required content.

### Rules

- Do NOT create additional documentation files unless explicitly instructed.
- If this repository already contains documentation, preserve existing content and migrate it into this structure intentionally.
- Never delete or overwrite material without confirmation.

---

## Project Identifier Prefix (Critical)

Each project uses a unique, uppercase identifier prefix for backlog items and GitHub Issues.

### Format

```
<PREFIX>-###
```

### Examples

- `SHELF-001`
- `CHIRI-014`
- `GREEN-007`

### Initialization Rule

When documentation is first set up and no prefix exists:

1. Suggest a prefix based on the project name.
2. Ask for confirmation.
3. Do NOT rename tasks, create backlog items, or create GitHub Issues until confirmed.

### Prefix Confirmation Rule

- Once confirmed, the prefix must not change without explicit instruction.
- If changed, all references must be migrated together.
- Prefix changes must be logged in `PROGRESS.md`.

---

## Canonical Status Flow (Used Everywhere)

```
Planned → In Progress → Done
              ↓
           Blocked
```

### Definitions

| Status          | Meaning                                               |
| --------------- | ----------------------------------------------------- |
| **Planned**     | Acknowledged, not started                             |
| **In Progress** | Actively being worked on                              |
| **Blocked**     | Cannot proceed without input, decision, or dependency |
| **Done**        | Complete                                              |

This flow must be used consistently in:

- `BACKLOG.md`
- GitHub Issues
- AI summaries and reasoning

---

## Priority System (Used Everywhere)

| Priority     | Level   |
| ------------ | ------- |
| **Critical** | Highest |
| **High**     |         |
| **Medium**   |         |
| **Low**      | Lowest  |

### Rules

- Priority defines urgency and ordering.
- Within each section, items are ordered top-to-bottom by importance.

---

## Backlog Semantics (Source of Truth)

`BACKLOG.md` is the single source of truth for committed work.

### Rules

- Items in Critical / High / Medium / Low are committed to implementation.
- Timing may be undefined, but intent exists.
- Items in the **Parking Lot** are not yet tasks.

### Parking Lot

- Captures ideas worth remembering
- Not yet actionable or fully defined
- May be promoted later or discarded

---

## BACKLOG.md Required Structure

Must include:

1. Status Flow legend at the top
2. Sections in this exact order:
   - Critical
   - High
   - Medium
   - Low
   - Parking Lot
   - Done

### Backlog Item Format

```markdown
- [ ] <PREFIX>-### Short title
  - Description: combined problem + intended solution (1–4 sentences)
  - Status: Planned | In Progress | Blocked | Done
  - Priority: Critical | High | Medium | Low
  - Assignee: Alex | <name> | Unassigned
  - GitHub Issue: No OR #<issue_number>
  - Notes / Links: optional
```

### Rules

- "GitHub Issue" is a synchronization indicator, not a status.
- If a GitHub Issue exists, backlog and issue state must remain aligned.
- Do NOT promote tasks unless explicitly instructed.

---

## README.md Responsibilities

`README.md` is the public entry point.

It must include:

- What the project is
- Demo (live link, video, screenshots, CLI example, or placeholder)
- Features (current and planned)
- Tech stack
- Quickstart (run locally)
- Environment variables
- Contribution guidance
- Links to BACKLOG, ROADMAP, TECH_SPEC

> If README content becomes inaccurate, it must be updated during the next documentation sync.

---

## CLAUDE.md Responsibilities

`CLAUDE.md` lives in the repository root and customizes Claude model behavior only.

### Required Content

```markdown
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

Tone:

- Direct
- Thoughtful
- Systems-oriented
- Not overly enthusiastic

If Claude behavior conflicts with INSTRUCTIONS.md, INSTRUCTIONS.md always wins.
```

### Rules

- `CLAUDE.md` must NOT contain project-specific technical details (those belong in TECH_SPEC.md).
- `CLAUDE.md` must NOT duplicate rules from INSTRUCTIONS.md.
- `CLAUDE.md` is for AI model behavior preferences only.
- If INSTRUCTIONS.md and CLAUDE.md conflict, INSTRUCTIONS.md always wins.

---

## TECH_SPEC.md Responsibilities

This is the deep reasoning document.

### Required Sections

1. **Purpose**
2. **Non-goals**
3. **Feature / View Breakdown** (first-class)

For each Feature or View:

- Description
- User flow
- Data involved
- Edge cases
- Open questions
- Decisions (design decisions live here)

### Additional Sections

- Architecture Overview
- Data Model
- Key Flows
- External Integrations
- Security & Privacy Notes
- Testing Strategy
- Open Questions / Risks

---

## ROADMAP.md Responsibilities

High-level narrative plan.

### Structure

- **Now** — Current focus
- **Next** — Up next
- **Later** — Future plans

### Rules

- Readable, non-technical
- Reference backlog items where possible (`<PREFIX>-###`)
- Must not contradict BACKLOG or README

---

## PROGRESS.md Responsibilities (Session Continuity)

`PROGRESS.md` is the first document to read after `INSTRUCTIONS.md`.

### Purpose

- Record where work left off
- Log documentation syncs
- Capture decisions and scope changes
- Reduce re-orientation overhead

### Each Entry Includes

- Date / time or work block
- Summary of progress
- Decisions made
- What's next

> This is a narrative log, not a task list.

---

## Major Scope Change Definition

A major scope change includes:

- Adding/removing a feature or view
- Changing a core user flow
- Introducing a new external dependency
- Changing data ownership or persistence
- Re-prioritizing Critical or High backlog items

**Major scope changes require:**

1. Immediate documentation sync
2. Entry in `PROGRESS.md`

---

## Questions Before Action (Anti-Overreach Rule)

Before taking action, ask clarifying questions if:

- Requirements are ambiguous
- Multiple valid interpretations exist
- Documentation is silent
- A decision affects architecture, scope, or public API

> Default behavior is to **ask, not assume**.

---

## Documentation Minimalism Principle

Documentation should:

- Explain intent, not restate code
- Be concise but sufficient
- Be updated for correctness, not completeness

> If a section adds no clarity, ask whether it should be removed.

---

## Safe Word: "MUFFINS" (Pause & Recovery Mode)

If the user says **"muffins"** at any time, immediately do the following:

1. **Stop** advancing work.
2. **Read** `PROGRESS.md`, `BACKLOG.md`, and `ROADMAP.md`.
3. **Provide a concise summary:**
   - Where we left off
   - Current priorities
   - Open questions or blockers
4. **Ask whether to:**
   - Run a documentation sync
   - Promote items to GitHub Issues
   - Pause safely

> This is a **non-negotiable interrupt** and overrides all other instructions.

---

## 60-Minute Documentation Sync (Mandatory Check-In)

Approximately every 60 minutes of work time — or after a major scope change — ask:

> "Do you want to run a documentation sync?"

If yes:

1. Update `BACKLOG.md`
2. Update `TECH_SPEC.md`
3. Update `ROADMAP.md`
4. Update `README.md` if needed
5. Append a summary to `PROGRESS.md`

> This is a consistency pass, not a rewrite.

---

## GitHub Issues (When Promoted)

Promote backlog items **only when explicitly instructed**.

### Issue Fields Must Include

- Summary
- Description (problem + solution intent)
- Acceptance Criteria (checkbox list)
- Status
- Priority
- Type (Feature / Bug / Maintenance)
- Assignee

### After Promotion

- Update `BACKLOG` with issue number
- Keep states aligned

---

## End of Work Block (Cool-Down)

Before ending a session:

1. Ask whether to perform a final documentation sync.
2. Review `BACKLOG` for items suitable for GitHub Issue promotion.
3. If instructed, create or refine GitHub Issues to support async collaboration.
4. Ensure `PROGRESS.md` clearly records:
   - What was accomplished
   - What remains open
   - Where to resume next time

> This cool-down ensures the project is safe to pause and easy to resume.

---

## Operational Documentation (OPS)

This project may include operational documentation that describes how to OPERATE, PROTECT, RECOVER, and MAINTAIN the system.

Operational documentation is intentionally separate from design and planning documents. It focuses on real-world procedures and risk management, not system architecture or feature behavior.

The project owner (Alex) does NOT need to be an operations expert. The AI collaborator is explicitly expected to assist with identifying, proposing, and maintaining operational knowledge in a safe, conservative manner.

### OPS Document Structure

Operational documentation uses the following structure:

```
docs/
├── OPS.md              (committed, redacted, procedural)
└── OPS_PRIVATE.md      (gitignored, sensitive/internal)
```

**Rules:**

- `OPS.md` must be committed to the repository.
- `OPS_PRIVATE.md` must be gitignored.
- `OPS.md` must never contain secrets, credentials, private keys, or internal-only access details.
- `OPS_PRIVATE.md` may contain sensitive operational information.

`OPS.md` should reference `OPS_PRIVATE.md` abstractly when sensitive details exist (e.g., "See OPS_PRIVATE.md for credentials or internal access details.").

### What OPS Is (Intent)

OPS documentation exists to answer questions such as:

- "How do I back this up?"
- "How do I restore it if something goes wrong?"
- "What secrets exist and how are they protected?"
- "What should I check during an incident?"
- "What steps should be taken before deploying or making risky changes?"

OPS documentation is a practical runbook. It prioritizes safety, clarity, and recovery over completeness or elegance.

### What Belongs in OPS.md (Committed)

`OPS.md` MAY include:

- Backup and recovery procedures
- Restore testing steps
- High-level security model and threat awareness
- Authentication and access model (no secrets)
- Deployment and environment setup checklists
- Emergency or failure-handling procedures
- Operational assumptions (Supabase, Vercel, etc.)
- CLI commands with placeholders
- Links to dashboards or provider documentation
- Notes intended for maintainers, not users

`OPS.md` is allowed to be procedural, explicit, environment-specific, opinionated, and internal-facing.

`OPS.md` must remain safe to commit publicly.

### What Belongs in OPS_PRIVATE.md (Gitignored)

`OPS_PRIVATE.md` MAY include:

- Actual secrets, tokens, or keys
- Service role keys
- Internal URLs or admin panels
- Provider project references
- Emergency access instructions
- Incident notes or sensitive observations
- Any information you would not want publicly visible

> **AI must NEVER invent or reconstruct the contents of OPS_PRIVATE.md.**
> **AI must NEVER request secrets unless explicitly instructed.**

### What Does NOT Belong in OPS

OPS documentation must NOT contain:

- Feature definitions
- Product requirements
- User-facing behavior descriptions
- Architectural reasoning or tradeoffs
- Data model explanations
- Long-term product intent
- Planning, prioritization, or backlog items

Those belong in BACKLOG.md, TECH_SPEC.md, or ROADMAP.md.

OPS documentation must not duplicate TECH_SPEC content. TECH_SPEC may reference OPS documentation, but OPS must not explain how the system is designed or implemented.

### AI Responsibility for OPS

The AI collaborator is expected to actively assist with operations by:

- Identifying when operational concerns may exist
- Asking questions such as:
  - "Should we document backup and recovery for this?"
  - "Is there a security or operational risk we should capture?"
  - "Does this change affect deployment or restore procedures?"
- Proposing safe, conservative defaults when the owner is unsure
- Clearly marking assumptions and asking for confirmation
- Avoiding provider-specific claims unless confirmed

If the AI is uncertain about an operational detail:

- It must ask before documenting it.
- It must not hallucinate procedures, limits, or guarantees.

### OPS Update Frequency

OPS documentation does NOT follow the 60-minute documentation sync rule.

Update OPS documentation ONLY when:

- Infrastructure or hosting changes
- Backup or recovery strategy changes
- Authentication or security model changes
- Deployment process changes
- Restore or recovery procedures are tested
- An incident or failure reveals missing or incorrect guidance
- The AI identifies a meaningful operational gap and asks to address it

OPS updates should be intentional, infrequent, and high-signal.

### Logging OPS Updates

When `OPS.md` or `OPS_PRIVATE.md` is updated:

- Record a brief entry in `PROGRESS.md` noting:
  - What changed
  - Why it changed
  - Which OPS file was affected

OPS documentation itself should remain concise and procedural. Historical context belongs in `PROGRESS.md`.

### OPS and Safe Operation

When working on:

- Design, features, or planning → OPS documentation should generally be ignored.
- Deployment, security, recovery, or incidents → OPS documentation becomes authoritative.

If OPS documentation appears missing, outdated, or incomplete when relevant:

- Pause and ask whether it should be updated before proceeding.
- Do NOT assume or invent operational behavior.

> OPS documentation exists to make the system safe to operate, pause, and recover.
