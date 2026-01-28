# The Shelf — Operations

> Operational procedures for deploying, maintaining, and recovering the system.
> See `OPS_PRIVATE.md` for credentials or internal access details.

---

## Deployment (Cloud Run + Neon + Vercel)

Production deployment uses **Google Cloud Run** (backend), **Neon** (PostgreSQL), and **Vercel** (frontend).

### Current Production URLs

- **Web App**: https://the-shelf-amk.vercel.app
- **API**: https://shelf-api-785607788916.us-east1.run.app

### Step 1: Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up (use GitHub for easy login)
2. Click **"Create Project"**
3. Name it `the-shelf`, pick region closest to you (e.g., `aws-us-east-1`)
4. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
5. In the Neon SQL Editor, paste and run the contents of `db/schema.sql` to create tables

### Step 2: Deploy Backend to Cloud Run

1. Install gcloud CLI: `brew install --cask google-cloud-sdk`
2. Authenticate: `gcloud auth login`
3. Deploy:

```bash
gcloud run deploy shelf-api \
  --source backend/api \
  --region us-east1 \
  --allow-unauthenticated \
  --max-instances=2 \
  --set-env-vars "DATABASE_URL=<your-neon-connection-string>"
```

The `--max-instances=2` flag prevents runaway costs.

### Step 3: Deploy Frontend to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy:

```bash
cd frontend/web
vercel
```

3. Add environment variable in Vercel dashboard:
   - `VITE_API_URL` = your Cloud Run API URL

4. Redeploy to pick up the environment variable:

```bash
vercel --prod
```

---

## Operational Notes

### Cold Starts

Cloud Run scales to zero when idle. First request after idle may take 1-2 seconds. This is normal and much faster than Render's free tier (~30s).

### Cost Protection

- **Budget alerts**: Set up in GCP Console under Billing → Budgets
- **Max instances**: Deployment uses `--max-instances=2` to cap scaling
- **Free tier**: Cloud Run offers 2M requests/month free; Neon offers 0.5 GB storage free; Vercel offers unlimited personal projects

### Custom Domain (Optional)

- Vercel: Add custom domain in project settings
- Cloud Run: Configure in GCP Console under Cloud Run → Service → Domain Mappings

### Mobile App

**Setup:**

```bash
cd frontend/mobile
npm install
npm start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan QR code with Expo Go for physical device.

**Configure API URL:**

The mobile app defaults to `http://localhost:3001` (iOS) or `http://10.0.2.2:3001` (Android emulator). To use a deployed API:

1. Update `frontend/shared/api/index.ts` default URL, OR
2. Call `setApiBaseUrl('https://your-api.run.app')` at runtime

**Offline Support:**

The mobile app includes an offline queue system:
- Mutations automatically queue when network unavailable
- Auto-syncs when connectivity restored
- Queue persists in AsyncStorage (survives app restart)
- Visual status banner shows offline/syncing state
- Exponential backoff retry logic (max 3 attempts)

**Dependencies:**
- `@react-native-community/netinfo` - Network state monitoring
- `@react-native-async-storage/async-storage` - Queue persistence

Run `npm install` in `frontend/mobile` after pulling updates.

### Local Development

Local dev still works the same:
```bash
docker-compose -f docker-compose.dev.yml up
```

---

## Troubleshooting

**API won't start:**
- Check DATABASE_URL is correct and includes `?sslmode=require`
- Check Cloud Run logs: `gcloud run services logs read shelf-api --region us-east1`

