# Railway Dashboard Deployment Guide (Recommended Alternative)

## Why Dashboard Deployment?

Railway CLI authentication can be temperamental. The **Dashboard method** is more reliable and gives you visual control over the deployment.

---

## 🎯 Step-by-Step Dashboard Deployment

### Step 1: Access Railway Dashboard

1. Open browser and go to: **https://railway.app/dashboard**
2. Sign in with your GitHub account
3. You should see your existing project: **epi-predict-kenya-ai**

### Step 2: Select Your Project

1. Click on **epi-predict-kenya-ai** project
2. You'll see your existing backend service
3. Look for the "Settings" or "Deployments" tab

### Step 3: Update GitHub Integration

Since we've pushed new Docker configs to GitHub:

1. Railway should **automatically detect** the changes
2. Look for a notification about new commits
3. **OR** manually trigger redeploy:
   - Go to **Deployments** tab
   - Click **"Deploy"** button
   - Select latest commit: `7b52ebf` (Docker deployment)

### Step 4: Configure Environment Variables (If Needed)

1. Go to **Variables** tab in Railway dashboard
2. Verify these are set:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `DATABASE_URL`
   - `ENVIRONMENT=production`
   - `ALLOWED_ORIGINS` (include Railway domain)

3. If any are missing, click **"New Variable"** and add them

### Step 5: Monitor Deployment

1. Go to **Deployments** tab
2. Watch the build logs in real-time
3. Look for:
   ```
   ✅ Building Docker image...
   ✅ Creating container...
   ✅ Health check passed
   ✅ Deployment successful
   ```

### Step 6: Get Your Deployment URL

1. Go to **Settings** tab
2. Look for **Domains** section
3. Copy your Railway URL (something like):
   ```
   https://epi-predict-kenya-ai-production.up.railway.app
   ```

---

## ✅ Verification Checklist

Once deployed, verify:

```powershell
# Replace with your actual Railway URL
$URL = "https://epi-predict-kenya-ai-production.up.railway.app"

# 1. Health check
curl "$URL/health"

# 2. API docs
curl "$URL/docs"

# 3. Frontend
curl -I "$URL/"
```

---

## 🚀 Alternative: Use GitHub Actions

Our CI/CD pipeline can also deploy automatically!

### Option A: Automatic on Push

1. Any push to `main` branch triggers GitHub Actions
2. GitHub Actions builds Docker images
3. Can configure deployment to Railway from Actions

### Option B: Manual Workflow Trigger

1. Go to: https://github.com/Razinger-Joe/epi-predict-kenya-ai/actions
2. Select **"Build and Deploy"** workflow
3. Click **"Run workflow"**
4. Select `main` branch
5. Click **"Run workflow"** button

---

## 📊 Current Status

**Code**: ✅ All Docker configs pushed to GitHub (commit 7b52ebf)  
**Railway Project**: ✅ Exists (epi-predict-kenya-ai-production)  
**Environment**: ✅ Variables ready  
**Method**: 🎯 Dashboard deployment (most reliable)

---

## 🎖️ Deployment Decision Matrix

| Method | Speed | Reliability | Visual Control | Recommended |
|--------|-------|-------------|----------------|-------------|
| Railway CLI | Fast | Medium | Low | ❌ Not now |
| Railway Dashboard | Medium | **High** | **High** | ✅ **YES** |
| GitHub Actions | Medium | **High** | Medium | ✅ Backup |

**RECOMMENDATION**: Use Railway Dashboard for this deployment.

---

## Next Steps

1. **Open Railway Dashboard**: https://railway.app/dashboard
2. **Find your project**: epi-predict-kenya-ai
3. **Trigger deployment** from latest commit
4. **Monitor logs** until successful
5. **Verify endpoints** using curl commands above

**This is the most reliable path to deployment.** 🚀
