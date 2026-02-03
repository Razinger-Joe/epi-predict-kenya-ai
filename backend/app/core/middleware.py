"""
app/core/middleware.py - Request/Response Logging & Tracking

Provides middleware for:
- Request ID generation and tracking
- Request/response logging
- Performance metrics
- CORS handling enhancement

HCI PRINCIPLE: Good logging helps developers debug issues quickly,
improving the developer experience.
"""

import logging
import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.datastructures import MutableHeaders
import json

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Generates and attaches a unique request ID to each request.
    Useful for debugging and tracing requests through logs.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate or get request ID
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        
        # Attach to request state
        request.state.request_id = request_id
        
        # Add to response headers
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs incoming requests and outgoing responses.
    Provides structured logging for easy searching and analysis.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = getattr(request.state, "request_id", "unknown")
        
        # Record start time for performance tracking
        start_time = time.time()
        
        # Log incoming request
        logger.info(
            f"Incoming request: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "client_host": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", "unknown"),
                "timestamp": time.time()
            }
        )
        
        # Process request and get response
        response = await call_next(request)
        
        # Calculate response time
        process_time = time.time() - start_time
        
        # Log outgoing response
        logger.info(
            f"Response: {request.method} {request.url.path} - {response.status_code}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": f"{process_time:.3f}s",
                "response_time_ms": int(process_time * 1000),
                "timestamp": time.time()
            }
        )
        
        return response


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """
    Catches unhandled exceptions and converts to proper responses.
    Ensures all responses follow the standard format.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = getattr(request.state, "request_id", "unknown")
        
        try:
            response = await call_next(request)
            return response
            
        except Exception as exc:
            logger.error(
                f"Unhandled exception: {type(exc).__name__}",
                extra={
                    "request_id": request_id,
                    "path": request.url.path,
                    "method": request.method,
                    "error_message": str(exc),
                    "timestamp": time.time()
                },
                exc_info=True
            )
            
            # Return standard error response
            from app.core.responses import APIResponse, ErrorCode, ErrorResponse
            
            response_data = APIResponse(
                success=False,
                error=ErrorResponse(
                    code=ErrorCode.INTERNAL_ERROR,
                    message="An unexpected error occurred"
                ),
                path=request.url.path,
                request_id=request_id,
                timestamp=time.time()
            )
            
            return Response(
                content=response_data.model_dump_json(),
                status_code=500,
                media_type="application/json",
                headers={"x-request-id": request_id}
            )


class PerformanceMonitoringMiddleware(BaseHTTPMiddleware):
    """
    Monitors API performance and logs slow requests.
    Helps identify performance bottlenecks.
    """
    
    # Threshold for slow requests (in milliseconds)
    SLOW_REQUEST_THRESHOLD_MS = 500
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = getattr(request.state, "request_id", "unknown")
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time_ms = (time.time() - start_time) * 1000
        
        # Log slow requests
        if process_time_ms > self.SLOW_REQUEST_THRESHOLD_MS:
            logger.warning(
                f"Slow request detected: {request.method} {request.url.path}",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "response_time_ms": int(process_time_ms),
                    "threshold_ms": self.SLOW_REQUEST_THRESHOLD_MS,
                    "status_code": response.status_code
                }
            )
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to all responses.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


# ═══════════════════════════════════════════════════════════════════════════════
# Structured Logging Configuration
# ═══════════════════════════════════════════════════════════════════════════════

def configure_logging():
    """Configure JSON structured logging for all loggers"""
    
    # Create JSON formatter
    formatter = logging.Formatter(
        '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
        datefmt='%Y-%m-%dT%H:%M:%S'
    )
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Add console handler with JSON formatting
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Reduce noise from external libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


# ═══════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════════════════

def get_request_id(request: Request) -> str:
    """Extract request ID from request state"""
    return getattr(request.state, "request_id", "unknown")


def log_api_call(
    request: Request,
    response_status: int,
    response_time_ms: float,
    additional_data: dict = None
):
    """
    Log an API call with all relevant information.
    
    Args:
        request: FastAPI request object
        response_status: HTTP status code
        response_time_ms: Response time in milliseconds
        additional_data: Extra data to log
    """
    request_id = get_request_id(request)
    
    log_data = {
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response_status,
        "response_time_ms": int(response_time_ms),
        **(additional_data or {})
    }
    
    logger.info(f"API call completed", extra=log_data)
