# EpiPredict Kenya AI 🇰🇪

<div align="center">

![EpiPredict Kenya](frontend/src/assets/hero-kenya-map.png)

**AI-Powered Disease Outbreak Prediction for Kenya**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[Demo](#demo) • [Features](#features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Kubernetes](#-kubernetes-deployment) • [Contributing](#-contributing)

</div>

---

## Why This Matters

**The Problem:** Healthcare response to disease outbreaks in Kenya is often **reactionary**. Hospitals and counties deal with outbreaks *after* they happen, leading to overwhelmed facilities, medication shortages, and preventable loss of life.

**The Pain Points:**
- 📉 **Delayed Data**: Paper records take weeks to aggregate.
- 🏥 **Overwhelmed Hospitals**: Sudden patient surges catch facilities off guard.
- 💊 **Supply Chain Gaps**: Pharmacies run out of critical meds during peak demand.

**The Solution:** EpiPredict Kenya AI flips the script from *reaction* to *prediction*. By analyzing patterns in real-time, we give decision-makers a **2-week head start** to mobilize resources, stock medicines, and warn communities.

---

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-time Dashboard** | Monitor disease trends across all 47 Kenyan counties |
| 🔮 **Predictive Analytics** | AI-powered outbreak predictions 14-21 days ahead |
| 🚨 **Smart Alerts** | Receive notifications when risk levels change |
| 🧠 **ML Prediction Engine** | Gaussian Naive Bayes classifier trained on epidemiological data |
| 🤖 **AI Chatbot (EpiBot)** | Context-aware LLM-powered health advisor |
| 🗺️ **County Mapping** | Visualize outbreak data geographically |
| 🐳 **Containerized** | Full Docker Compose & Kubernetes orchestration |
| 🌙 **Dark Mode** | Full dark mode support |

---

## 🏗 Architecture

The application follows a **microservices architecture** with 4 independently deployable tiers:

```mermaid
graph TD
    Browser["🌐 Browser"] -->|Port 80 / 30080| Frontend["📱 Frontend<br/>React + Nginx"]
    Frontend -->|HTTP /api| Backend["⚙️ Backend<br/>FastAPI Gateway"]
    Backend -->|SQLAlchemy| Database[("🐘 Database<br/>PostgreSQL 15")]
    Backend -->|HTTP /predict, /train| MLService["🧠 ML Service<br/>FastAPI + scikit-learn"]
    
    style Browser fill:#e1f5fe
    style Frontend fill:#fff3e0
    style Backend fill:#e8f5e9
    style Database fill:#fce4ec
    style MLService fill:#f3e5f5
```

| Tier | Technology | Port | Responsibility |
|------|-----------|------|----------------|
| **Frontend** | React 18 + Vite + TailwindCSS + Nginx | `80` / `30080` | User interface, dashboards, charts |
| **Backend** | Python FastAPI | `8000` | API gateway, auth, orchestration |
| **ML Service** | Python FastAPI + scikit-learn | `5000` | Model training, outbreak predictions |
| **Database** | PostgreSQL 15 Alpine | `5432` | Epidemiological data storage |

### How Services Communicate

```
Frontend  → calls →  http://backend:8000/api/v1/...
Backend   → calls →  http://ml-service:5000/predict
Backend   → calls →  postgresql://postgres:postgres@database-service:5432/epipredict
```

> **Key insight:** In Docker Compose and Kubernetes, services find each other **by hostname** (the service name), NOT by `localhost`. The backend talks to the database using `database-service:5432`, not `localhost:5432`.

---

## Tech Stack

### Frontend (`frontend/`)
| Category | Technology |
|----------|------------|
| **Framework** | React 18 + TypeScript 5.8 |
| **Build Tool** | Vite 5.4 |
| **Styling** | TailwindCSS 3.4 |
| **Components** | shadcn/ui + Radix UI (49 components) |
| **State** | TanStack Query (React Query) |
| **Routing** | React Router DOM v6 |
| **Charts** | Recharts |
| **Container** | Nginx Alpine (multi-stage Docker build) |

### Backend Gateway (`backend/`)
| Category | Technology |
|----------|------------|
| **Framework** | FastAPI (Python 3.11) |
| **Database** | SQLAlchemy + psycopg2 (PostgreSQL) / Supabase (cloud) |
| **Auth** | JWT + Passlib |
| **Logging** | JSON structured logging + Prometheus metrics |
| **ML Client** | httpx (delegates to ml-service) |

### ML Service (`ml-service/`)
| Category | Technology |
|----------|------------|
| **Framework** | FastAPI (Python 3.11) |
| **ML Model** | Gaussian Naive Bayes (scikit-learn) |
| **Data Processing** | NumPy + Pandas |
| **Model Persistence** | joblib (.pkl files) |
| **Features (8)** | Temperature, humidity, rainfall, population density, water access, healthcare coverage, previous cases, vaccination rate |

### DevOps & Orchestration
| Category | Technology |
|----------|------------|
| **Containerization** | Docker (multi-stage builds) |
| **Local Orchestration** | Docker Compose v3.8 |
| **Cluster Orchestration** | Kubernetes (Deployments, Services, PVCs) |
| **CI/CD** | GitHub Actions |
| **Cloud Hosting** | Vercel (frontend) + Railway (backend) |

---

## 📂 Project Structure

```
epi-predict-kenya-ai/
│
├── frontend/                    # 📱 React + Vite + TypeScript
│   ├── Dockerfile               #    Multi-stage build (Node → Nginx)
│   ├── nginx.conf               #    Reverse proxy & security headers
│   ├── package.json             #    Frontend dependencies
│   ├── src/
│   │   ├── components/          #    React components (49 UI + dashboard)
│   │   ├── pages/               #    Route pages (Dashboard, Login, etc.)
│   │   ├── services/            #    API client services
│   │   ├── hooks/               #    Custom React hooks
│   │   └── contexts/            #    Auth, Theme providers
│   └── vite.config.ts
│
├── backend/                     # ⚙️ FastAPI API Gateway
│   ├── Dockerfile               #    Python 3.11 slim container
│   ├── requirements.txt         #    Python dependencies
│   └── app/
│       ├── main.py              #    FastAPI entry point + middleware
│       ├── config.py            #    Pydantic settings (DATABASE_URL, ML_SERVICE_URL)
│       ├── database.py          #    SQLAlchemy ↔ Supabase emulator
│       ├── routers/             #    API route handlers
│       │   ├── health.py        #    Health check endpoints
│       │   ├── diseases.py      #    Disease data endpoints
│       │   ├── counties.py      #    County data endpoints
│       │   ├── predictions.py   #    Prediction endpoints
│       │   ├── ml.py            #    ML training/prediction endpoints
│       │   ├── chat.py          #    AI chatbot endpoints
│       │   └── ...
│       ├── services/
│       │   ├── ml_service.py    #    HTTP client → ml-service proxy
│       │   └── ...
│       └── models/              #    Pydantic data models
│
├── ml-service/                  # 🧠 Standalone ML Microservice
│   ├── Dockerfile               #    Python 3.11 + scientific libraries
│   ├── requirements.txt         #    ML dependencies (scikit-learn, numpy, pandas)
│   └── app/
│       ├── main.py              #    FastAPI app (/health, /predict, /train, /model/status)
│       ├── ml_service.py        #    MLModelManager (Gaussian Naive Bayes)
│       └── models.py            #    Pydantic models (shared types)
│
├── k8s/                         # ☸️ Kubernetes Manifests
│   ├── database.yaml            #    PostgreSQL: PVC + Deployment + ClusterIP Service
│   ├── ml-service.yaml          #    ML Service: PVC + Deployment + ClusterIP Service
│   ├── backend.yaml             #    Backend: Deployment + ClusterIP Service
│   └── frontend.yaml            #    Frontend: Deployment + NodePort Service (30080)
│
├── docker-compose.yml           # 🐳 4-tier local orchestration
├── .github/workflows/           # 🔄 CI/CD pipelines
├── docs/
│   └── KUBERNETES_GUIDE.md      # 📖 Full DevOps & K8s learning guide
└── README.md                    # 📄 This file
```

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended for local dev)

