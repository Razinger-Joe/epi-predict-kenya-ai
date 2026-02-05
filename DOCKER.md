# ═══════════════════════════════════════════════════════════════════════════════
# Docker Deployment README
# Quick reference guide for deploying EpiPredict Kenya AI
# ═══════════════════════════════════════════════════════════════════════════════

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed
- Docker Compose v3.8+
- `.env.production` file configured

### Local Development

```bash
# 1. Create environment file
cp .env.production.example .env

# 2. Build and start all services
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Production Deployment

#### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway up
```

#### Option 2: Render
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy from `docker-compose.yml`

#### Option 3: Manual Docker Deployment
```bash
# Build images
docker-compose build

# Push to registry (if needed)
docker tag epipredict-backend:latest your-registry/epipredict-backend
docker push your-registry/epipredict-backend

# Deploy on server
docker-compose up -d
```

## 📊 Health Checks

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost/
```

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
docker-compose up backend
```

### Frontend 404 errors
- Verify nginx.conf is copied correctly
- Check frontend build completed: `docker-compose logs frontend`

### Database connection issues
- Verify Supabase credentials in `.env`
- Check `DATABASE_URL` format

## 🛡️ Security Checklist

- [ ] `.env` files NOT committed to Git
- [ ] Production secrets stored in CI/CD secrets
- [ ] HTTPS enabled (production)
- [ ] Security headers configured (nginx.conf)
- [ ] CORS origins restricted

## 📈 Monitoring

```bash
# Resource usage
docker stats

# Container inspect
docker inspect epipredict-backend

# Network inspection
docker network inspect epipredict-network
```

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

---

**For full documentation, see**: `implementation_plan.md`