**Frontend shows "API error":**
- Verify VITE_API_URL points to your Cloud Run API URL (with https://)
- Redeploy frontend after changing env vars: `vercel --prod`

**Database connection error:**
- Neon connection string must include `?sslmode=require`
- Check if your IP is allowed in Neon (should be open by default)

**Redeploy backend:**
```bash
gcloud run deploy shelf-api \
  --source backend/api \
  --region us-east1 \
  --allow-unauthenticated \
  --max-instances=2
```
(Environment variables persist from previous deployment)

---

## Demo Deployment

To deploy a public demo instance for visitors to explore:

### 1. Create a Separate Neon Database

1. Create a new Neon project called `the-shelf-demo`
2. Run `db/schema.sql` to create tables
3. Note the connection string

### 2. Deploy Demo Backend to Cloud Run

```bash
gcloud run deploy shelf-api-demo \
  --source backend/api \
  --region us-east1 \
  --allow-unauthenticated \
  --max-instances=2 \
  --set-env-vars "DATABASE_URL=<demo-neon-connection-string>,DEMO_MODE=true"
```

### 3. Deploy Demo Frontend to Vercel

1. Create a new Vercel project (or use branch deployments)
2. Set environment variables:
   - `VITE_API_URL` = your demo Cloud Run URL
   - `VITE_DEMO_MODE` = `true`

### 4. Seed Demo Data

After deployment, seed the database:

```bash
# Call the reset endpoint (requires DEMO_MODE=true)
curl -X POST https://shelf-api-demo-xxxxx.us-east1.run.app/demo/reset
```

### 5. Demo Mode Features

When `DEMO_MODE=true`:
- `GET /demo/status` returns `{ demo_mode: true }`
- `POST /demo/reset` resets the database to sample data
- Frontend can show a demo banner (if VITE_DEMO_MODE=true)

### 6. Periodic Reset (Optional)

Set up a Cloud Scheduler job to reset demo data daily:

```bash
gcloud scheduler jobs create http reset-demo-daily \
  --schedule="0 6 * * *" \
  --uri="https://shelf-api-demo-xxxxx.us-east1.run.app/demo/reset" \
  --http-method=POST \
  --location=us-east1
```

---

## Authentication Setup

The app supports OAuth with Google and GitHub. This protects your personal data while allowing demo visitors to browse in read-only mode.

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Click **Create Credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Add authorized redirect URI: `https://your-cloud-run-url.run.app/auth/google/callback`
6. Copy the **Client ID** and **Client Secret**

### 2. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `The Shelf`
   - Homepage URL: `https://your-vercel-url.vercel.app`
   - Authorization callback URL: `https://your-cloud-run-url.run.app/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**

### 3. Update Cloud Run Environment Variables

```bash
gcloud run deploy shelf-api \
  --source backend/api \
  --region us-east1 \
  --allow-unauthenticated \
  --max-instances=2 \
  --set-env-vars "\
DATABASE_URL=<your-neon-connection-string>,\
DEMO_MODE=true,\
JWT_SECRET=<generate-a-random-32-char-string>,\
ALLOWED_EMAIL=<your-email@example.com>,\
FRONTEND_URL=https://your-vercel-url.vercel.app,\
API_URL=https://your-cloud-run-url.run.app,\
GOOGLE_CLIENT_ID=<your-google-client-id>,\
GOOGLE_CLIENT_SECRET=<your-google-client-secret>,\
GITHUB_CLIENT_ID=<your-github-client-id>,\
GITHUB_CLIENT_SECRET=<your-github-client-secret>"
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `DEMO_MODE` | Enable demo mode (`true`/`false`) | No |
| `JWT_SECRET` | Secret for signing auth tokens | Yes (for auth) |
| `ALLOWED_EMAIL` | Your email (only this user can write) | Yes (for auth) |
| `FRONTEND_URL` | Vercel frontend URL | Yes (for auth) |
| `API_URL` | Cloud Run API URL | Yes (for auth) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No (enables Google login) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No (enables Google login) |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No (enables GitHub login) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | No (enables GitHub login) |

### Auth Behavior

| Scenario | Read Access | Write Access |
|----------|-------------|--------------|
| `DEMO_MODE=false`, no auth configured | Full | Full |
| `DEMO_MODE=true`, not logged in | Read-only | Blocked |
| `DEMO_MODE=true`, logged in as allowed user | Full | Full |
| `DEMO_MODE=true`, logged in as other user | Read-only | Blocked |

---

## Multi-Database Architecture

The Shelf uses **separate databases for each environment** to ensure complete data isolation. This prevents demo visitors from seeing personal data and eliminates risk of accidental data corruption.

### Environment Overview

| Environment | Database | Backend | Frontend | Purpose |
|-------------|----------|---------|----------|---------|
| **Production** | shelf-prod (Neon) | shelf-api-785607788916.us-east1.run.app | the-shelf-amk.vercel.app | Owner's real data |
| **Demo** | shelf-demo (Neon) | shelf-api-demo-785607788916.us-east1.run.app | demo-the-shelf.vercel.app | Public demo with fictional data |
| **Local** | localhost:5432 | localhost:3001 | localhost:5173 | Development and testing |

### Why Separate Databases?

We evaluated three approaches:

1. **Single DB with `user_id` column** - Adds complexity to every query, risk of data leakage through bugs
2. **Multiple Neon databases** ✓ - Complete isolation, simpler queries, no risk of cross-contamination
3. **Neon branching** - Like git branches for databases, more complex to manage

**Decision:** Multiple Neon databases. Neon's free tier allows multiple projects, so there's no cost impact.

### Connection Strings

Store these in environment-specific `.env` files or Cloud Run env vars:

```
# Production (shelf-prod Neon project)
DATABASE_URL=postgresql://neondb_owner:***@ep-raspy-field-ah0w3ev0-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Demo (shelf-demo Neon project)
DATABASE_URL=postgresql://neondb_owner:***@ep-withered-sound-ah7kr1w3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Local (Docker PostgreSQL)
DATABASE_URL=postgres://shelf:shelf@localhost:5432/shelf
```

### Demo Data Reset

Demo data resets automatically every hour via GitHub Actions:

- **Workflow:** `.github/workflows/reset-demo.yml`
- **Schedule:** Every hour at minute 0 (`0 * * * *`)
- **Endpoint:** `POST /demo/reset` with `X-Reset-Secret` header
- **Secret:** Stored in GitHub repository secrets as `DEMO_RESET_SECRET`

The demo data is completely fictional (Music, French, Fitness, Photography, Reading, Cooking habits) spanning 6 months of entries. See `data/demo-habits.json` and `data/logs/demo/*.json`.

### Unauthorized Login Behavior

When someone tries to log in on the demo site but isn't the allowed user:
- They are redirected to the portfolio contact page (`PORTFOLIO_URL` env var)
- Default: https://akuligowski-portfolio.vercel.app/

This provides a friendly redirect instead of an error message.

---

## Database Migrations

The Shelf uses a migration system for versioned schema changes. See [MIGRATIONS.md](./MIGRATIONS.md) for complete documentation.

### Quick Reference

```bash
cd backend/api

# Check migration status
npm run migrate:status

# Create new migration
npm run migrate:create -- add_new_column

# Run pending migrations (development)
npm run migrate

# Run pending migrations (production)
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
```

### Production Migration Workflow

**CRITICAL: Always backup before production migrations!**

```bash
# Step 1: Test on demo database first
DATABASE_URL=$DEMO_URL npm run backup
DATABASE_URL=$DEMO_URL npm run migrate
# Verify demo site still works

# Step 2: Backup production
DATABASE_URL=$PROD_URL npm run backup

# Step 3: Run migrations (with confirmation)
DATABASE_URL=$PROD_URL RUN_MIGRATIONS_ON_PRODUCTION=yes npm run migrate
# Type 'y' when prompted

# Step 4: Verify production site
# Check the-shelf-amk.vercel.app

# Step 5: Verify migration status
DATABASE_URL=$PROD_URL npm run migrate:status
```

### Safety Features

- **Production guard:** Requires `RUN_MIGRATIONS_ON_PRODUCTION=yes` environment variable
- **Interactive confirmation:** Must type 'y' at prompt for production
- **Transaction wrapping:** Auto-rollback on any error
- **Existing table detection:** Initial migration safely skips if schema exists

See [MIGRATIONS.md](./MIGRATIONS.md) for:
- Creating migrations
- Best practices
- Rollback procedures
- Troubleshooting

---

## Mutation Logging

All write operations (POST, PUT, PATCH, DELETE) are logged to the `mutation_logs` table for audit and data recovery purposes.

### Configuration

Enabled via environment variable in Cloud Run:
```
LOG_MUTATIONS=true
```

### Log Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `method` | TEXT | HTTP method (POST, PUT, PATCH, DELETE) |
| `path` | TEXT | Request path (e.g., `/entries`, `/habits/3`) |
| `status` | INT | HTTP response status code |
| `duration_ms` | INT | Request duration in milliseconds |
| `body` | JSONB | Full request body (for data recovery) |
| `created_at` | TIMESTAMP | When the request was made |

### Useful Queries

**Recent mutations:**
```sql
SELECT method, path, status, duration_ms, created_at
FROM mutation_logs
ORDER BY created_at DESC
LIMIT 20;
```

**Top endpoints by usage (last 7 days):**
```sql
SELECT path, method, COUNT(*) as count, AVG(duration_ms)::int as avg_ms
FROM mutation_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY path, method
ORDER BY count DESC;
```

**Failed requests (for debugging):**
```sql
SELECT method, path, status, body, created_at
FROM mutation_logs
WHERE status >= 400
ORDER BY created_at DESC
LIMIT 10;
```

**Recover data from a specific request:**
```sql
SELECT body, created_at
FROM mutation_logs
WHERE path = '/entries' AND method = 'POST'
ORDER BY created_at DESC
LIMIT 5;
```

### Data Recovery Use Case

If entries are accidentally deleted or corrupted, the `body` column contains the full request payload. You can reconstruct the data by:

1. Query the relevant mutations
2. Extract the JSON body
3. Re-insert via API or direct SQL

### Retention

Mutation logs are included in nightly backups. Consider periodic cleanup for very old logs:

```sql
-- Delete logs older than 90 days (run manually, with caution)
DELETE FROM mutation_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## Backup & Recovery

### Automated Nightly Backups

Production database is backed up nightly via GitHub Actions:

- **Workflow:** `.github/workflows/nightly-backup.yml`
- **Schedule:** 5:00 AM UTC (midnight EST)
- **Output:** `data/backups/backup-YYYY-MM-DD.json`
- **Retention:** 30 days (older files automatically deleted)
- **Secret:** `PROD_DATABASE_URL` in GitHub repository secrets

Backups are committed to the repo, providing:
- Version control history of all backups
- Off-site storage (GitHub)
- Easy access for restore operations

**Backup contents:**
- All user data tables (habits, practices, actions, targets, entries, etc.)
- Migration history (schema_migrations table)
- Settings and mutation logs

### Automated Daily Log Export

Daily entries are exported to JSON logs via GitHub Actions:

- **Workflow:** `.github/workflows/daily-export.yml`
- **Schedule:** 4:59 AM UTC (11:59 PM Eastern)
- **Output:** `data/daily/YYYY-MM-DD.json`
- **Format:** Human-readable with both IDs and names for habits/practices
- **Secret:** `PROD_DATABASE_URL` in GitHub repository secrets

Daily logs provide a human-readable archive of each day's entries.

### Manual Backup

To create a backup manually:

```bash
cd backend/api
DATABASE_URL=<connection-string> npm run backup
```

This creates `data/backups/backup-YYYY-MM-DD.json`.

### Restore from Backup

To restore a backup to local development database:

```bash
cd backend/api
npm run restore
# Restores from latest backup in data/backups/
```

**Safety:** The restore script refuses to run against Neon databases (prevents accidental production overwrites).

### Auto-Restore on Dev Start

When you run `npm run dev`, the dev-start script automatically:
1. Finds the latest backup in `data/backups/`
2. Restores it to your local PostgreSQL
3. Starts the development server

To skip auto-restore: `npm run dev:skip-restore`

### Manual Export of Daily Log

To export a specific day's entries:

```bash
cd backend/api
DATABASE_URL=<connection-string> node export-daily.js 2026-01-24
```

### Neon Point-in-Time Recovery

Neon provides built-in point-in-time recovery for paid plans. On the free tier:
- Use the GitHub-committed backups for recovery
- Daily backups provide 30-day recovery window
- Backup files can be imported via the Settings → Import feature in the app

### Recovery Procedure

1. **From JSON backup:**
   - Download the backup file from `data/backups/`
   - Go to Settings → Import in the app
   - Upload the backup file
   - Review preview and confirm import

2. **From daily logs:**
   - Daily logs at `data/daily/YYYY-MM-DD.json` can be imported individually
   - Useful for recovering specific days

3. **Full database restore (local):**
   ```bash
   cd backend/api
   npm run restore
   ```
