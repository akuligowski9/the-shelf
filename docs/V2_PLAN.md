# The Shelf v2 Plan: App Store Launch + Progress Drill-Down

> Created: 2026-02-04
> Status: Planning Complete - Implementation Deferred

## Overview

**Goals:**
1. Launch on iOS App Store and Google Play Store as a public app
2. Add practice and caution drill-down in Progress view
3. Support local-first data with optional cloud sync

**Key Decisions:**
- Target: Public app (anyone can download)
- Auth: Biometric/PIN lock for device protection
- Data: Local-first with optional OAuth cloud sync
- Drill-down: Ship with v2.0

---

## Phase 1: Legal & Compliance (Week 1)

**Must-have for App Store submission.**

### Tasks

| Task | Description | Files |
|------|-------------|-------|
| Privacy Policy | Create web page + in-app link | `frontend/web/src/views/PrivacyPolicyView.jsx` (new) |
| Terms of Service | Create web page + in-app link | `frontend/web/src/views/TermsView.jsx` (new) |
| iOS Privacy Manifest | Required since iOS 17 | `frontend/mobile/ios/PrivacyInfo.xcprivacy` (new) |
| Settings links | Add legal links to both apps | `SettingsView.jsx`, `settings.tsx` |

### Privacy Policy Content
- What data is collected (habits, entries, notes)
- Local storage by default
- Optional cloud sync with OAuth
- No third-party data sharing
- Data export/deletion options

---

## Phase 2: Local-First Data Architecture (Week 1-2)

**Enable mobile app to work standalone without backend.**

### Current State
- Mobile app requires backend API (localhost:3001 or cloud)
- Data stored in PostgreSQL on server
- Offline queue exists but syncs to server

### Target State
- Mobile stores data locally in SQLite
- Works completely offline
- Optional: Sign in to enable cloud sync

### Tasks

| Task | Description | Files |
|------|-------------|-------|
| Add expo-sqlite | Local database for mobile | `package.json`, new `src/db/` folder |
| Create local schema | Mirror PostgreSQL tables locally | `src/db/schema.ts` (new) |
| Data access layer | Abstract local vs remote | `src/db/dataAccess.ts` (new) |
| Migrate stores | Update Zustand stores to use local DB | `src/stores/*.ts` |
| Sync service | Optional bi-directional sync | `src/services/syncService.ts` (new) |

### Schema (SQLite)
```sql
-- Same structure as PostgreSQL, stored locally
CREATE TABLE habits (id INTEGER PRIMARY KEY, name TEXT, ...);
CREATE TABLE practices (id INTEGER PRIMARY KEY, habit_id INTEGER, ...);
CREATE TABLE entries (id INTEGER PRIMARY KEY, habit_id INTEGER, ...);
-- etc.
```

---

## Phase 3: Multi-Tenant Backend (Week 2-3)

**Enable cloud sync for multiple users.**

### Current State
- Single-user design (no user_id anywhere)
- OAuth exists but only for owner access control

### Target State
- All tables have `user_id` column
- API scopes all queries to authenticated user
- Demo mode unchanged (read-only sample data)

### Tasks

| Task | Description | Files |
|------|-------------|-------|
| Add user_id columns | Migration for all data tables | `db/migrations/` (new migration) |
| Update API routes | Scope all queries by user | `backend/api/routes/*.js` |
| User registration | Create user record on first OAuth | `backend/api/routes/auth.js` |
| Data isolation | Ensure users only see their data | All route handlers |

### Migration Strategy
- Add `user_id` column (nullable initially)
- Backfill existing data to owner's user_id
- Make column NOT NULL
- Add foreign key constraint

---

## Phase 4: Mobile Authentication (Week 2-3)

**Biometric/PIN protection + optional OAuth.**

### Tasks

| Task | Description | Files |
|------|-------------|-------|
| Add expo-local-authentication | Biometric APIs | `package.json` |
| Lock screen component | Face ID / fingerprint / PIN | `src/components/LockScreen.tsx` (new) |
| Auth settings | Enable/disable, change PIN | `app/(tabs)/settings.tsx` |
| App lifecycle hook | Check auth on foreground | `app/_layout.tsx` |
| Optional OAuth | Sign in button for cloud sync | `src/components/SignInSheet.tsx` (new) |

### Flow
1. App launch → Check if auth enabled
2. If enabled → Show lock screen
3. Biometric/PIN success → Show app
4. Settings → "Sign in for cloud sync" (optional)

---

## Phase 5: Progress View Drill-Down (Week 3-4)

**SHELF-005 enhancement + caution detail.**

### Practice Breakdown

**Trigger:** Click/tap on a habit in Progress view
**Shows:** Practice-level breakdown for selected period

| Practice | Sessions | Time | % |
|----------|----------|------|---|
| Running | 8 | 4h 30m | 60% |
| Strength | 5 | 3h 00m | 40% |

**Implementation:**
```
Web: PracticeBreakdownDialog.jsx
Mobile: PracticeBreakdownSheet.tsx

Data: Filter entries by habit_id + date range, group by practice_id
```

### Caution Breakdown

**Trigger:** Click/tap on Caution count in Stewardship section
**Shows:** List of caution entries for period

| Date | Behavior | Note | Duration |
|------|----------|------|----------|
| Feb 2 | PMO+ | Stressed from work | 30m |
| Jan 28 | General | — | 15m |

