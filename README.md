# 📚 The Shelf

**A personal attention and life-balance companion.**

The Shelf is a calm, intentional dashboard designed to help manage attention, celebrate progress, and maintain a healthy relationship with ambition. It is a place to start and end the day—taking things off the shelf when ready, and putting them back when it’s time to stop.

This project is not about productivity, streaks, or doing more.  
It is about **framing attention, creating closure, and sustaining engagement over time**.

---

## 🧭 Purpose

The Shelf exists to support intentional living and work by:

- Managing attention rather than maximizing output
- Celebrating progress without guilt
- Honoring rest and life balance
- Encouraging reflection without pressure

At its core, The Shelf asks:

> *Can attention be managed through framing and permission rather than force?*

---

## 🧠 Core Philosophy

- **Attention > Productivity**  
  Quality of focus matters more than quantity of output.

- **Progress ≠ Streaks**  
  Life progress includes rest, relationships, learning, and pauses.

- **Reflection Is Flexible**  
  Reflection adapts to real habits, not rigid daily expectations.

- **Pausing Is Valid**  
  Putting something “on the shelf” is an intentional success, not failure.

---

## 🧪 Core Hypothesis

> If I intentionally start and end my day using The Shelf—optionally framing my attention with warm-ups and cool-downs—then my perceived attention fragmentation will decrease and my sense of closure and satisfaction will increase, even if total output stays the same.

Success is measured by:
- reduced mental carryover
- fewer anxious context switches
- easier re-entry into paused work
- increased voluntary engagement

---

## 🧩 Core Concepts

### 1. The Shelf (Dashboard)
A visual overview of ongoing projects and life categories.

Each project or goal can be marked as:
- **Active**
- **On the Shelf**
- **Planned**

There are no overdue items.  
Paused work is acknowledged, not penalized.

---

### 2. Categories Over Tasks
Work is framed at a **category or identity level**, not at a task level.

Examples:
- Software Practice
- Learning Spanish (Family & Connection)
- Health & Recovery
- Exploration

Categories may define **optional warm-ups and cool-downs** to support framing and closure.

---

### 3. Warm-Ups & Cool-Downs (Optional)
Short reflective prompts used to:
- enter work intentionally
- define what “enough” means today
- exit with a sense of closure

They are:
- optional
- non-performative
- identity-aware

Not every category requires them.

---

### 4. Idea Parking Lot
A lightweight space to capture ideas quickly and safely.

Ideas can be parked without demanding immediate action, protecting focus and attention.

---

### 5. Reflection Without Streaks
Reflection cadence is flexible and user-defined:
- every few days
- weekly
- monthly
- yearly

Reflection focuses on:
- attention quality
- well-being
- learning
- life progress (not just output)

Negative framing is intentionally avoided.

---

## 🎯 MVP Scope

The goal of the MVP is a **working prototype that feels calm and enjoyable to use daily**.

### Included in MVP
- Shelf dashboard (projects + status)
- Category-level warm-up / cool-down support
- “Last touched” notes
- Idea parking lot
- Weekly reflection
- Minimal, low-noise UI

### Out of Scope (for now)
- gamification or streaks
- notifications
- social features
- productivity scoring
- AI-driven insights

---

## 🧱 Tech Stack

### Frontend

**Mobile (Primary)**
- SwiftUI (iOS)
- SwiftData (local-first persistence for early experimentation)

**Web (Planned)**
- React
- JavaScript (no TypeScript)

---

### Backend (Planned)

- Node.js
- REST API
- SQL database (PostgreSQL or SQLite initially)

---

### Architecture Notes

- SwiftUI is the **canonical client** for early use and daily rituals
- The backend will own shared meaning and aggregation logic
- The web client will be added after the core workflows stabilize
- Data models and API contracts are designed to support multiple clients

---

### Rationale

- Optimized for daily personal use on iPhone
- Fast validation of rituals with minimal friction
- Native UI and animations where attention matters most
- Backend-first logic enables future web and cross-platform clients
- Keeps early complexity low while preserving long-term flexibility

---

## 🗂 Data Model (High-Level)

Core entities:
- User (single-user initially)
- Category
- Project
- Reflection
- Idea (Parking Lot)
- Attention Snapshot (self-reported)

Analytics are intentionally lightweight and reflective, not extractive.

---

## 🕯 Daily Ritual

**Start of Day**
- Open The Shelf
- Choose what to take down (or choose rest)
- Optional warm-up framing

**End of Day**
- Note what was touched
- Put things back on the shelf
- Optional cool-down reflection
- Close the day intentionally

---

## 🚧 Project Status

The Shelf is in **early active exploration**.

The goal is not speed, polish, or public launch.  
The goal is **alignment, sustainability, and learning**.

---

## 📝 License

Personal project.  
License to be determined if/when shared publicly.
