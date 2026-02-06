# 🎖️ Military-Grade Deployment Checklist
## Pre-Deployment Verification Protocol

### ✅ PHASE 1: Repository Status Check

```powershell
# Execute in project root
cd c:\Users\USER\OneDrive\Documents\GitHub\epi-predict-kenya-ai

# 1. Verify Git status
git status
# Expected: "working tree clean"

# 2. Verify remote sync
git fetch origin
git status
# Expected: "up to date with 'origin/main'"

# 3. Verify latest commit
git log -1 --oneline
# Expected: 7b52ebf - Docker deployment commit
```

**DECISION POINT 1**: Proceed ONLY if all checks ✅ GREEN

---

### ✅ PHASE 2: Environment Variables Preparation

Create `.env.production` file with **REAL** credentials:

```env
# Supabase (REQUIRED)
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_KEY=[your-anon-key]
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Application
ENVIRONMENT=production
PORT=8000
ALLOWED_ORIGINS=https://[your-railway-domain].railway.app

# Optional (can add later)
# OLLAMA_URL=http://localhost:11434
```

**ACTION REQUIRED**: Get credentials from Supabase dashboard

---

### ✅ PHASE 3: Railway Account Setup

#### Option A: Railway CLI Installation (Recommended)

```powershell
# Install Railway CLI globally
npm install -g @railway/cli

# Verify installation
railway --version

# Login to Railway
railway login
# Opens browser for authentication
```

#### Option B: Railway Dashboard Only

- Visit: https://railway.app
- Sign up with GitHub
- Connect repository directly

**DECISION POINT 2**: Choose Option A for CLI control

---

### ✅ PHASE 4: Docker Configuration Validation

```powershell
# Verify all Docker files exist
Test-Path Dockerfile
Test-Path Dockerfile.frontend
Test-Path docker-compose.yml
Test-Path nginx.conf

# Expected: All return True
```

---

### ✅ PHASE 5: Dependency Verification

```powershell
# Backend dependencies
Test-Path backend\requirements.txt

# Frontend dependencies
Test-Path package.json

# Both should exist
```

---

## 🚀 DEPLOYMENT EXECUTION

### Railway CLI Deployment (Precision Method)

```powershell
# Step 1: Initialize Railway project
railway init

# Step 2: Link to this directory
# Railway will detect docker-compose.yml

# Step 3: Set environment variables
railway variables set SUPABASE_URL="https://your-project.supabase.co"
railway variables set SUPABASE_KEY="your-anon-key"
railway variables set DATABASE_URL="your-database-url"
railway variables set ENVIRONMENT="production"

# Step 4: Deploy
railway up
```

---

### Railway Dashboard Deployment (GUI Method)

1. **Create New Project**
   - Go to https://railway.app/new
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your repository
   - Select: `Razinger-Joe/epi-predict-kenya-ai`

2. **Configure Service**
   - Railway auto-detects `docker-compose.yml`
   - Set environment variables in dashboard
   - Click "Deploy"

3. **Monitor Deployment**
   - Watch build logs in real-time
   - Wait for "Deployment successful" ✅

---

## 🔍 POST-DEPLOYMENT VALIDATION

### Step 1: Get Deployment URL

```powershell
# Via CLI
railway domain

# Expected output: https://[random-name].railway.app
```

### Step 2: Health Check Sequence

```powershell
# Set your Railway URL
$RAILWAY_URL = "https://[your-deployment].railway.app"

# 1. Backend health
curl "$RAILWAY_URL/health"
# Expected: 200 OK with {"status": "healthy"}

# 2. Frontend load
curl -I "$RAILWAY_URL/"
# Expected: 200 OK

# 3. API documentation
curl "$RAILWAY_URL/docs"
# Expected: 200 OK (OpenAPI docs)

# 4. Test ML prediction endpoint
curl -X POST "$RAILWAY_URL/api/v1/ml/predict" `
  -H "Content-Type: application/json" `
  -d '{
    "county": "Nairobi",
    "disease": "malaria",
    "temperature": 28.0,
    "humidity": 85.0,
    "rainfall": 150.0,
    "population_density": 10000.0,
    "access_to_water": 45.0,
    "healthcare_coverage": 50.0,
    "previous_cases": 300,
    "vaccination_rate": 30.0
  }'
# Expected: 200 OK with prediction results
```

### Step 3: Visual Validation

Open browser and verify:
- ✅ Homepage loads
- ✅ Dashboard accessible
- ✅ No console errors
- ✅ Dark mode works
- ✅ Navigation functional

---

## 🎖️ SUCCESS CRITERIA CHECKLIST

- [ ] **Build**: Docker images built without errors
- [ ] **Deploy**: Containers running in Railway
- [ ] **Health**: All health checks passing
- [ ] **Frontend**: Application loads in browser
- [ ] **Backend**: API responds to requests
- [ ] **ML**: Predictions endpoint functional
- [ ] **Chatbot**: AI responses working
- [ ] **Database**: Supabase connection verified
- [ ] **Logs**: No critical errors in first 15 minutes
- [ ] **Performance**: API response time < 500ms

---

## ⚠️ TROUBLESHOOTING MATRIX

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| **Build fails** | Check Dockerfile syntax | Verify Dockerfile locally |
| **Container crashes** | Environment variables missing | Check Railway variables |
| **502 Bad Gateway** | Backend not responding | Check health endpoint, review logs |
| **Frontend 404** | nginx config issue | Verify nginx.conf syntax |
| **Database error** | Supabase credentials wrong | Re-check DATABASE_URL |
| **CORS error** | ALLOWED_ORIGINS not set | Add Railway domain to ALLOWED_ORIGINS |

---

## 🚨 ROLLBACK PROCEDURE

If deployment fails:

```powershell
# Via Railway CLI
railway rollback

# Or via Dashboard
# Go to Deployments tab
# Click "Rollback" on previous successful deployment
```

---

## 📊 MONITORING SETUP

### Railway Built-in Monitoring

1. Go to Railway dashboard
2. Select your service
3. Click "Metrics" tab
4. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### External Monitoring (Optional)

- **UptimeRobot**: Free uptime monitoring
- **BetterStack**: Log aggregation
- **Sentry**: Error tracking

---

## ✅ DEPLOYMENT COMPLETE VERIFICATION

Run this final checklist:

```powershell
# 1. Service is running
railway status
# Expected: "Running"

# 2. Logs are clean
railway logs
# Expected: No errors, only INFO/DEBUG

# 3. Domain is accessible
railway domain
# Copy URL and open in browser

# 4. All endpoints respond
# Test each endpoint from validation section above
```

**IF ALL CHECKS PASS**: ✅ **DEPLOYMENT SUCCESSFUL!**

**IF ANY FAIL**: Review troubleshooting matrix and logs

---

## 🎯 NEXT STEPS POST-DEPLOYMENT

1. **Document deployment URL** in README.md
2. **Update frontend .env** to point to production API
3. **Set up custom domain** (optional)
4. **Configure monitoring alerts**
5. **Schedule 24-hour health check**
6. **Plan first backup**

---

**Mission Status**: READY TO EXECUTE 🎖️
