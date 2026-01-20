# The Shelf

A personal attention and life-balance companion.

The Shelf helps you plan attention, log what actually happened, and review balance over time. It's a place to start and end the day—taking things off the shelf when ready, and putting them back when it's time to stop.

**The goal is visibility, pattern recognition, and intentional adjustment—not productivity, streaks, or self-optimization.**

---

## Demo

*Live demo link coming soon.*

To run a demo locally with sample data:

```bash
# Start the stack
docker compose -f docker-compose.dev.yml up -d

# Seed demo data
cd backend/api && npm run demo-seed
```

Visit `http://localhost:5173` to explore.

---

## Features

### Current (v1)

- **6 views**: Shelf, Today, Progress, Review, Attention, Settings
- **Full habit/practice/behavior management** with drag-drop
- **Entry logging** with warm-up/cool-down flows
- **Balance and Patterns analysis** with iOS Screen Time–style charts
- **Rich text reflections** with triggers
- **Import/export** with preview and duplicate detection
- **Dark mode** (auto 6PM-6AM or manual)

### Planned

- React Native mobile app
- E2E testing with Playwright
- Practice-level drill down in Progress view
- Calendar heatmap visualization

See [BACKLOG.md](./docs/BACKLOG.md) for details.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Frontend | React 19 + Vite |
| UI Components | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Rich Text | Tiptap |
| Drag & Drop | @hello-pangea/dnd |
| Containerization | Docker Compose |

---

## Quickstart

Run the full stack locally:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Rebuild after dependency/config changes:

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

Stop:

```bash
docker compose -f docker-compose.dev.yml down
```

Reset database (destructive):

```bash
docker compose -f docker-compose.dev.yml down -v
```

**Endpoints:**

- Web UI: `http://localhost:5173`
- API: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

---

## Environment Variables

**Web (`frontend/web/.env.example`):**

```
VITE_API_BASE_URL=http://localhost:3001
```

**API:**

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

---

## Demo Data

Seed the database with sample habits, entries, and targets:

```bash
cd backend/api && npm run demo-seed
```

This loads:
- 7 habits with 49 practices and 91 actions
- 12 days of sample entries (24 entries total)
- 6 sample targets in various states
- Preparations, closures, and reflections

Raw demo data is available in `data/logs/demo/` for manual import via Settings > Import/Export.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [TECH_SPEC.md](./docs/TECH_SPEC.md) | Technical specification, data model, import format |
| [BACKLOG.md](./docs/BACKLOG.md) | All work items with priorities |
| [PROGRESS.md](./docs/PROGRESS.md) | Session changelog |
| [OPS.md](./docs/OPS.md) | Operational procedures |

---

## Contributing

This is a personal project. If you're interested in contributing or have feedback, please open an issue.

---

## License

Personal project. License to be determined if shared.
