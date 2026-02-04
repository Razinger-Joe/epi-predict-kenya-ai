"""
🎓 LEARNING: main.py - The Entry Point

This is where your FastAPI application starts. Think of it as the "index.js" 
of your backend. It:
1. Creates the FastAPI app instance
2. Configures middleware (like CORS, logging, error handling)
3. Includes all your API routes
4. Sets up exception handlers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

# Import our configuration
from app.config import settings

# Import routers (we'll create these next)
from app.routers import health, diseases, counties, predictions, ml, chat

# Import core modules for SDLC improvements
from app.core.middleware import (
    RequestIDMiddleware,
    LoggingMiddleware,
    PerformanceMonitoringMiddleware,
    SecurityHeadersMiddleware,
    configure_logging
)
from app.core.exceptions import (
    APIException,
    api_exception_handler,
    general_exception_handler,
    validation_exception_handler
)

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Logging Configuration
# ═══════════════════════════════════════════════════════════════════════════════
# Configure structured JSON logging for all modules
configure_logging()

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Creating the FastAPI Application
# ═══════════════════════════════════════════════════════════════════════════════
# FastAPI() creates your application. The parameters add metadata that appears
# in the auto-generated documentation at /docs

app = FastAPI(
    title="EpiPredict Kenya AI",
    description="AI-powered disease outbreak prediction API for Kenya",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI location
    redoc_url="/redoc",    # ReDoc location
)

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Middleware Stack (Order Matters!)
# ═══════════════════════════════════════════════════════════════════════════════
# Middleware is processed in REVERSE order (last added = first executed)
# Security headers should be applied first (before CORS)
# Then request tracking, then logging

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(PerformanceMonitoringMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RequestIDMiddleware)

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: CORS (Cross-Origin Resource Sharing)
# ═══════════════════════════════════════════════════════════════════════════════
# By default, browsers block requests from one domain to another (security).
# Your React frontend (localhost:5173) needs to call this API (localhost:8000).
# CORS middleware tells the browser: "It's OK, allow requests from these origins."

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,       # Your React app URL
        "http://localhost:5173",     # Vite dev server
        "http://localhost:3000",     # Alternative port
    ],
    allow_credentials=True,          # Allow cookies/auth headers
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allow all headers
)

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Exception Handlers
# ═══════════════════════════════════════════════════════════════════════════════
# These handlers catch exceptions and convert them to proper responses

app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Including Routers
# ═══════════════════════════════════════════════════════════════════════════════
# Instead of putting ALL endpoints in main.py, we organize them into "routers".
# Each router handles a specific domain (diseases, counties, etc.).
# The prefix adds a path prefix to all endpoints in that router.

app.include_router(health.router, tags=["Health"])
app.include_router(diseases.router, prefix="/api/v1/diseases", tags=["Diseases"])
app.include_router(counties.router, prefix="/api/v1/counties", tags=["Counties"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(ml.router, prefix="/api/v1/ml", tags=["Machine Learning"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["AI Chat"])

# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Root Endpoint
# ═══════════════════════════════════════════════════════════════════════════════
# This is a simple endpoint to verify the API is running.
# @app.get("/") is a "decorator" - it tells FastAPI this function handles GET /

@app.get("/")
async def root():
    """
    Root endpoint - returns API information.
    
    🎓 LEARNING: 
    - 'async def' makes this an asynchronous function (can handle many requests)
    - The return dict is automatically converted to JSON
    """
    return {
        "name": "EpiPredict Kenya AI API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Running the Server
# ═══════════════════════════════════════════════════════════════════════════════
# This block only runs if you execute this file directly (python main.py)
# In production, you'd use: uvicorn app.main:app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",  # Path to app (module:variable)
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,       # Port number
        reload=True      # Auto-reload on code changes (dev only!)
    )
