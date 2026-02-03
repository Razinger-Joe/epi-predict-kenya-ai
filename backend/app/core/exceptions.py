"""
app/core/exceptions.py - Custom Exception Classes

Defines custom exceptions and global exception handlers.
Converts all exceptions to standardized APIResponse format.

SDLC PRINCIPLE: Centralized exception handling reduces duplication
and ensures consistent error messaging across the API.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Optional, List
import logging
import traceback

from app.core.responses import (
    APIResponse, 
    ErrorCode, 
    ErrorResponse, 
    ErrorDetail,
    error_response,
    validation_error_response
)

logger = logging.getLogger(__name__)


class APIException(Exception):
    """Base API exception - all custom exceptions inherit from this"""
    
    def __init__(
        self,
        message: str,
        code: ErrorCode = ErrorCode.INTERNAL_ERROR,
        status_code: int = 500,
        details: Optional[List[ErrorDetail]] = None
    ):
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or []
        super().__init__(message)


class ValidationException(APIException):
    """Raised when input validation fails"""
    
    def __init__(
        self,
        message: str = "Validation failed",
        details: Optional[List[dict]] = None
    ):
        error_details = []
        if details:
            error_details = [
                ErrorDetail(
                    field=d.get("field", "unknown"),
                    message=d.get("message", "Invalid value"),
                    code=d.get("code")
                )
                for d in details
            ]
        
        super().__init__(
            message=message,
            code=ErrorCode.VALIDATION_ERROR,
            status_code=422,
            details=error_details
        )


class NotFoundException(APIException):
    """Raised when requested resource is not found"""
    
    def __init__(self, resource: str, identifier: str):
        message = f"{resource} with id '{identifier}' not found"
        super().__init__(
            message=message,
            code=ErrorCode.NOT_FOUND,
            status_code=404
        )


class ConflictException(APIException):
    """Raised when operation conflicts with existing data"""
    
    def __init__(self, message: str):
        super().__init__(
            message=message,
            code=ErrorCode.CONFLICT,
            status_code=409
        )


class UnauthorizedException(APIException):
    """Raised when authentication is required but missing"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            message=message,
            code=ErrorCode.UNAUTHORIZED,
            status_code=401
        )


class ForbiddenException(APIException):
    """Raised when user lacks permission"""
    
    def __init__(self, message: str = "Access denied"):
        super().__init__(
            message=message,
            code=ErrorCode.FORBIDDEN,
            status_code=403
        )


class RateLimitException(APIException):
    """Raised when rate limit is exceeded"""
    
    def __init__(self, message: str = "Too many requests"):
        super().__init__(
            message=message,
            code=ErrorCode.RATE_LIMITED,
            status_code=429
        )


class ServiceUnavailableException(APIException):
    """Raised when dependency service is unavailable"""
    
    def __init__(self, service: str):
        message = f"{service} is temporarily unavailable"
        super().__init__(
            message=message,
            code=ErrorCode.SERVICE_UNAVAILABLE,
            status_code=503
        )


class InvalidParameterException(APIException):
    """Raised when request parameter is invalid"""
    
    def __init__(self, parameter: str, reason: str):
        message = f"Invalid parameter '{parameter}': {reason}"
        super().__init__(
            message=message,
            code=ErrorCode.INVALID_PARAMETER,
            status_code=400
        )


# ═══════════════════════════════════════════════════════════════════════════════
# Exception Handlers (Middleware)
# ═══════════════════════════════════════════════════════════════════════════════

async def api_exception_handler(request: Request, exc: APIException):
    """Handle custom API exceptions"""
    logger.error(
        f"API Exception: {exc.code.value}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "message": exc.message,
            "status_code": exc.status_code,
            "traceback": traceback.format_exc() if exc.status_code >= 500 else None
        }
    )
    
    response = APIResponse(
        success=False,
        error=ErrorResponse(
            code=exc.code,
            message=exc.message,
            details=exc.details
        ),
        path=request.url.path,
        # request_id will be set by middleware
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=response.model_dump(exclude_none=True)
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(
        "Unexpected exception",
        extra={
            "path": request.url.path,
            "method": request.method,
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "traceback": traceback.format_exc()
        },
        exc_info=True
    )
    
    # Don't expose internal details in production
    message = "Internal server error"
    
    response = APIResponse(
        success=False,
        error=ErrorResponse(
            code=ErrorCode.INTERNAL_ERROR,
            message=message
        ),
        path=request.url.path,
    )
    
    return JSONResponse(
        status_code=500,
        content=response.model_dump(exclude_none=True)
    )


async def validation_exception_handler(request: Request, exc: Exception):
    """Handle Pydantic validation errors"""
    logger.warning(
        f"Validation error: {exc}",
        extra={"path": request.url.path}
    )
    
    # Extract error details from Pydantic error
    errors = []
    if hasattr(exc, 'errors'):
        for error in exc.errors():
            errors.append({
                "field": ".".join(str(x) for x in error["loc"][1:]),
                "message": error["msg"],
                "code": error["type"]
            })
    
    response = validation_error_response(
        errors=errors,
        message="Request validation failed"
    )
    
    return JSONResponse(
        status_code=422,
        content=response.model_dump(exclude_none=True)
    )
