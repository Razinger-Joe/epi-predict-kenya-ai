# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Dockerfile for FastAPI Backend
# ═══════════════════════════════════════════════════════════════════════════════

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to backend
WORKDIR /app/backend

# Copy requirements first (for Docker layer caching)
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY backend/app ./app

# Expose port
EXPOSE 8000

# Run the application - NO CD NEEDED because WORKDIR is set
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
