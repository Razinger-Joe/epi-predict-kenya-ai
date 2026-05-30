# 🏥 EpiPredict Kenya AI — Production Kubernetes Guide

> **A hands-on DevOps learning journey**: From raw YAML to a production-grade Kubernetes deployment, explained with real-world Kenyan analogies.

---

**Project**: EpiPredict Kenya AI — AI-powered disease outbreak prediction system  
**Stack**: React+Nginx · FastAPI · FastAPI+scikit-learn · PostgreSQL  
**Platform**: Docker Desktop with built-in Kubernetes on Windows  
**Last Updated**: May 2026

---

## Table of Contents

| Chapter | Title | What You'll Learn |
|---------|-------|-------------------|
| 1 | [From Raw YAML to Helm](#chapter-1-from-raw-yaml-to-helm) | Templating, Charts, reusable configs |
| 2 | [Ingress — Your Application's Front Door](#chapter-2-ingress--your-applications-front-door) | Path-based routing, TLS, single entry point |
| 3 | [HPA — Auto-Scaling Like a Smart Hospital](#chapter-3-hpa--auto-scaling-like-a-smart-hospital) | Horizontal Pod Autoscaler, metrics-server |
| 4 | [Secrets Management](#chapter-4-secrets-management) | Secure credentials, base64, secretKeyRef |
| 5 | [Using the Automation Agent](#chapter-5-using-the-automation-agent) | k8s-agent.ps1, one-click deployments |
| 6 | [Monitoring & Debugging](#chapter-6-monitoring--debugging) | kubectl commands, logs, troubleshooting |
| 7 | [Production Readiness Checklist](#chapter-7-production-readiness-checklist) | Final audit before going live |

---

# Chapter 1: From Raw YAML to Helm

## 🤔 Why Do We Need Helm?

Right now, your EpiPredict project has four separate YAML files in the `k8s/` directory:

```
k8s/
├── backend.yaml      # 60 lines — Deployment + Service
├── database.yaml     # 84 lines — PVC + Deployment + Service
├── frontend.yaml     # 50 lines — Deployment + Service
└── ml-service.yaml   # 69 lines — PVC + Deployment + Service
```

That's **263 lines** of YAML with hardcoded values scattered everywhere. Now imagine you need to:

- Deploy to **staging** with 2 replicas and a test database password
- Deploy to **production** with 5 replicas and a strong password
- Change the Docker image tag from `latest` to `v2.3.1`

You'd have to edit **every file manually**. That's like a chef who memorizes every recipe from scratch each time instead of following a cookbook.

### The Analogy

> **Helm is to Kubernetes what a recipe book is to cooking** — instead of remembering all ingredients and steps, you follow a standardized template. The recipe (template) stays the same; you just adjust the quantities (values) for how many people you're serving.

```mermaid
flowchart LR
    A["📝 values.yaml<br/>(ingredients list)"] --> C["⚙️ Helm Engine<br/>(the chef)"]
    B["📄 templates/<br/>(recipe steps)"] --> C
    C --> D["📋 Rendered Manifests<br/>(ready-to-cook meal)"]
    D --> E["☸️ kubectl apply<br/>(serve to Kubernetes)"]

    style A fill:#e8f5e9,stroke:#2e7d32,color:#000
    style B fill:#e3f2fd,stroke:#1565c0,color:#000
    style C fill:#fff3e0,stroke:#ef6c00,color:#000
    style D fill:#fce4ec,stroke:#c62828,color:#000
    style E fill:#f3e5f5,stroke:#6a1b9a,color:#000
```

## 📦 Before vs After: The Raw YAML Problem

### ❌ BEFORE — Hardcoded Values (What We Have Now)

Look at our actual `k8s/backend.yaml`:

```yaml
# k8s/backend.yaml — HARDCODED everything
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment          # ← Hardcoded name
spec:
  replicas: 1                       # ← Can't change per environment
  template:
    spec:
      containers:
        - name: backend
          image: epipredict-backend:latest    # ← Always "latest"
          env:
            - name: DATABASE_URL
              # ↓ PASSWORD IS RIGHT HERE IN PLAIN TEXT!
              value: "postgresql://postgres:postgres@database-service:5432/epipredict"
            - name: ML_SERVICE_URL
              value: "http://ml-service:5000"  # ← Hardcoded
```

> [!CAUTION]
> The database password `postgres` is stored in **plain text** directly in the YAML file. Anyone with access to your Git repository can see it. This is a critical security risk — we'll fix this in [Chapter 4](#chapter-4-secrets-management).

### ✅ AFTER — Helm Template (What We Want)

```yaml
# helm/epipredict/templates/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "epipredict.fullname" . }}-backend
spec:
  replicas: {{ .Values.backend.replicas }}
  template:
    spec:
      containers:
        - name: backend
          image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "epipredict.fullname" . }}-db-secret
                  key: database-url
            - name: ML_SERVICE_URL
              value: "http://{{ include "epipredict.fullname" . }}-ml-service:{{ .Values.mlService.service.port }}"
```

```yaml
# helm/epipredict/values.yaml — One file controls everything
backend:
  replicas: 1
  image:
    repository: epipredict-backend
    tag: latest
  service:
    port: 8000

mlService:
  replicas: 1
  image:
    repository: epipredict-ml-service
    tag: latest
  service:
    port: 5000

database:
  image:
    repository: postgres
    tag: 15-alpine
  credentials:
    user: postgres
    password: postgres        # Overridden by secrets in production
    database: epipredict
  storage:
    size: 1Gi

frontend:
  replicas: 1
  image:
    repository: epipredict-frontend
    tag: latest
  service:
    port: 80
```

> [!TIP]
> With Helm, deploying to staging is just: `helm install epipredict ./helm/epipredict -f values-staging.yaml`  
> No file editing. No copy-paste errors. One command.

## 🗂️ Helm Chart Structure

A Helm chart is just a **directory with a specific structure**. Here's what our EpiPredict chart would look like:

```
helm/epipredict/
├── Chart.yaml              # Chart metadata (name, version, description)
├── values.yaml             # Default configuration values
├── values-staging.yaml     # Staging overrides (optional)
├── values-production.yaml  # Production overrides (optional)
└── templates/
    ├── _helpers.tpl         # Reusable template snippets
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── ml-service-deployment.yaml
    ├── ml-service-service.yaml
    ├── database-deployment.yaml
    ├── database-service.yaml
    ├── database-pvc.yaml
    ├── ml-models-pvc.yaml
    ├── ingress.yaml
    └── secrets.yaml
```

### Key Files Explained

| File | Purpose | Analogy |
|------|---------|---------|
| `Chart.yaml` | Chart identity — name, version, description | The cover page of the recipe book |
| `values.yaml` | Default settings for all services | The "serves 4" default ingredient list |
| `templates/` | YAML files with `{{ }}` placeholders | The actual recipe steps |
| `_helpers.tpl` | Shared template functions | Common cooking techniques referenced across recipes |

### Chart.yaml Example

```yaml
apiVersion: v2
name: epipredict
description: EpiPredict Kenya AI — Disease Outbreak Prediction Platform
type: application
version: 1.0.0       # Chart version (your packaging version)
appVersion: "1.0.0"  # Application version (your code version)
maintainers:
  - name: EpiPredict Team
    email: team@epipredict.co.ke
```

### _helpers.tpl — Reusable Snippets

```yaml
{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some k8s name fields are limited.
*/}}
{{- define "epipredict.fullname" -}}
{{- default .Chart.Name .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to every resource.
*/}}
{{- define "epipredict.labels" -}}
app.kubernetes.io/name: {{ include "epipredict.fullname" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

> [!NOTE]
> `_helpers.tpl` starts with an underscore (`_`) because Helm treats files starting with `_` as partials — they are **not** rendered as Kubernetes manifests on their own. They're only used by other templates via the `{{ include }}` or `{{ template }}` directives.

## 🚀 Helm Commands Cheat Sheet

```powershell
# Install the chart (first deployment)
helm install epipredict ./helm/epipredict

# Install with custom values (staging environment)
helm install epipredict-staging ./helm/epipredict -f values-staging.yaml

# Upgrade an existing release
helm upgrade epipredict ./helm/epipredict

# See what Helm WOULD generate without actually deploying
helm template epipredict ./helm/epipredict

# Roll back to the previous version
helm rollback epipredict 1

# Uninstall
helm uninstall epipredict

# List all releases
helm list
```

> [!IMPORTANT]
> `helm template` is your best friend during development. It renders the YAML locally so you can inspect it before deploying. Think of it as a "dry run" — like checking the meal looks right before serving.

---

# Chapter 2: Ingress — Your Application's Front Door

## 🤔 Why Do We Need Ingress?

Right now, EpiPredict's frontend uses a **NodePort** service:

```yaml
# k8s/frontend.yaml (current)
spec:
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080    # ← You access this at localhost:30080
  type: NodePort
```

This works, but it has problems:

| Problem | Impact |
|---------|--------|
| Each service needs its own port | `30080` for frontend, `30800` for backend? Confusing! |
| Port range is limited (30000-32767) | Can't use standard ports like 80 or 443 |
| No path-based routing | Can't route `/api/` to backend and `/` to frontend |
| No TLS termination | Can't do HTTPS easily |
| Not production-ready | No real production system uses NodePort as the entry point |

### The Analogy

> **Think of Ingress as the reception desk at Kenyatta National Hospital** — there is **one main entrance** for everyone, but the receptionist looks at why you're there and routes you to the right department. You don't need a separate door for cardiology, a separate door for pediatrics, and another for radiology. One entrance, smart routing.

```mermaid
flowchart TB
    subgraph "❌ Without Ingress (Current Setup)"
        U1["🧑 User"] -->|":30080"| FN["Frontend<br/>NodePort 30080"]
        U2["🧑 User"] -->|":30800"| BN["Backend<br/>NodePort 30800"]
        U3["🧑 User"] -->|":30500"| MN["ML Service<br/>NodePort 30500"]
    end
```

```mermaid
flowchart TB
    subgraph "✅ With Ingress (Target Setup)"
        U["🧑 User"] -->|"epipredict.local"| IG["🚪 Ingress Controller<br/>Port 80/443"]
        IG -->|"/"| FS["Frontend<br/>ClusterIP"]
        IG -->|"/api/"| BS["Backend<br/>ClusterIP"]
        IG -->|"/ml/"| MS["ML Service<br/>ClusterIP"]
    end
```

> [!TIP]
> With Ingress, all services become `ClusterIP` (internal only). The Ingress Controller is the **only** publicly accessible component. This is more secure and mirrors real production architectures.

## 🏗️ Architecture: How Ingress Works

```mermaid
sequenceDiagram
    participant B as 🌐 Browser
    participant IC as 🚪 Ingress Controller (Nginx)
    participant IR as 📋 Ingress Resource (Rules)
    participant FE as ⚛️ Frontend Service
    participant BE as ⚡ Backend Service

    B->>IC: GET epipredict.local/
    IC->>IR: Check routing rules
    IR-->>IC: Route "/" → Frontend
    IC->>FE: Forward request
    FE-->>IC: HTML/JS response
    IC-->>B: Return page

    B->>IC: GET epipredict.local/api/predict
    IC->>IR: Check routing rules
    IR-->>IC: Route "/api/" → Backend
    IC->>BE: Forward request
    BE-->>IC: JSON prediction data
    IC-->>B: Return API response
```

### Key Concepts

| Concept | What It Is | Analogy |
|---------|-----------|---------|
| **Ingress Resource** | A YAML config defining routing rules | The routing chart posted on the reception wall |
| **Ingress Controller** | The actual Nginx (or Traefik) pod that does routing | The actual receptionist doing the work |
| **Annotations** | Extra configuration on the Ingress resource | Special instructions ("VIP patients go to Room 1") |
| **TLS** | HTTPS certificate configuration | The security guard checking IDs |

> [!WARNING]
> An **Ingress Resource** by itself does nothing. It's just a set of rules. You **must** also install an **Ingress Controller** (like nginx-ingress) that reads those rules and acts on them. Think of it like writing traffic laws without having any traffic police — the rules exist, but nobody enforces them.

## 📝 Setting Up Ingress for EpiPredict

### Step 1: Install the Ingress Controller

```powershell
# Enable the NGINX Ingress Controller on Docker Desktop
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/cloud/deploy.yaml

# Wait for it to be ready
kubectl wait --namespace ingress-nginx `
  --for=condition=ready pod `
  --selector=app.kubernetes.io/component=controller `
  --timeout=120s
```

### Step 2: Create the Ingress Resource

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: epipredict-ingress
  annotations:
    # Tell nginx to rewrite /api/xxx to /xxx when forwarding to backend
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    # Enable CORS for frontend-backend communication
    nginx.ingress.kubernetes.io/enable-cors: "true"
    # Max upload size (for ML model uploads)
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  ingressClassName: nginx
  rules:
    - host: epipredict.local
      http:
        paths:
          # Frontend — serves the React app
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80

          # Backend API — /api/anything → backend:8000/anything
          - path: /api(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: backend
                port:
                  number: 8000

          # ML Service — /ml/anything → ml-service:5000/anything
          - path: /ml(/|$)(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: ml-service
                port:
                  number: 5000
```

### Step 3: Add Local DNS

```powershell
# Add to C:\Windows\System32\drivers\etc\hosts (run as Administrator)
# Add this line:
127.0.0.1  epipredict.local
```

### Step 4: Convert Services to ClusterIP

Once Ingress is handling external traffic, change the frontend service from `NodePort` to `ClusterIP`:

```yaml
# k8s/frontend.yaml — Updated
spec:
  ports:
    - port: 80
      targetPort: 80
      protocol: TCP
  selector:
    app: frontend
  type: ClusterIP      # ← Changed from NodePort
```

### Step 5: Adding TLS (HTTPS)

```yaml
# k8s/ingress.yaml — with TLS
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - epipredict.local
      secretName: epipredict-tls-secret    # ← References a TLS Secret
  rules:
    - host: epipredict.local
      http:
        paths:
          # ... same paths as above
```

> [!NOTE]
> For local development, you can generate a self-signed certificate using `mkcert`:
> ```powershell
> # Install mkcert
> choco install mkcert
> mkcert -install
> mkcert epipredict.local
> # Create the TLS secret
> kubectl create secret tls epipredict-tls-secret `
>   --cert=epipredict.local.pem `
>   --key=epipredict.local-key.pem
> ```

## Path Routing Summary

| Path | Routes To | Port | Purpose |
|------|-----------|------|---------|
| `/` | `frontend` | 80 | React dashboard UI |
| `/api/*` | `backend` | 8000 | FastAPI REST endpoints |
| `/ml/*` | `ml-service` | 5000 | ML prediction engine |

---

# Chapter 3: HPA — Auto-Scaling Like a Smart Hospital

## 🤔 Why Auto-Scaling?

EpiPredict predicts disease outbreaks. During a **cholera outbreak in Mombasa**, thousands of health workers could be querying the prediction API simultaneously. Without auto-scaling, your single backend pod would be overwhelmed, and the dashboard would crash — exactly when it's needed most.

### The Analogy

> **Imagine Kenyatta National Hospital automatically opening more consultation rooms during a cholera outbreak and closing them when the crisis passes.** During normal days, 2 doctors handle the outpatient queue. When a cholera outbreak hits and 500 patients arrive, the hospital dynamically opens 10 more rooms and calls in more doctors. When the outbreak subsides, the extra rooms close, and doctors go home. That's exactly what the Horizontal Pod Autoscaler (HPA) does for your Kubernetes pods.

## 📊 How HPA Works

```mermaid
sequenceDiagram
    participant MS as 📊 Metrics Server
    participant HPA as ⚖️ HPA Controller
    participant D as 📦 Deployment
    participant P1 as 🟢 Pod 1
    participant P2 as 🟢 Pod 2
    participant P3 as 🟢 Pod 3

    Note over MS,P3: Normal Load — 1 Pod Running
    MS->>HPA: CPU usage: 20%
    HPA->>HPA: 20% < target 70% ✓
    Note over HPA: No action needed

    Note over MS,P3: 🚨 Cholera Outbreak — Traffic Spike!
    MS->>HPA: CPU usage: 95%!
    HPA->>HPA: 95% > target 70% ⚠️
    HPA->>D: Scale to 3 replicas
    D->>P2: Create Pod 2
    D->>P3: Create Pod 3
    Note over P1,P3: Load distributed across 3 pods

    Note over MS,P3: 📉 Outbreak Subsides — Traffic Drops
    MS->>HPA: CPU usage: 15%
    HPA->>HPA: 15% < target 70%
    HPA->>HPA: Wait stabilization window (5 min)
    HPA->>D: Scale down to 1 replica
    D->>P3: Terminate Pod 3
    D->>P2: Terminate Pod 2
    Note over P1: Back to 1 pod, saving resources
```

## 🔧 Prerequisites: Install metrics-server

HPA needs **metrics-server** to know how much CPU/memory each pod is using. Without it, HPA is blind — like a hospital administrator who doesn't know how many patients are waiting.

```powershell
# Install metrics-server (required for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Docker Desktop, you may need to patch it to allow insecure TLS
kubectl patch deployment metrics-server -n kube-system `
  --type='json' `
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

# Verify metrics-server is running
kubectl top nodes
kubectl top pods
```

> [!IMPORTANT]
> If `kubectl top pods` returns `error: Metrics API not available`, the metrics-server isn't ready yet. Wait 1-2 minutes and try again. HPA **will not work** without it.

## 📋 Resource Limits (Required for HPA)

HPA calculates scaling based on the **percentage of requested CPU being used**. If you don't set resource requests, HPA has no baseline to compare against.

```yaml
# Example: backend container with resource limits
containers:
  - name: backend
    image: epipredict-backend:latest
    resources:
      requests:           # ← What the container ASKS for (guaranteed)
        cpu: 100m         # 100 millicores = 0.1 CPU
        memory: 128Mi     # 128 MB RAM
      limits:             # ← Maximum the container CAN use
        cpu: 500m         # 500 millicores = 0.5 CPU
        memory: 512Mi     # 512 MB RAM
```

> [!NOTE]
> **CPU Units**: `1000m` (millicores) = 1 full CPU core. `100m` = 10% of one core.  
> **Memory Units**: `Mi` = mebibytes (1 Mi ≈ 1.05 MB). `Gi` = gibibytes.
>
> Think of `requests` as the **minimum salary** (you're guaranteed this) and `limits` as the **maximum overtime** (you can work this much, but no more).

## 📊 HPA Configuration for Each Service

| Service | Min Pods | Max Pods | Target CPU | Why |
|---------|----------|----------|------------|-----|
| **Frontend** | 1 | 3 | 70% | Static files, rarely CPU-heavy |
| **Backend** | 1 | 5 | 60% | API gateway, handles DB + ML calls |
| **ML Service** | 1 | 4 | 50% | ML inference is CPU-intensive |
| **Database** | 1 | 1 | N/A | Databases should **not** be auto-scaled horizontally |

> [!WARNING]
> **Never auto-scale a database horizontally.** PostgreSQL is a stateful application — spinning up a second PostgreSQL pod doesn't create a replica; it creates a **separate, disconnected database**. For database scaling, use dedicated solutions like PostgreSQL replicas with Patroni, or managed databases like AWS RDS / GCP Cloud SQL.

## 📝 HPA Manifests

### Backend HPA

```yaml
# k8s/hpa-backend.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 1
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300    # Wait 5 minutes before scaling down
      policies:
        - type: Pods
          value: 1                        # Remove 1 pod at a time
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 30     # Scale up quickly (30 seconds)
      policies:
        - type: Pods
          value: 2                        # Add up to 2 pods at a time
          periodSeconds: 60
```

### ML Service HPA

```yaml
# k8s/hpa-ml-service.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-service-deployment
  minReplicas: 1
  maxReplicas: 4
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50       # Lower threshold — ML is CPU heavy
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Frontend HPA

```yaml
# k8s/hpa-frontend.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: frontend-deployment
  minReplicas: 1
  maxReplicas: 3
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## 🧪 Testing HPA

```powershell
# Check current HPA status
kubectl get hpa

# Watch HPA in real-time
kubectl get hpa --watch

# Generate artificial load on the backend to trigger scaling
kubectl run load-test --image=busybox --restart=Never -- `
  /bin/sh -c "while true; do wget -q -O- http://backend:8000/health; done"

# Watch pods scale up
kubectl get pods --watch

# Clean up load test
kubectl delete pod load-test
```

> [!TIP]
> The `stabilizationWindowSeconds: 300` for scale-down means HPA waits **5 minutes** after load drops before removing pods. This prevents "flapping" — pods being added and removed repeatedly during fluctuating traffic (like the lunch hour rush at a Nairobi restaurant — it goes up and down, so you don't want to send waiters home too quickly).

---

# Chapter 4: Secrets Management

## 🤔 Why Are Hardcoded Passwords Dangerous?

Look at what's currently in our `k8s/database.yaml`:

```yaml
env:
  - name: POSTGRES_USER
    value: "postgres"           # ← Plain text in YAML
  - name: POSTGRES_PASSWORD
    value: "postgres"           # ← ANYONE can read this!
  - name: POSTGRES_DB
    value: "epipredict"
```

And in `k8s/backend.yaml`:

```yaml
env:
  - name: DATABASE_URL
    # ↓ The password 'postgres' is embedded in the connection string!
    value: "postgresql://postgres:postgres@database-service:5432/epipredict"
```

### The Analogy

> **This is like writing your M-Pesa PIN on a sticky note on your laptop.** Your password is visible to anyone who can see your screen — or in this case, anyone who can read your Git repository. And since Git keeps history forever, even if you delete the file later, the password is **still in the Git history**. It's like removing the sticky note but leaving the security camera footage that recorded it.

> [!CAUTION]
> **Real-world risk**: If your GitHub repository is public (or gets leaked), attackers can extract database passwords, API keys, and other credentials from your YAML files. This has happened to major companies, causing data breaches affecting millions of users.

## 🔐 How Kubernetes Secrets Work

Kubernetes Secrets store sensitive data **separately** from your application code. Instead of hardcoding `postgres` in your YAML, you store it in a Secret object and **reference** it.

```mermaid
flowchart LR
    subgraph "❌ Before: Hardcoded"
        Y["YAML File"] -->|"contains password directly"| P["Pod"]
    end

    subgraph "✅ After: Secrets"
        S["🔒 K8s Secret<br/>(base64 encoded)"] -->|"injected at runtime"| P2["Pod"]
        Y2["YAML File"] -->|"references Secret name"| P2
    end

    style S fill:#ffebee,stroke:#c62828,color:#000
    style Y fill:#ffcdd2,stroke:#c62828,color:#000
    style P2 fill:#e8f5e9,stroke:#2e7d32,color:#000
```

### Step 1: Create the Secret

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: epipredict-db-secret
type: Opaque
data:
  # Values are base64-encoded (NOT encrypted — just encoded!)
  # echo -n 'postgres' | base64  →  cG9zdGdyZXM=
  postgres-user: cG9zdGdyZXM=
  postgres-password: cG9zdGdyZXM=
  postgres-db: ZXBpcHJlZGljdA==

---
apiVersion: v1
kind: Secret
metadata:
  name: epipredict-db-url-secret
type: Opaque
data:
  # echo -n 'postgresql://postgres:postgres@database-service:5432/epipredict' | base64
  database-url: cG9zdGdyZXNxbDovL3Bvc3RncmVzOnBvc3RncmVzQGRhdGFiYXNlLXNlcnZpY2U6NTQzMi9lcGlwcmVkaWN0
```

> [!WARNING]
> **base64 is NOT encryption!** Anyone can decode `cG9zdGdyZXM=` back to `postgres` instantly. Kubernetes Secrets provide **access control** (only authorized pods can read them) and **separation** (secrets aren't in your Git repo), but they are **not encrypted at rest** by default.
>
> For true encryption, use:
> - **Sealed Secrets** (Bitnami) — encrypts secrets so they're safe in Git
> - **External Secrets Operator** — pulls secrets from AWS Secrets Manager, Azure Key Vault, etc.
> - **SOPS** — encrypts values in YAML files using cloud KMS keys

### Step 2: Reference Secrets in Deployments

#### Database Deployment (Before → After)

```yaml
# ❌ BEFORE
env:
  - name: POSTGRES_PASSWORD
    value: "postgres"

# ✅ AFTER
env:
  - name: POSTGRES_PASSWORD
    valueFrom:
      secretKeyRef:
        name: epipredict-db-secret
        key: postgres-password
```

#### Backend Deployment (Before → After)

```yaml
# ❌ BEFORE
env:
  - name: DATABASE_URL
    value: "postgresql://postgres:postgres@database-service:5432/epipredict"

# ✅ AFTER
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: epipredict-db-url-secret
        key: database-url
```

### Step 3: Generate Secrets with PowerShell

```powershell
# Quick way to base64 encode values on Windows
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("postgres"))
# Output: cG9zdGdyZXM=

[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("my-strong-password-2026!"))
# Output: bXktc3Ryb25nLXBhc3N3b3JkLTIwMjYh

# Or create the secret directly with kubectl (no base64 needed!)
kubectl create secret generic epipredict-db-secret `
  --from-literal=postgres-user=postgres `
  --from-literal=postgres-password="my-strong-password-2026!" `
  --from-literal=postgres-db=epipredict
```

> [!TIP]
> Using `kubectl create secret` is easier than manually base64-encoding values. Kubernetes handles the encoding for you. The `--from-literal` flag lets you pass plain-text values directly.

### Complete Secured Database Deployment

```yaml
# k8s/database.yaml — SECURED version
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database-deployment
  labels:
    app: database-service
spec:
  replicas: 1
  selector:
    matchLabels:
      app: database-service
  template:
    metadata:
      labels:
        app: database-service
    spec:
      containers:
        - name: database
          image: postgres:15-alpine
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: epipredict-db-secret
                  key: postgres-user
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: epipredict-db-secret
                  key: postgres-password
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: epipredict-db-secret
                  key: postgres-db
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: database-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: database-storage
          persistentVolumeClaim:
            claimName: database-pvc
```

## Secrets Security Comparison

| Method | In Git? | Encrypted? | Easy to Use? | Best For |
|--------|---------|------------|-------------|----------|
| Plain text in YAML | ✅ Yes (bad!) | ❌ No | ✅ Very easy | Never do this |
| K8s Secrets (base64) | ❌ No | ❌ No (just encoded) | ✅ Easy | Dev/staging |
| Sealed Secrets | ✅ Yes (safe) | ✅ Yes | 🟡 Medium | GitOps workflows |
| External Secrets | ❌ No | ✅ Yes | 🟡 Medium | Cloud production |
| SOPS | ✅ Yes (safe) | ✅ Yes | 🟡 Medium | Multi-cloud |

---

# Chapter 5: Using the Automation Agent

## 🤔 Why an Automation Script?

Deploying EpiPredict to Kubernetes involves **building 3 Docker images, applying 4+ YAML files, and checking the status of 4+ pods**. That's a lot of commands to remember. The `k8s-agent.ps1` script automates all of this into a single interactive menu.

> Think of it as having a **hospital administrator** who handles all the paperwork for you — you just tell them what you need ("admit a patient", "run lab tests"), and they take care of the 15 forms that need filling out.

## 📋 Prerequisites

Before using the automation agent, ensure you have:

| Requirement | Check Command | Expected Output |
|-------------|--------------|-----------------|
| Docker Desktop | `docker version` | `Docker version 27.x.x` |
| Kubernetes enabled | `kubectl cluster-info` | `Kubernetes control plane is running` |
| Helm installed | `helm version` | `version.BuildInfo{Version:"v3.x.x"}` |
| Images built | `docker images \| Select-String epipredict` | 3 images listed |

### Installing Prerequisites

```powershell
# 1. Docker Desktop — download from https://docker.com/products/docker-desktop
#    Enable Kubernetes in: Settings → Kubernetes → Enable Kubernetes

# 2. Helm — install via Chocolatey
choco install kubernetes-helm

# 3. Verify everything
docker version
kubectl cluster-info
helm version
```

> [!IMPORTANT]
> Docker Desktop's Kubernetes must be **enabled and running** (green icon in system tray). If the Kubernetes indicator is orange or red, right-click Docker Desktop → Restart Kubernetes.

## 🚀 Step-by-Step First Deployment

### Step 1: Build Docker Images

```powershell
# Navigate to the project root
cd c:\Users\USER\OneDrive\Documents\GitHub\epi-predict-kenya-ai

# Build all 3 custom images (database uses the official postgres image)
docker build -t epipredict-frontend:latest ./frontend
docker build -t epipredict-backend:latest ./backend
docker build -t epipredict-ml-service:latest ./ml-service

# Verify images exist
docker images | Select-String epipredict
```

Expected output:
```
epipredict-frontend    latest    abc123def456    2 minutes ago    45MB
epipredict-backend     latest    789ghi012jkl    2 minutes ago    180MB
epipredict-ml-service  latest    345mno678pqr    1 minute ago     650MB
```

> [!NOTE]
> The ML service image is significantly larger (~650MB) because it includes scikit-learn, pandas, and other ML libraries. This is normal.

### Step 2: Apply Kubernetes Manifests

```powershell
# Apply all manifests in order
# 1. Database first (other services depend on it)
kubectl apply -f k8s/database.yaml

# 2. Wait for database to be ready
kubectl wait --for=condition=ready pod -l app=database-service --timeout=120s

# 3. ML Service (backend depends on it)
kubectl apply -f k8s/ml-service.yaml

# 4. Backend (depends on database + ML service)
kubectl apply -f k8s/backend.yaml

# 5. Frontend (depends on backend)
kubectl apply -f k8s/frontend.yaml
```

### Step 3: Verify Deployment

```powershell
# Check all pods are running
kubectl get pods

# Expected output:
# NAME                                    READY   STATUS    RESTARTS   AGE
# database-deployment-xxx                 1/1     Running   0          2m
# ml-service-deployment-xxx               1/1     Running   0          1m
# backend-deployment-xxx                  1/1     Running   0          45s
# frontend-deployment-xxx                 1/1     Running   0          30s
```

### Step 4: Access the Application

```powershell
# Frontend is on NodePort 30080
Start-Process "http://localhost:30080"

# Or check the backend health endpoint
Invoke-RestMethod http://localhost:30080/api/health
```

## 🛠️ Automation Script: k8s-agent.ps1

Below is a production-ready automation script for managing EpiPredict on Kubernetes:

```powershell
# k8s-agent.ps1 — EpiPredict Kubernetes Automation Agent
# Usage: .\k8s-agent.ps1

param(
    [switch]$NonInteractive,
    [string]$Action
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$K8sDir = Join-Path $ProjectRoot "k8s"

function Write-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║   🏥 EpiPredict Kenya AI — K8s Agent v1.0      ║" -ForegroundColor Cyan
    Write-Host "  ║   AI-Powered Disease Outbreak Prediction        ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    Write-Host "  Choose an action:" -ForegroundColor Yellow
    Write-Host "  [1] 🏗️  Build all Docker images"
    Write-Host "  [2] 🚀 Deploy all services to Kubernetes"
    Write-Host "  [3] 📊 Show cluster status"
    Write-Host "  [4] 📋 Show pod logs"
    Write-Host "  [5] 🔄 Restart a service"
    Write-Host "  [6] 🗑️  Tear down everything"
    Write-Host "  [7] 🔍 Health check all services"
    Write-Host "  [Q] 👋 Quit"
    Write-Host ""
}

function Build-Images {
    Write-Host "`n🏗️  Building Docker images..." -ForegroundColor Green

    $services = @(
        @{ Name = "frontend";   Path = "./frontend" },
        @{ Name = "backend";    Path = "./backend" },
        @{ Name = "ml-service"; Path = "./ml-service" }
    )

    foreach ($svc in $services) {
        Write-Host "  Building epipredict-$($svc.Name)..." -ForegroundColor Cyan
        docker build -t "epipredict-$($svc.Name):latest" $svc.Path
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ❌ Failed to build $($svc.Name)" -ForegroundColor Red
            return
        }
        Write-Host "  ✅ epipredict-$($svc.Name):latest built" -ForegroundColor Green
    }
    Write-Host "`n✅ All images built successfully!" -ForegroundColor Green
}

function Deploy-All {
    Write-Host "`n🚀 Deploying to Kubernetes..." -ForegroundColor Green

    $manifests = @("database.yaml", "ml-service.yaml", "backend.yaml", "frontend.yaml")

    foreach ($m in $manifests) {
        $path = Join-Path $K8sDir $m
        Write-Host "  Applying $m..." -ForegroundColor Cyan
        kubectl apply -f $path
    }

    Write-Host "`n⏳ Waiting for pods to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=ready pod --all --timeout=180s 2>$null

    Write-Host "`n✅ All services deployed!" -ForegroundColor Green
    Write-Host "  🌐 Frontend: http://localhost:30080" -ForegroundColor Cyan
}

function Show-Status {
    Write-Host "`n📊 Cluster Status:" -ForegroundColor Green
    Write-Host "`n--- Pods ---" -ForegroundColor Yellow
    kubectl get pods -o wide
    Write-Host "`n--- Services ---" -ForegroundColor Yellow
    kubectl get services
    Write-Host "`n--- Deployments ---" -ForegroundColor Yellow
    kubectl get deployments
    Write-Host "`n--- PVCs ---" -ForegroundColor Yellow
    kubectl get pvc
}

function Show-Logs {
    Write-Host "`nAvailable pods:" -ForegroundColor Yellow
    kubectl get pods --no-headers | ForEach-Object { Write-Host "  $_" }
    $pod = Read-Host "`nEnter pod name (or partial name)"
    $fullPod = kubectl get pods --no-headers | Where-Object { $_ -match $pod } |
               ForEach-Object { ($_ -split '\s+')[0] } | Select-Object -First 1

    if ($fullPod) {
        Write-Host "`n📋 Logs for $fullPod (last 50 lines):" -ForegroundColor Green
        kubectl logs $fullPod --tail=50
    } else {
        Write-Host "  ❌ Pod not found" -ForegroundColor Red
    }
}

function Restart-Service {
    Write-Host "`nDeployments:" -ForegroundColor Yellow
    kubectl get deployments --no-headers
    $dep = Read-Host "`nEnter deployment name"
    kubectl rollout restart deployment/$dep
    Write-Host "  ✅ Restarted $dep" -ForegroundColor Green
}

function Remove-All {
    Write-Host "`n🗑️  Tearing down all EpiPredict resources..." -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -eq "yes") {
        kubectl delete -f "$K8sDir/" --ignore-not-found
        Write-Host "  ✅ All resources deleted" -ForegroundColor Green
    } else {
        Write-Host "  Cancelled." -ForegroundColor Yellow
    }
}

function Test-Health {
    Write-Host "`n🔍 Running health checks..." -ForegroundColor Green
    $checks = @(
        @{ Name = "Frontend";   Url = "http://localhost:30080/" },
        @{ Name = "Backend";    Url = "http://localhost:30080/api/health" }
    )

    foreach ($check in $checks) {
        try {
            $response = Invoke-WebRequest -Uri $check.Url -TimeoutSec 5 -UseBasicParsing
            Write-Host "  ✅ $($check.Name): $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ $($check.Name): UNREACHABLE" -ForegroundColor Red
        }
    }
}

# Main loop
Write-Banner
do {
    Show-Menu
    $choice = Read-Host "Enter choice"

    switch ($choice) {
        "1" { Build-Images }
        "2" { Deploy-All }
        "3" { Show-Status }
        "4" { Show-Logs }
        "5" { Restart-Service }
        "6" { Remove-All }
        "7" { Test-Health }
        "Q" { Write-Host "👋 Goodbye!" -ForegroundColor Cyan; break }
        "q" { Write-Host "👋 Goodbye!" -ForegroundColor Cyan; break }
        default { Write-Host "  Invalid choice" -ForegroundColor Red }
    }
} while ($choice -notin @("Q", "q"))
```

> [!TIP]
> Save this script to the project root and run it with `.\k8s-agent.ps1`. The menu-driven interface makes it easy to perform common operations without memorizing kubectl commands.

---

# Chapter 6: Monitoring & Debugging

## 🔍 Essential kubectl Commands

### The "Big Five" — Commands You'll Use Daily

| Command | What It Does | When To Use |
|---------|-------------|-------------|
| `kubectl get pods` | List all pods and their status | First thing to check — are pods running? |
| `kubectl describe pod <name>` | Detailed pod info, events, errors | When a pod won't start or keeps crashing |
| `kubectl logs <pod>` | View container stdout/stderr | When the app is running but behaving incorrectly |
| `kubectl exec -it <pod> -- sh` | Open a shell inside the container | When you need to inspect files or test connectivity |
| `kubectl get events --sort-by=.lastTimestamp` | Cluster-wide event log | When you need the full picture of what happened |

### Viewing Pod Status

```powershell
# Basic status — shows Running, Pending, CrashLoopBackOff, etc.
kubectl get pods

# Wide view — shows which node the pod is on
kubectl get pods -o wide

# Watch mode — updates in real-time
kubectl get pods --watch

# Filter by label
kubectl get pods -l app=backend
```

### Reading Pod Logs

```powershell
# Last 100 lines of a pod's logs
kubectl logs backend-deployment-xxx --tail=100

# Follow logs in real-time (like tail -f)
kubectl logs backend-deployment-xxx -f

# Logs from a previous crashed container
kubectl logs backend-deployment-xxx --previous

# Logs from a specific container in a multi-container pod
kubectl logs backend-deployment-xxx -c backend
```

### Describing Pods (The Detective Tool)

```powershell
# Full details about a pod — MOST useful for debugging
kubectl describe pod backend-deployment-xxx

# Key sections to look at:
# 1. Events (at the bottom) — shows scheduling, pulling, starting
# 2. Conditions — shows if the pod is ready
# 3. Containers → State — shows if it's running, waiting, or terminated
# 4. Containers → Last State — shows WHY it crashed last time
```

### Exec Into Containers

```powershell
# Open a shell inside the backend container
kubectl exec -it backend-deployment-xxx -- /bin/sh

# Test database connectivity from inside the backend pod
kubectl exec -it backend-deployment-xxx -- python -c "
import psycopg2
conn = psycopg2.connect('postgresql://postgres:postgres@database-service:5432/epipredict')
print('Database connection successful!')
conn.close()
"

# Check environment variables (useful for debugging secrets)
kubectl exec -it backend-deployment-xxx -- env | Select-String DATABASE
```

> [!TIP]
> `kubectl exec` is your "hands inside the machine" tool. Use it when logs don't give you enough information. Common uses:
> - Test DNS resolution: `nslookup database-service`
> - Test HTTP connectivity: `wget -qO- http://ml-service:5000/health`
> - Check file permissions: `ls -la /app/models/`

## 🚨 Common Errors and How to Fix Them

### Error 1: ImagePullBackOff

```
NAME                        READY   STATUS             RESTARTS   AGE
backend-deployment-xxx      0/1     ImagePullBackOff   0          2m
```

**What it means**: Kubernetes can't download the Docker image.

**Common causes**:
1. Image doesn't exist locally (Docker Desktop uses local images)
2. Image name is misspelled
3. Image is in a private registry and credentials aren't configured

**Fix**:
```powershell
# Check if the image exists locally
docker images | Select-String epipredict-backend

# If not, build it
docker build -t epipredict-backend:latest ./backend

# Verify the image name matches the YAML
kubectl describe pod backend-deployment-xxx | Select-String "Image:"
```

### Error 2: CrashLoopBackOff

```
NAME                        READY   STATUS             RESTARTS   AGE
backend-deployment-xxx      0/1     CrashLoopBackOff   5          10m
```

**What it means**: The container starts, crashes, restarts, crashes again — in a loop.

**Common causes**:
1. Application error (missing env vars, wrong database URL)
2. Health check failing (app starts too slowly)
3. Missing dependencies (database not ready yet)

**Fix**:
```powershell
# Check the crash logs
kubectl logs backend-deployment-xxx --previous

# Common fix: increase initialDelaySeconds in health probes
# The app might need more time to start up

# Check if the database is actually ready
kubectl get pods -l app=database-service
kubectl logs database-deployment-xxx
```

### Error 3: Pending Pods

```
NAME                        READY   STATUS    RESTARTS   AGE
ml-service-deployment-xxx   0/1     Pending   0          5m
```

**What it means**: Kubernetes can't schedule the pod on any node.

**Common causes**:
1. Not enough CPU/memory resources (Docker Desktop default is 2 CPU, 4GB)
2. PersistentVolumeClaim can't be fulfilled
3. Node selector or affinity rules don't match any node

**Fix**:
```powershell
# Check WHY it's pending
kubectl describe pod ml-service-deployment-xxx

# Look for messages like:
# "Insufficient cpu" → Increase Docker Desktop resources
# "Insufficient memory" → Increase Docker Desktop resources
# "no persistent volumes available" → Check PVC

# Increase Docker Desktop resources:
# Settings → Resources → Advanced → CPU: 4, Memory: 8GB
```

### Error 4: Services Not Reachable

**Symptom**: Pod is running but `http://localhost:30080` doesn't work.

```powershell
# Check the service exists and has endpoints
kubectl get services
kubectl get endpoints frontend

# If endpoints show <none>, the selector doesn't match any pods
# Compare labels:
kubectl get pods --show-labels
kubectl describe service frontend
```

## 🌳 Troubleshooting Decision Tree

```mermaid
flowchart TD
    START["🚨 Something's Wrong!"] --> Q1{"What does<br/>`kubectl get pods`<br/>show?"}

    Q1 -->|"Pending"| PEND["📋 Pod is Pending"]
    Q1 -->|"ImagePullBackOff"| IMG["🖼️ Image Pull Error"]
    Q1 -->|"CrashLoopBackOff"| CRASH["💥 Container Crashing"]
    Q1 -->|"Running but not working"| RUN["🏃 Running But Broken"]
    Q1 -->|"No pods at all"| NOPOD["👻 No Pods Found"]

    PEND --> PEND1["Run: kubectl describe pod NAME"]
    PEND1 --> PEND2{"Insufficient<br/>resources?"}
    PEND2 -->|"Yes"| PEND3["Increase Docker Desktop<br/>CPU/Memory in Settings"]
    PEND2 -->|"No"| PEND4["Check PVC status:<br/>kubectl get pvc"]

    IMG --> IMG1["Check image exists:<br/>docker images"]
    IMG1 --> IMG2{"Image<br/>found?"}
    IMG2 -->|"No"| IMG3["Build it:<br/>docker build -t NAME ."]
    IMG2 -->|"Yes"| IMG4["Check image name<br/>matches YAML exactly"]

    CRASH --> CRASH1["Run: kubectl logs NAME --previous"]
    CRASH1 --> CRASH2{"App error in<br/>logs?"}
    CRASH2 -->|"Yes"| CRASH3["Fix the application<br/>code/config, rebuild image"]
    CRASH2 -->|"No"| CRASH4["Increase health probe<br/>initialDelaySeconds"]

    RUN --> RUN1["Run: kubectl logs NAME"]
    RUN1 --> RUN2{"Errors in<br/>logs?"}
    RUN2 -->|"Yes"| RUN3["Fix app error<br/>or environment config"]
    RUN2 -->|"No"| RUN4["Check service endpoints:<br/>kubectl get endpoints"]
    RUN4 --> RUN5{"Endpoints<br/>empty?"}
    RUN5 -->|"Yes"| RUN6["Fix label selectors<br/>in Service YAML"]
    RUN5 -->|"No"| RUN7["Check port mapping<br/>in Service YAML"]

    NOPOD --> NOPOD1["Check deployment exists:<br/>kubectl get deployments"]
    NOPOD1 --> NOPOD2{"Deployment<br/>found?"}
    NOPOD2 -->|"No"| NOPOD3["Apply manifests:<br/>kubectl apply -f k8s/"]
    NOPOD2 -->|"Yes"| NOPOD4["Check replicas:<br/>kubectl describe deployment NAME"]

    style START fill:#ffcdd2,stroke:#c62828,color:#000
    style PEND3 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style IMG3 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style IMG4 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style CRASH3 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style CRASH4 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style RUN3 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style RUN6 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style RUN7 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style NOPOD3 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style NOPOD4 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style PEND4 fill:#fff3e0,stroke:#ef6c00,color:#000
```

## 📊 Monitoring Pod Resource Usage

```powershell
# CPU and memory usage per pod (requires metrics-server)
kubectl top pods

# Example output:
# NAME                                    CPU(cores)   MEMORY(bytes)
# backend-deployment-xxx                  15m          128Mi
# database-deployment-xxx                 5m           64Mi
# frontend-deployment-xxx                 2m           32Mi
# ml-service-deployment-xxx               45m          512Mi

# CPU and memory usage per node
kubectl top nodes
```

> [!NOTE]
> If `kubectl top pods` says "Metrics API not available", install metrics-server first (see [Chapter 3](#-prerequisites-install-metrics-server)).

---

# Chapter 7: Production Readiness Checklist

## 🏁 Is EpiPredict Ready for Production?

Before deploying EpiPredict to a real production environment (whether on-premise at a county health department or in the cloud), run through this checklist. Each item has a **WHY** — understanding the reason helps you prioritize.

### The Analogy

> Think of this as the **pre-flight checklist** a Kenya Airways pilot goes through before takeoff. It may seem tedious, but missing one item could be catastrophic. Nobody wants the engine to fail over Lake Victoria because you forgot to check the fuel levels.

## ✅ Production Readiness Checklist

| # | Category | Item | Status | Why It Matters |
|---|----------|------|--------|----------------|
| 1 | **Resources** | CPU/Memory requests set for all containers | ⬜ | Without requests, Kubernetes can't schedule pods properly, leading to resource contention |
| 2 | **Resources** | CPU/Memory limits set for all containers | ⬜ | Without limits, one runaway pod can consume ALL node resources and crash everything |
| 3 | **Health** | Liveness probes configured | ✅ | Already done! K8s restarts containers that fail liveness checks |
| 4 | **Health** | Readiness probes configured | ✅ | Already done! K8s only sends traffic to ready containers |
| 5 | **Health** | Startup probes for slow-starting containers | ⬜ | ML service loads models at startup; a startup probe prevents premature kills |
| 6 | **Security** | Secrets used (not plain-text env vars) | ⬜ | Passwords in YAML = passwords in Git = passwords in hackers' hands |
| 7 | **Security** | RBAC configured | ⬜ | Limits which service accounts can access which resources |
| 8 | **Security** | Network policies defined | ⬜ | Prevents frontend from directly accessing the database |
| 9 | **Scaling** | HPA configured for stateless services | ⬜ | Handles traffic spikes during disease outbreaks automatically |
| 10 | **Scaling** | Pod Disruption Budgets set | ⬜ | Ensures minimum pods during node maintenance |
| 11 | **Storage** | PVCs with appropriate storage classes | ✅ | Already done! Database and ML models use persistent storage |
| 12 | **Storage** | Database backup strategy defined | ⬜ | If PostgreSQL PVC is lost, ALL disease prediction data is gone |
| 13 | **Networking** | Ingress configured with TLS | ⬜ | Users should access the dashboard over HTTPS |
| 14 | **Networking** | DNS configured for the domain | ⬜ | Real users need a proper domain (e.g., epipredict.health.go.ke) |
| 15 | **Monitoring** | Prometheus + Grafana deployed | ⬜ | You can't fix what you can't see — metrics reveal problems early |
| 16 | **Monitoring** | Alerting rules configured | ⬜ | Get notified when pods crash, CPU spikes, or disk fills up |
| 17 | **Logging** | Centralized logging (ELK/Loki) | ⬜ | Searching logs across 4 services manually is unsustainable |
| 18 | **CI/CD** | Automated build + deploy pipeline | ⬜ | Manual deployments are error-prone and slow |

## 🔮 What To Do Next

### 1. Prometheus + Grafana (Monitoring Stack)

```mermaid
flowchart LR
    subgraph "EpiPredict Cluster"
        BE["Backend Pod"]
        ML["ML Service Pod"]
        DB["Database Pod"]
        FE["Frontend Pod"]
    end

    P["📊 Prometheus<br/>(collects metrics)"] -->|"scrapes /metrics"| BE
    P -->|"scrapes /metrics"| ML
    P -->|"scrapes /metrics"| DB
    G["📈 Grafana<br/>(visualizes dashboards)"] -->|"queries"| P
    A["🚨 AlertManager<br/>(sends alerts)"] -->|"triggers on rules"| P

    style P fill:#e8f5e9,stroke:#2e7d32,color:#000
    style G fill:#e3f2fd,stroke:#1565c0,color:#000
    style A fill:#ffebee,stroke:#c62828,color:#000
```

```powershell
# Install Prometheus + Grafana using Helm
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack `
  --namespace monitoring --create-namespace

# Access Grafana dashboard
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring
# Open http://localhost:3000 (default: admin/prom-operator)
```

> [!TIP]
> The `kube-prometheus-stack` Helm chart installs **everything** you need: Prometheus, Grafana, AlertManager, node-exporter, and pre-built dashboards. It's the fastest way to get full observability.

### 2. CI/CD Pipeline with GitHub Actions + Helm

```mermaid
flowchart LR
    DEV["👨‍💻 Developer<br/>pushes code"] --> GH["🐙 GitHub<br/>Actions triggered"]
    GH --> TEST["🧪 Run Tests"]
    TEST --> BUILD["🏗️ Build Docker<br/>Images"]
    BUILD --> PUSH["📤 Push to<br/>Container Registry"]
    PUSH --> HELM["⎈ Helm Upgrade<br/>(auto-deploy)"]
    HELM --> K8S["☸️ Kubernetes<br/>Cluster Updated"]

    style DEV fill:#e3f2fd,stroke:#1565c0,color:#000
    style GH fill:#f3e5f5,stroke:#6a1b9a,color:#000
    style K8S fill:#e8f5e9,stroke:#2e7d32,color:#000
```

### 3. Cloud Deployment Options

| Provider | Kubernetes Service | Why Choose It |
|----------|-------------------|---------------|
| **AWS** | EKS (Elastic Kubernetes Service) | Most mature, largest ecosystem |
| **Google Cloud** | GKE (Google Kubernetes Engine) | Best k8s experience (Google created k8s!) |
| **Azure** | AKS (Azure Kubernetes Service) | Good if already using Microsoft stack |
| **DigitalOcean** | DOKS | Simplest + cheapest for small teams |

> [!NOTE]
> For a Kenya-based health project, consider data sovereignty requirements. Kenya's Data Protection Act (2019) may require health data to be stored within Kenya or with specific safeguards. Check with your compliance team before choosing a cloud region.

---

## 📚 Quick Reference Card

### Most Used Commands

```powershell
# ─── STATUS ───────────────────────────────────────
kubectl get pods                          # Pod status
kubectl get svc                           # Services & ports
kubectl get deployments                   # Deployment status
kubectl get hpa                           # Auto-scaler status
kubectl get events --sort-by=.lastTimestamp  # Recent events

# ─── DEBUGGING ────────────────────────────────────
kubectl describe pod <name>               # Detailed pod info
kubectl logs <pod> --tail=100             # Recent logs
kubectl logs <pod> --previous             # Crashed container logs
kubectl exec -it <pod> -- /bin/sh         # Shell into container

# ─── MANAGEMENT ───────────────────────────────────
kubectl apply -f k8s/                     # Apply all manifests
kubectl delete -f k8s/                    # Delete all resources
kubectl rollout restart deploy/<name>     # Restart a deployment
kubectl scale deploy/<name> --replicas=3  # Manual scaling

# ─── HELM ─────────────────────────────────────────
helm install epipredict ./helm/epipredict # First install
helm upgrade epipredict ./helm/epipredict # Update
helm rollback epipredict 1               # Rollback
helm template epipredict ./helm/epipredict # Dry run
helm list                                 # List releases
```

---

## 🗺️ Architecture Overview

```mermaid
flowchart TB
    USER["🧑 Health Worker<br/>Browser"] --> ING["🚪 Ingress Controller<br/>epipredict.local"]

    ING -->|"/"| FE["⚛️ Frontend<br/>React + Nginx<br/>Port 80"]
    ING -->|"/api/*"| BE["⚡ Backend<br/>FastAPI Gateway<br/>Port 8000"]
    ING -->|"/ml/*"| ML["🧠 ML Service<br/>FastAPI + scikit-learn<br/>Port 5000"]

    BE --> DB["🐘 PostgreSQL<br/>Port 5432"]
    BE --> ML
    ML --> MV["💾 ML Models PVC<br/>500Mi"]
    DB --> DV["💾 Database PVC<br/>1Gi"]

    subgraph "Horizontal Pod Autoscaler"
        HPA1["⚖️ Backend HPA<br/>1-5 pods, 60% CPU"]
        HPA2["⚖️ ML Service HPA<br/>1-4 pods, 50% CPU"]
        HPA3["⚖️ Frontend HPA<br/>1-3 pods, 70% CPU"]
    end

    HPA1 -.->|"monitors"| BE
    HPA2 -.->|"monitors"| ML
    HPA3 -.->|"monitors"| FE

    style USER fill:#e3f2fd,stroke:#1565c0,color:#000
    style ING fill:#fff3e0,stroke:#ef6c00,color:#000
    style FE fill:#e8f5e9,stroke:#2e7d32,color:#000
    style BE fill:#e8f5e9,stroke:#2e7d32,color:#000
    style ML fill:#e8f5e9,stroke:#2e7d32,color:#000
    style DB fill:#fce4ec,stroke:#c62828,color:#000
    style MV fill:#f3e5f5,stroke:#6a1b9a,color:#000
    style DV fill:#f3e5f5,stroke:#6a1b9a,color:#000
```

---

> **Congratulations!** 🎉 You've completed the EpiPredict Kubernetes Production Guide. You now understand:
> - **Helm** — templated, reusable deployments
> - **Ingress** — single entry point with smart routing
> - **HPA** — automatic scaling based on load
> - **Secrets** — secure credential management
> - **Monitoring** — how to observe and debug your cluster
> - **Production readiness** — what to check before going live
>
> Remember: DevOps is a journey, not a destination. Each concept builds on the last, like floors of a building. You've laid a strong foundation — now keep building! 🏗️

---

*Built with ❤️ for Kenya's public health infrastructure*