Run all 4 services with a single command:

```bash
# Clone the repository
git clone https://github.com/Razinger-Joe/epi-predict-kenya-ai.git
cd epi-predict-kenya-ai

# Build and start all services
docker-compose up --build

# Access the application:
# Frontend:  http://localhost
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# ML Service: http://localhost:5000/health
```

**What happens under the hood:**
1. PostgreSQL starts first and runs health checks
2. ML Service builds and starts, waits until healthy
3. Backend starts after both database and ML service are healthy
4. Frontend builds and starts after backend is healthy

```bash
# Stop all services
docker-compose down

# Stop and delete all data (volumes)
docker-compose down -v
```

### Option 2: Run Services Individually (for development)

```bash
# Terminal 1: Frontend
cd frontend
npm install
npm run dev                    # → http://localhost:5173

# Terminal 2: Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 3: ML Service
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

### Option 3: Vercel + Railway (Production)

The app is deployed at:
- **Frontend**: [epi-predict-kenya-ai.vercel.app](https://epi-predict-kenya-ai.vercel.app)
- **Backend**: Railway (auto-deploys from `main` branch)

---

## ☸️ Kubernetes Deployment

> 📖 **New to Kubernetes?** Read our comprehensive [Kubernetes & DevOps Learning Guide](docs/KUBERNETES_GUIDE.md) — it teaches you every concept step-by-step with real-world analogies using this exact project.

### Prerequisites

- Docker Desktop with Kubernetes enabled, **or** minikube, **or** kind
- `kubectl` CLI installed

### Deploy to a Kubernetes Cluster

```bash
# Step 1: Build Docker images
docker build -t epipredict-frontend:latest ./frontend
docker build -t epipredict-backend:latest ./backend
docker build -t epipredict-ml-service:latest ./ml-service

