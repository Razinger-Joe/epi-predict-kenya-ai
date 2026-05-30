# 🐳 Docker Deployment Guide — EpiPredict Kenya AI

Quick reference for running EpiPredict Kenya AI with Docker.

---

## 🏗 Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ Frontend │────▶│ Backend  │────▶│ PostgreSQL   │     │  ML Service  │
│ (Nginx)  │     │ (FastAPI) │────▶│ (database)   │     │  (FastAPI)   │
│ :80      │     │ :8000    │     │ :5432        │     │  :5000       │
└──────────┘     └──────────┘     └──────────────┘     └──────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Clone and navigate
git clone https://github.com/Razinger-Joe/epi-predict-kenya-ai.git
cd epi-predict-kenya-ai

# 2. Build and start all 4 services
docker-compose up --build

# 3. Access the application
# Frontend:   http://localhost
# Backend:    http://localhost:8000
# API Docs:   http://localhost:8000/docs
# ML Service: http://localhost:5000/health
```

---

## 📦 Services

| Service | Build Context | Port | Image |
|---------|--------------|------|-------|
| **database-service** | `postgres:15-alpine` | 5432 | Pre-built |
| **ml-service** | `./ml-service` | 5000 | Custom |
| **backend** | `./backend` | 8000 | Custom |
| **frontend** | `./frontend` | 80 | Custom |

### Boot Order

Services start in dependency order with health checks:

```
1. database-service  (PostgreSQL — pg_isready health check)
2. ml-service        (FastAPI ML — curl /health)
3. backend           (FastAPI Gateway — waits for DB + ML to be healthy)
4. frontend          (Nginx — waits for backend to be healthy)
```

---

## 🔧 Build Individual Images

```bash
# Build each service independently
docker build -t epipredict-frontend:latest ./frontend
docker build -t epipredict-backend:latest ./backend
docker build -t epipredict-ml-service:latest ./ml-service

# View built images
docker images | grep epipredict
```

---

## 📊 Health Checks

```bash
# Check all service statuses
docker-compose ps

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f ml-service

# Check backend health
curl http://localhost:8000/health

# Check ML service health
curl http://localhost:5000/health

# Check frontend
curl http://localhost/
```

---

## 🔄 Common Operations

```bash
# Start in background (detached)
docker-compose up -d --build

# Restart a single service
docker-compose restart backend

# Rebuild a single service
docker-compose up --build backend

# Stop all services
docker-compose down

# Stop and remove all data (volumes)
docker-compose down -v

# View resource usage
docker stats
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
docker-compose logs backend
docker-compose build --no-cache backend
docker-compose up backend
```

### Database connection issues
- Verify the backend can reach `database-service:5432`
- Check `DATABASE_URL` is set correctly in docker-compose.yml
```bash
docker exec -it epipredict-backend sh
# Inside the container:
curl database-service:5432
```

### ML Service errors
```bash
docker-compose logs ml-service
# Check if models directory is accessible
docker exec -it epipredict-ml-service ls /app/models
```

### Frontend 404 errors
```bash
docker-compose logs frontend
# Verify nginx config is correct
docker exec -it epipredict-frontend cat /etc/nginx/nginx.conf
```

---

## 🛡️ Security Checklist

- [ ] `.env` files are NOT committed to Git
- [ ] Production secrets stored in CI/CD secrets
- [ ] HTTPS enabled in production
- [ ] Security headers configured in `nginx.conf`
- [ ] CORS origins restricted in backend config
- [ ] Database passwords changed from defaults

---

## ☸️ Kubernetes

For Kubernetes deployment, see:
- **Manifests**: `k8s/` directory
- **Learning Guide**: [docs/KUBERNETES_GUIDE.md](docs/KUBERNETES_GUIDE.md)

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Access via NodePort
curl http://localhost:30080
```

---

**For full documentation, see**: [README.md](README.md)
