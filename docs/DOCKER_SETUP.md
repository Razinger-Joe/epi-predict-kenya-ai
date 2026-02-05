# Docker Installation Guide for Windows

## Quick Install (Recommended)

### Option 1: Docker Desktop (Easiest)

1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download for Windows
   - Requires Windows 10/11 Pro, Enterprise, or Education (64-bit)
   - OR Windows 10/11 Home with WSL 2

2. **Install**
   - Run the installer
   - Follow the installation wizard
   - Restart your computer when prompted

3. **Verify Installation**
   ```powershell
   docker --version
   docker compose version  # Note: newer Docker uses 'docker compose' not 'docker-compose'
   ```

4. **Start Docker Desktop**
   - Open Docker Desktop from Start menu
   - Wait for the Docker engine to start
   - You'll see a green indicator when ready

### Option 2: WSL 2 + Docker (Lightweight)

If you have WSL 2 installed:

```powershell
# Inside WSL terminal
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Alternative: Use Cloud-Based Builds

If you don't want to install Docker locally, you can use:

### GitHub Actions (Recommended)
- Pushes to `main` branch automatically build Docker images
- No local Docker installation needed
- Configured in `.github/workflows/deploy.yml`

### Railway CLI
```powershell
npm install -g @railway/cli
railway login
railway up
# Railway builds Docker images in the cloud
```

### Render
- Connect your GitHub repo
- Render automatically detects `docker-compose.yml`
- Builds happen on their infrastructure

## Testing Without Docker

You can test the application without Docker:

### Frontend
```powershell
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend
```powershell
cd backend
py -3.11 -m pip install -r requirements.txt
py -3.11 -m uvicorn app.main:app --reload
# Runs on http://localhost:8000
```

## Next Steps

Once Docker is installed:
```powershell
# Navigate to project
cd c:\Users\USER\OneDrive\Documents\GitHub\epi-predict-kenya-ai

# Create environment file
cp .env.production.example .env

# Build and run
docker compose up --build
```

---

**For deployment without Docker**: See DOCKER.md for Railway/Render deployment options.
