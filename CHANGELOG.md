# Changelog

All notable changes to EpiPredict Kenya AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-05-30

### Added
- **Helm Charts** (`helm/epipredict/`): Full production-grade Helm chart with templated deployments
  - `Chart.yaml` — Chart metadata with semantic versioning
  - `values.yaml` — All configurable values with rich documentation
  - `values-dev.yaml` — Development profile (1 replica, no HPA, low resources)
  - `values-prod.yaml` — Production profile (3+ replicas, HPA enabled, high resources)
  - `templates/_helpers.tpl` — Reusable template helpers following Kubernetes label conventions
  - `templates/namespace.yaml` — Dedicated namespace for isolation
  - `templates/secrets.yaml` — Base64-encoded database credentials (no more hardcoded passwords)
  - `templates/ingress.yaml` — Nginx Ingress with path-based routing
  - `templates/database/` — PostgreSQL PVC, Deployment, Service
  - `templates/ml-service/` — ML Service PVC, Deployment, Service, HPA
  - `templates/backend/` — Backend Deployment, Service, HPA
  - `templates/frontend/` — Frontend Deployment, Service, HPA
  - `templates/NOTES.txt` — Post-install instructions
- **Nginx Ingress** — Single entry point replacing NodePort:
  - `/` → Frontend (React dashboard)
  - `/api/` → Backend (FastAPI gateway) with URL rewriting
  - `/health` → Backend health check
- **Horizontal Pod Autoscaler (HPA)** — Auto-scaling for 3 services:
  - Backend: 2→5 replicas at 70% CPU / 80% memory
  - ML Service: 1→3 replicas at 60% CPU / 70% memory
  - Frontend: 1→3 replicas at 80% CPU
  - Stabilization windows to prevent scaling flapping
- **Kubernetes Secrets** — Database credentials stored as Secrets, referenced via `secretKeyRef`
- **Resource Limits** — CPU and memory requests/limits on all containers
- **K8s Automation Agent** (`scripts/k8s-agent.ps1`): PowerShell menu-driven automation
  - Prerequisites check, image building, Helm deploy, status dashboard
  - Log viewer, scaling, port forwarding, load testing
  - Full guided walkthrough mode for learning
- **Production K8s Guide** (`docs/PRODUCTION_K8S_GUIDE.md`): 7-chapter DevOps learning guide
  - Helm charts, Ingress, HPA, Secrets, Automation, Monitoring, Production Readiness
  - Kenya-specific analogies, Mermaid diagrams, troubleshooting flowcharts

### Changed
- **README.md** — Phase 6 marked complete, Phase 7 roadmap added, new documentation links
- **CHANGELOG.md** — Added v3.0.0 entry

---

## [2.0.0] - 2026-05-29

### Added
- **Microservices Architecture**: Split monolith into 4 independently deployable tiers
- **Standalone ML Service** (`ml-service/`): FastAPI microservice for Gaussian Naive Bayes predictions
- **Kubernetes Manifests** (`k8s/`): Full production-grade Deployments, Services, and PVCs
  - `database.yaml` — PostgreSQL with PersistentVolumeClaim
  - `ml-service.yaml` — ML Service with model storage PVC
  - `backend.yaml` — Backend gateway with env vars for service discovery
  - `frontend.yaml` — Frontend with NodePort 30080
- **SQLAlchemy Database Emulator**: Seamless switch between Supabase (cloud) and PostgreSQL (local/k8s)
- **DevOps Learning Guide** (`docs/KUBERNETES_GUIDE.md`): Comprehensive Kubernetes tutorial
- **Backend ML Client Proxy**: Stateless HTTP client delegating to ml-service

### Changed
- **Directory restructure**: Frontend moved from root to `frontend/` directory
- **Dockerfiles relocated**: Each service now has its own Dockerfile in its directory
- **docker-compose.yml**: Rewritten for 4-tier orchestration with health-checked boot order
- **backend/app/config.py**: Added `DATABASE_URL` and `ML_SERVICE_URL` settings
- **backend/app/database.py**: Full rewrite with SQLAlchemy ↔ Supabase PostgREST emulator
- **backend/app/services/ml_service.py**: Converted from in-process ML to HTTP client proxy
- **README.md**: Complete rewrite with architecture diagrams and deployment instructions
- **DOCKER.md**: Updated for new multi-service stack
- **.gitignore**: Added Python compiled files, __pycache__, venv exclusions

### Removed
- Root-level `Dockerfile` (replaced by `backend/Dockerfile`)
- Root-level `Dockerfile.frontend` (replaced by `frontend/Dockerfile`)
- Tracked `__pycache__` compiled files from Git index

---

## [1.1.0] - 2026-03-11

### Added
- **Supabase Authentication**: AuthContext, ProtectedRoute, real sign-in/sign-up flows
- **Social Media Signals API**: `/api/v1/social/signals` endpoint with Pydantic models
- **PDF Export**: Analytics dashboard export via jsPDF + html2canvas
- **Frontend Component Tests**: Dashboard + Predictions tests with Vitest
- **CI Test Step**: Automated test execution on every push to main
- **User Avatar & Logout**: DashboardHeader shows authenticated user initials + logout dropdown

### Changed
- Protected all `/dashboard/*` routes behind authentication
- API service now injects Supabase auth token as Bearer header
- README roadmap updated — all 4 phases marked complete
- Signup form wired to Supabase with user metadata (org, county, name)

### Technical
- SocialHarvester class with structured signal generation
- Social router registered in FastAPI main.py
- Export button added to DashboardAnalytics page
- jsPDF + html2canvas dependencies added

## [1.0.0] - 2026-02-05

### Added
- ML/AI verification complete (3/3 tests passed)
- Enhanced chatbot intelligence (context-aware, no templates)
- Comprehensive testing documentation (Chapter 5)
- Production deployment to Vercel + Railway

## [0.2.0] - 2026-02-26

### Added
- Theme system overhaul (light/dark mode toggle)
- Mobile navigation (slide-out drawer, hamburger menu)
- Analytics page with Recharts visualizations
- Dashboard sub-pages (Predictions, Alerts, Counties, Settings)
- Comprehensive project documentation

---

## [0.1.0] - 2026-01-19

### Added
- Initial project setup with Vite + React + TypeScript
- Landing page with hero section, features, and CTA
- Login page with email/password form
- Multi-step signup flow (Organization → Contact → Account)
- Dashboard layout with sidebar navigation
- Animated statistics cards
- Kenya-themed design system (green/red colors)
- Dark mode support
- shadcn/ui component library integration
- Responsive design for all screen sizes

### Technical
- React 18.3 with TypeScript 5.8
- Vite 5.4 build tool
- TailwindCSS 3.4 for styling
- React Router DOM v6 for routing
- TanStack Query for state management
- React Hook Form + Zod for form validation

---

[Unreleased]: https://github.com/Razinger-Joe/epi-predict-kenya-ai/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Razinger-Joe/epi-predict-kenya-ai/releases/tag/v0.1.0
