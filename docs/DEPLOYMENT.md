# CodePulse Production Deployment Guide

Follow this guide to deploy CodePulse with **GitHub + Cloudflare**.

---

## 1. Prerequisites
* A GitHub repository containing the CodePulse codebase.
* A Cloudflare account ([dash.cloudflare.com](https://dash.cloudflare.com/)).
* A production Node.js host for the backend API (e.g. Render, Railway, Fly.io, or VPS) or Cloudflare Workers.

---

## 2. Step 1: Database Migration & Backup
Before deploying:
```bash
# Apply SQL migrations
npm run migrate

# Run automated backup snapshot
node -e "import('./database/migrations/migrate.js')"
```

---

## 3. Step 2: Deploy Frontend to Cloudflare Pages

### Option A: Via GitHub Integration (Recommended)
1. Go to Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. Select your repository: `codepulse`.
3. Configure the build parameters:
   * **Framework preset**: `Vite`
   * **Root directory**: `frontend`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
4. Add Environment Variable:
   * `VITE_API_URL`: `https://api.yourdomain.com/api` (or leave empty if using Pages `_redirects` proxy)
5. Click **Save and Deploy**.

### Option B: Via Wrangler CLI
```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=codepulse
```

---

## 4. Step 3: Deploy Backend API

Deploy the `backend` folder to your selected production runtime (e.g. Render, Railway, or VPS):
* **Build Command**: `npm ci && npm run build`
* **Start Command**: `node dist/server.js`
* **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=5000
  DATABASE_PATH=./data/codetrack.sqlite
  JWT_SECRET=<YOUR_SECURE_RANDOM_SECRET>
  FRONTEND_URL=https://codepulse.yourdomain.com
  CORS_ORIGIN=https://codepulse.yourdomain.com
  ```

---

## 5. Step 4: Verification
Execute the production verification suite to confirm all 18 checks pass:
```bash
BACKEND_URL=https://api.yourdomain.com node scripts/verify-production.js
```
