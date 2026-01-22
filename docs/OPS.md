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

## Backup & Recovery

*To be documented when backup strategy is established.*
