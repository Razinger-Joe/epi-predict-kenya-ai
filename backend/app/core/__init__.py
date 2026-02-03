"""
app/core/responses.py - Standardized Response Format

Provides a unified response format for all API endpoints.
This ensures consistency and makes frontend integration easier.

HCI PRINCIPLE: Clear, predictable response structure helps users understand
what data they're getting and whether operations succeeded.
"""

from dataclasses import dataclass, field, asdict
from typing import Generic, TypeVar, Optional, List, Any, Dict
from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field

T = TypeVar('T')


class ErrorCode(str, Enum):
    """Standard error codes for frontend handling"""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
    RATE_LIMITED = "RATE_LIMITED"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    INVALID_PARAMETER = "INVALID_PARAMETER"


class ErrorDetail(BaseModel):
    """Individual error detail for validation errors"""
    field: str = Field(..., description="Field name that failed validation")
    message: str = Field(..., description="Error message")
    code: Optional[str] = Field(None, description="Error code")


class ErrorResponse(BaseModel):
    """Standardized error response format"""
    code: ErrorCode = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="User-friendly error message")
    details: List[ErrorDetail] = Field(
        default_factory=list,
        description="Detailed error information"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="When the error occurred"
    )


class PaginationInfo(BaseModel):
    """Pagination metadata for list responses"""
    skip: int = Field(..., description="Number of items skipped", ge=0)
    limit: int = Field(..., description="Number of items returned", ge=1)
    total: int = Field(..., description="Total number of items available", ge=0)
    pages: int = Field(..., description="Total number of pages", ge=0)
    current_page: int = Field(..., description="Current page number", ge=1)
    has_next: bool = Field(..., description="Whether there are more results")
    has_previous: bool = Field(..., description="Whether there are previous results")


class APIResponse(BaseModel, Generic[T]):
    """
    Standard response wrapper for all API endpoints.
    
    HCI PRINCIPLE: Provides consistent structure that frontend can rely on.
    Always includes timestamp and metadata for debugging.
    """
    success: bool = Field(..., description="Whether the operation succeeded")
    data: Optional[Any] = Field(None, description="Response data")
    error: Optional[ErrorResponse] = Field(None, description="Error details if operation failed")
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Server timestamp"
    )
    path: str = Field("", description="Request path (auto-populated by middleware)")
    request_id: str = Field("", description="Unique request ID for tracking")
    message: Optional[str] = Field(None, description="Additional message")


class ListResponse(BaseModel, Generic[T]):
    """
    Standard response for list endpoints.
    Includes pagination metadata for frontend to handle navigation.
    """
    success: bool = Field(..., description="Whether the operation succeeded")
    data: List[Any] = Field(..., description="List of items")
    pagination: PaginationInfo = Field(..., description="Pagination metadata")
    filters: Dict[str, Any] = Field(
        default_factory=dict,
        description="Filters applied to this request"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="Server timestamp"
    )
    request_id: str = Field("", description="Unique request ID for tracking")


# ═══════════════════════════════════════════════════════════════════════════════
# Response Builder Functions
# ═══════════════════════════════════════════════════════════════════════════════

def success_response(
    data: Any,
    message: Optional[str] = None,
    request_id: str = "",
    path: str = ""
) -> APIResponse:
    """
    Create a successful response.
    
    Args:
        data: The response data
        message: Optional message to include
        request_id: Unique request identifier
        path: Request path
    """
    return APIResponse(
        success=True,
        data=data,
        message=message,
        timestamp=datetime.utcnow().isoformat(),
        request_id=request_id,
        path=path
    )


def error_response(
    code: ErrorCode,
    message: str,
    details: Optional[List[ErrorDetail]] = None,
    request_id: str = "",
    path: str = ""
) -> APIResponse:
    """
    Create an error response.
    
    Args:
        code: Error code (use ErrorCode enum)
        message: User-friendly error message
        details: Detailed error information (for validation errors)
        request_id: Unique request identifier
        path: Request path
    """
    return APIResponse(
        success=False,
        error=ErrorResponse(
            code=code,
            message=message,
            details=details or []
        ),
        timestamp=datetime.utcnow().isoformat(),
        request_id=request_id,
        path=path
    )


def list_response(
    items: List[Any],
    total: int,
    skip: int = 0,
    limit: int = 10,
    filters: Optional[Dict[str, Any]] = None,
    request_id: str = "",
) -> ListResponse:
    """
    Create a list response with pagination metadata.
    
    Args:
        items: List of items to return
        total: Total number of items available
        skip: Number of items skipped
        limit: Number of items returned
        filters: Filters applied to this query
        request_id: Unique request identifier
    """
    pages = (total + limit - 1) // limit if limit > 0 else 0
    current_page = (skip // limit) + 1 if limit > 0 else 1
    
    return ListResponse(
        success=True,
        data=items,
        pagination=PaginationInfo(
            skip=skip,
            limit=limit,
            total=total,
            pages=pages,
            current_page=current_page,
            has_next=(skip + limit) < total,
            has_previous=skip > 0
        ),
        filters=filters or {},
        timestamp=datetime.utcnow().isoformat(),
        request_id=request_id
    )


def validation_error_response(
    errors: List[Dict[str, str]],
    message: str = "Validation failed",
    request_id: str = ""
) -> APIResponse:
    """
    Create a validation error response.
    
    Args:
        errors: List of validation errors with 'field' and 'message'
        message: Error message
        request_id: Unique request identifier
    """
    details = [
        ErrorDetail(
            field=error.get("field", "unknown"),
            message=error.get("message", "Invalid value"),
            code=error.get("code")
        )
        for error in errors
    ]
    
    return APIResponse(
        success=False,
        error=ErrorResponse(
            code=ErrorCode.VALIDATION_ERROR,
            message=message,
            details=details
        ),
        timestamp=datetime.utcnow().isoformat(),
        request_id=request_id
    )
