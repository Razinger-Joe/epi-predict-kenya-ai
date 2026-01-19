# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Dockerfile for FastAPI Backend
# ═══════════════════════════════════════════════════════════════════════════════
# A Dockerfile defines how to build a container image for your application.
# This is the MOST RELIABLE way to deploy because it's fully reproducible.

# Use official Python 3.11 slim image (smaller than full image)
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Don't write .pyc files (smaller image)
# PYTHONUNBUFFERED: Don't buffer stdout/stderr (see logs immediately)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for Docker layer caching)
# If requirements.txt hasn't changed, Docker reuses the cached layer
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY backend/app ./app

# Expose port (documentation, Railway uses $PORT)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run the application
# Railway sets PORT environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
