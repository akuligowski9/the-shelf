# Deploy The Shelf (Free Hosting)

Deploy to **Render** (free web hosting) + **Neon** (free PostgreSQL).

## Step 1: Create Neon Database (5 min)

1. Go to [neon.tech](https://neon.tech) and sign up (use GitHub for easy login)
2. Click **"Create Project"**
3. Name it `the-shelf`, pick region closest to you
4. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)
5. In the Neon SQL Editor, paste and run the contents of `db/schema.sql` to create tables

## Step 2: Push to GitHub

Make sure your code is on GitHub:

```bash
git add .
git commit -m "Add Render deployment config"
git push
```

## Step 3: Deploy to Render (10 min)

1. Go to [render.com](https://render.com) and sign up (use GitHub)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repo (`the-shelf`)
4. Render will detect `render.yaml` and create 2 services:
   - `shelf-api` (backend)
   - `shelf-web` (frontend)

### Configure Environment Variables

After services are created:

**For `shelf-api`:**
1. Go to shelf-api → Environment
2. Add `DATABASE_URL` = your Neon connection string

**For `shelf-web`:**
1. Go to shelf-web → Environment
2. Add `VITE_API_URL` = `https://shelf-api.onrender.com` (your API URL from Render)

3. Trigger a redeploy on `shelf-web` (Settings → Manual Deploy)

## Step 4: Access Your App

After deployment completes (~5 min):

- **Web App**: `https://shelf-web.onrender.com`
- **API**: `https://shelf-api.onrender.com/health`

## Notes

### Cold Starts
On the free tier, services sleep after 15 min of inactivity. First request after sleep takes ~30 seconds. This is normal.

### Custom Domain (Optional)
In Render dashboard, you can add a custom domain to either service for free.

### Mobile App
To use the mobile app with your deployed API, update the API URL in:
`frontend/shared/api/index.ts` → change the default URL, or set it at runtime.

### Local Development
Local dev still works the same:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Troubleshooting

**API won't start:**
- Check DATABASE_URL is correct and includes `?sslmode=require`
- Check Render logs for errors

**Frontend shows "API error":**
- Verify VITE_API_URL points to your Render API URL (with https://)
- Redeploy frontend after changing env vars

**Database connection error:**
- Neon connection string must include `?sslmode=require`
- Check if your IP is allowed in Neon (should be open by default)