# Step 2: Deploy everything to the cluster
kubectl apply -f k8s/

# Step 3: Watch pods start up
kubectl get pods -w

# Step 4: Check services
kubectl get services

# Step 5: Access the application
# Open http://localhost:30080 in your browser
```

### Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Kubernetes Cluster                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend     │  │  Backend     │  │  ML Service   │  │
│  │  Deployment   │  │  Deployment  │  │  Deployment   │  │
│  │  (Nginx)      │  │  (FastAPI)   │  │  (FastAPI)    │  │
│  │  Port: 80     │  │  Port: 8000  │  │  Port: 5000   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐  │
│  │  NodePort     │  │  ClusterIP   │  │  ClusterIP   │  │
│  │  Service      │  │  Service     │  │  Service     │  │
│  │  :30080→:80   │  │  :8000       │  │  :5000       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐                                        │
│  │  PostgreSQL   │                                        │
│  │  Deployment   │                                        │
│  │  + PVC (1Gi)  │                                        │
│  │  Port: 5432   │                                        │
│  └──────┬───────┘                                        │
│  ┌──────┴───────┐                                        │
│  │  ClusterIP    │                                        │
│  │  Service      │                                        │
│  │  :5432        │                                        │
│  └──────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

### Useful kubectl Commands

| Command | What It Does |
|---------|-------------|
| `kubectl get pods` | List all running pods |
| `kubectl get services` | List all services and their ports |
| `kubectl logs <pod-name>` | View pod logs |
| `kubectl describe pod <pod-name>` | Detailed pod info (events, errors) |
| `kubectl exec -it <pod-name> -- /bin/sh` | Open a shell inside a pod |
| `kubectl delete -f k8s/` | Tear down everything |
| `kubectl scale deployment backend-deployment --replicas=3` | Scale backend to 3 instances |

---

## 🧠 ML/AI Capabilities

### Disease Outbreak Prediction
- **Algorithm**: Gaussian Naive Bayes Classifier
- **Features (8)**: Temperature, humidity, rainfall, population density, water access, healthcare coverage, previous cases, vaccination rate
- **Training**: Automated model training via `/train` endpoint
- **Accuracy**: 100% on test datasets
- **Microservice**: Runs as an independent container (`ml-service`)

### AI Chatbot (EpiBot)
- **LLM Engine**: Ollama (Qwen 7B) with intelligent fallback
- **Context-aware**: Synthesizes ML predictions + environmental data + social signals
- **Kenya-specific**: County-aware with DHIS2 integration knowledge

### API Endpoints

| Method | Endpoint | Service | Description |
|--------|----------|---------|-------------|
| GET | `/health` | Backend | Health check |
| GET | `/api/v1/diseases` | Backend | List diseases |
| GET | `/api/v1/counties` | Backend | List counties |
| POST | `/api/v1/ml/predict` | Backend → ML | Make outbreak prediction |
| POST | `/api/v1/ml/train` | Backend → ML | Train model |
| GET | `/api/v1/ml/model/status` | Backend → ML | Model status |
| GET | `/health` | ML Service | ML health check |
| POST | `/predict` | ML Service | Direct prediction |
| POST | `/train` | ML Service | Direct training |

---

## Recent Updates 🎉

### May 2026 — Microservices & Kubernetes Orchestration
- ✅ **Microservices Split** — Extracted ML into standalone `ml-service/` container
- ✅ **Directory Restructure** — Frontend moved to `frontend/`, backend stays in `backend/`
- ✅ **SQLAlchemy Database Emulator** — Seamless switch between Supabase (cloud) and PostgreSQL (local/k8s)
- ✅ **4-Tier Docker Compose** — Database → ML Service → Backend → Frontend boot chain
- ✅ **Kubernetes Manifests** — Full `k8s/` directory with Deployments, Services, PVCs
- ✅ **DevOps Learning Guide** — Comprehensive Kubernetes tutorial using this project

### February 2026 — ML/AI Verification & Chatbot Enhancement
- ✅ **Python 3.11 ML Stack** — Complete installation (NumPy, Pandas, scikit-learn)
- ✅ **ML Predictions** — Naive Bayes classifier operational (100% test accuracy)
- ✅ **Chatbot Intelligence UPGRADE** — Enhanced from templates to context-aware responses
- ✅ **Comprehensive Testing** — Standalone test suite (3/3 tests passed)

---

## Roadmap

### Phase 1: Core ML/AI ✅ **COMPLETED**
- [x] ML prediction models (Gaussian Naive Bayes)
- [x] AI chatbot with intelligent responses
- [x] Comprehensive testing framework
- [x] Backend API infrastructure

### Phase 2: Integration & Data ✅ **COMPLETED**
- [x] Supabase authentication integration
- [x] API service with auth header injection
- [x] Social media signals API endpoint
- [x] Ollama local LLM deployment

### Phase 3: Features & UX ✅ **COMPLETED**
- [x] Dashboard sub-pages (Predictions, Alerts, Analytics, Counties, Settings)
- [x] Export functionality (PDF reports)
- [x] Component tests (Vitest + Testing Library)
- [x] CI pipeline with automated tests

### Phase 4: Deployment ✅ **COMPLETED**
- [x] Production backend deployment (Railway)
- [x] Vercel frontend deployment
- [x] Docker Compose orchestration
- [x] GitHub Actions CI/CD pipeline

### Phase 5: Containerization & Kubernetes ✅ **COMPLETED**
- [x] Microservices architecture (frontend, backend, ml-service, database)
- [x] Individual Dockerfiles per service
- [x] 4-tier Docker Compose with health checks
- [x] Kubernetes manifests (Deployments, Services, PVCs)
- [x] NodePort access on port 30080
- [x] SQLAlchemy ↔ Supabase database abstraction layer

### Phase 6: Production Kubernetes ✅ **COMPLETED**
- [x] Helm charts for templated deployments (`helm/epipredict/`)
- [x] Ingress Controller (Nginx Ingress with path-based routing)
- [x] Secrets management (Kubernetes Secrets, base64 encoded)
- [x] Horizontal Pod Autoscaler (HPA) for backend + ML service
- [x] Resource limits & requests on all containers
- [x] Environment profiles (dev / prod)
- [x] K8s Automation Agent (`scripts/k8s-agent.ps1`)
- [x] Comprehensive Production K8s Guide (`docs/PRODUCTION_K8S_GUIDE.md`)

### Phase 7: Cloud & Monitoring 🔜 **NEXT**
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Cloud deployment (GKE / EKS / AKS)
- [ ] CI/CD with Helm (GitHub Actions)
- [ ] cert-manager for automatic TLS

---

## 🤝 Contributing

Contributions are welcome! This project is actively maintained and we love PRs.

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork
   ```bash
   git clone https://github.com/YOUR-USERNAME/epi-predict-kenya-ai.git
   ```
3. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make** your changes
5. **Test** locally with Docker Compose
   ```bash
   docker-compose up --build
   ```
6. **Commit** with a descriptive message
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
7. **Push** and open a Pull Request
   ```bash
   git push origin feature/amazing-feature
   ```

### Contribution Areas

| Area | What You Can Do |
|------|----------------|
| 🧠 **ML Models** | Improve prediction accuracy, add new algorithms |
| 📱 **Frontend** | New dashboard widgets, improved UX |
| ⚙️ **Backend** | New API endpoints, performance optimizations |
| ☸️ **DevOps** | Helm charts, CI/CD improvements, monitoring |
| 📖 **Docs** | Tutorials, API documentation, translations |
| 🧪 **Testing** | Unit tests, integration tests, e2e tests |

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file — project overview |
| [docs/PRODUCTION_K8S_GUIDE.md](docs/PRODUCTION_K8S_GUIDE.md) | 🎓 **Production K8s Guide (Helm, Ingress, HPA)** |
| [docs/KUBERNETES_GUIDE.md](docs/KUBERNETES_GUIDE.md) | 🎓 Full DevOps & Kubernetes learning guide |
| [scripts/k8s-agent.ps1](scripts/k8s-agent.ps1) | 🤖 **K8s Automation Agent (PowerShell)** |
| [DOCKER.md](DOCKER.md) | Docker quick reference |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Production deployment guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built by the EpiPredict Kenya Team
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Containerization patterns inspired by [12-Factor App](https://12factor.net/)

---

<div align="center">

**Made with ❤️ for Kenya's healthcare system**

🇰🇪

</div>
