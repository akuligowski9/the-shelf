# Contributing to The Shelf

Thank you for your interest in contributing.

The Shelf is a personal attention and life-balance companion. Contributions should keep the app focused on visibility, pattern recognition, and intentional adjustment — not productivity hacking or gamification.

---

## Code of Conduct

Be kind, respectful, and constructive. We're building something useful together — treat fellow contributors the way you'd want to be treated. Harassment, dismissive behavior, and unconstructive criticism have no place here.

---

## New to Contributing?

If this is your first open source contribution, welcome! Here's how to get started:

1. **Find an issue** — Look for issues labeled [`good first issue`](https://github.com/akuligowski9/the-shelf/labels/good%20first%20issue) for beginner-friendly tasks.
2. **Fork the repo** — Click "Fork" on GitHub, then clone your fork locally.
3. **Create a branch** — See [Branch Naming](#branch-naming) below.
4. **Make your changes** — Follow the setup instructions and run tests before submitting.
5. **Open a PR** — Push your branch and open a pull request against `main`.

If you're new to Git and GitHub, [GitHub's guide](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) is a great place to start.

---

## Issue Etiquette

- **Comment before you start** — If you'd like to work on an issue, leave a comment so others know it's being tackled. This avoids duplicate effort.
- **Ask questions in the issue thread** — If you're stuck or unsure about the approach, ask! We're happy to help.
- **Don't go silent** — If you claimed an issue but can't finish it, that's totally fine. Just leave a comment so someone else can pick it up.

---

## Philosophy

- Visibility and pattern recognition over productivity tracking.
- Simple, intentional UX — no streaks, no gamification.
- Keep the backend thin and the frontend interactive.
- Favor composability and inspectability.

---

## Development Setup

### Prerequisites

- Node.js 18+
- Docker + Docker Compose
- PostgreSQL (via Docker or Neon)

### Quick Start

```bash
# Clone the repo
git clone https://github.com/akuligowski9/the-shelf.git
cd the-shelf

# Start the full stack
docker compose -f docker-compose.dev.yml up -d

# Seed demo data (optional)
cd backend/api && npm run demo-seed

# Visit http://localhost:5173
```

### Backend

```bash
cd backend/api
npm install
npm run dev
```

### Frontend (Web)

```bash
cd frontend
npm install
npm run dev
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express.js |
| Database | PostgreSQL (Neon) |
| Web Frontend | React 19 + Vite |
| Mobile Frontend | React Native + Expo |
| UI Components | shadcn/ui + Tailwind CSS |
| Charts | Recharts (web), Victory Native (mobile) |
| Rich Text | Tiptap |
| Containerization | Docker Compose |

---

## Branch Naming

Use a descriptive branch name with a prefix:

- `feature/calendar-view`
- `fix/entry-logging-bug`
- `docs/update-readme`

Keep it short, lowercase, and hyphen-separated.

---

## Commit Messages

- Use the imperative mood: "Add feature" not "Added feature"
- Keep the first line under 72 characters
- Add a blank line before any extended description

---

## Pull Request Guidelines

Please ensure:

- All existing tests pass
- Code is readable without AI context
- Changes are documented if behavior changes
- New features include tests where applicable
- UI changes maintain mobile responsiveness

Small, focused PRs are preferred.

---

## AI-Assisted Contributions

AI-assisted contributions are welcome.

Please review and understand generated code before submitting.
Maintainers may request clarification if behavior is unclear.