**Implementation:**
```
Web: CautionBreakdownDialog.jsx
Mobile: CautionBreakdownSheet.tsx

Data: Filter entries by type='caution' + date range
```

### Files to Modify

| File | Changes |
|------|---------|
| `frontend/web/src/views/ProgressView.jsx` | Add click handlers, integrate dialogs |
| `frontend/mobile/app/(tabs)/progress.tsx` | Add tap handlers, integrate sheets |
| `frontend/web/src/components/progress/` | New folder with breakdown components |
| `frontend/mobile/src/components/progress/` | New folder with breakdown components |

---

## Phase 6: EAS Build & Store Setup (Week 4)

**Configure for App Store submission.**

### Tasks

| Task | Description | Files |
|------|-------------|-------|
| Create eas.json | Build profiles | `frontend/mobile/eas.json` (new) |
| Update app.json | Bundle ID, version, permissions | `frontend/mobile/app.json` |
| iOS certificates | Apple Developer account setup | External |
| Android keystore | Google Play signing | External |
| App store assets | Screenshots, descriptions | `docs/app-store/` (new folder) |
| Test builds | EAS build for both platforms | CLI |

### app.json Updates
```json
{
  "expo": {
    "name": "The Shelf",
    "slug": "the-shelf",
    "version": "2.0.0",
    "ios": {
      "bundleIdentifier": "com.theshelf.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.theshelf.app",
      "versionCode": 1
    }
  }
}
```

---

## Phase 7: Polish & Launch (Week 4-5)

### Tasks

| Task | Description |
|------|-------------|
| Crash reporting | Add Sentry for production monitoring |
| Onboarding flow | First-launch tutorial (3-4 screens) |
| Empty states | Better UX when no data |
| App store copy | Description, keywords, release notes |
| QA testing | Real device testing on iOS + Android |
| Submit for review | Apple + Google review process |

---

## Backlog Items

| ID | Title | Phase | Priority |
|----|-------|-------|----------|
| SHELF-067 | Privacy Policy and Terms of Service | 1 | Critical |
| SHELF-068 | iOS Privacy Manifest | 1 | Critical |
| SHELF-069 | Local SQLite Data Storage (Mobile) | 2 | Critical |
| SHELF-070 | Multi-Tenant Backend (user_id) | 3 | Critical |
| SHELF-071 | Mobile Biometric/PIN Authentication | 4 | High |
| SHELF-072 | Optional Cloud Sync | 4 | High |
| SHELF-073 | Practice Breakdown Drill-Down | 5 | High |
| SHELF-074 | Caution Breakdown Drill-Down | 5 | High |
| SHELF-075 | EAS Build Configuration | 6 | Critical |
| SHELF-076 | App Store Assets & Metadata | 6 | Critical |
| SHELF-077 | Crash Reporting (Sentry) | 7 | Medium |
| SHELF-078 | Onboarding Flow | 7 | Medium |

---

## Timeline Summary

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Legal + Local DB start | Privacy policy, terms, SQLite schema |
| 2 | Local DB + Multi-tenant | Working local storage, user_id migration |
| 3 | Mobile auth + Backend | Biometric lock, API scoping |
| 4 | Drill-down + EAS | Practice/caution views, build configs |
| 5 | Polish + Submit | Onboarding, QA, store submission |

**Total: ~5 weeks**

---

## Verification Plan

### Phase 1 Verification
- [ ] Privacy policy page loads at /privacy
- [ ] Terms page loads at /terms
- [ ] Links work in Settings (web + mobile)

### Phase 2 Verification
- [ ] Mobile app works in airplane mode
- [ ] Create habit, log entry, close app, reopen - data persists
- [ ] Export JSON contains all local data

### Phase 3 Verification
- [ ] New user signs in → empty data (not owner's data)
- [ ] Two different accounts have isolated data
- [ ] Demo mode still shows sample data

### Phase 4 Verification
- [ ] Enable biometric → app requires Face ID on next launch
- [ ] Wrong PIN 3x → locked out temporarily
- [ ] Sign in with OAuth → data syncs to cloud

### Phase 5 Verification
- [ ] Click habit in Progress → shows practice breakdown
- [ ] Click Caution count → shows caution list
- [ ] Both work on web and mobile

### Phase 6 Verification
- [ ] `eas build --platform ios` succeeds
- [ ] `eas build --platform android` succeeds
- [ ] Builds install on real devices

### Phase 7 Verification
- [ ] Crash in app → appears in Sentry
- [ ] Fresh install → shows onboarding
- [ ] App store submission accepted

---

## Critical Dependencies

```
Phase 1 (Legal) ─────────────────────────────────────────► Phase 6 (EAS)
                                                              │
Phase 2 (Local DB) ──► Phase 4 (Mobile Auth) ──► Phase 7 (Launch)
         │                      │
         ▼                      ▼
Phase 3 (Multi-tenant) ──► Phase 4 (Cloud Sync)

Phase 5 (Drill-down) ─────────────────────────────────────► Phase 7 (Launch)
```

**Notes:**
- Phase 1 and 5 can start immediately in parallel
- Phase 2 must complete before Phase 4
- Phase 3 can run in parallel with Phase 2
- All phases must complete before Phase 7
