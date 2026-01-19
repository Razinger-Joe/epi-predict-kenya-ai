"""
🎓 LEARNING: health.py - Health Check Router

Every production API should have a health check endpoint.
This allows:
1. Load balancers to check if the service is alive
2. Monitoring systems to track uptime
3. Quick verification after deployments
"""

from fastapi import APIRouter
from datetime import datetime

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: APIRouter
# ═══════════════════════════════════════════════════════════════════════════════
# APIRouter is like a "mini FastAPI app" for organizing routes.
# You define routes here, then include the router in main.py

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Status information
    
    🎓 LEARNING: This endpoint should:
    - Be fast (no database calls if possible)
    - Return 200 if healthy
    - Return 503 if unhealthy
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "EpiPredict Kenya AI API",
        "version": "1.0.0"
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check - verifies dependencies are ready.
    
    🎓 LEARNING: Difference between health and readiness:
    - /health: "Is the service running?"
    - /ready: "Is the service ready to handle requests?"
    
    Kubernetes uses these for container management.
    """
    # In a real app, you might check:
    # - Database connection
    # - Cache connection
    # - External service availability
    
    return {
        "status": "ready",
        "checks": {
            "api": True,
            "database": True  # TODO: Actually check Supabase
        }
    }
