"""
API Response Models

Standard response formats for all API endpoints.
Includes ErrorCode, ErrorDetail, and helper functions
required by app.core.exceptions.
"""

from typing import Generic, TypeVar, List, Optional, Any, Dict
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


DataT = TypeVar("DataT")


# ── Error Classification ────────────────────────────────────────────────────

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
    """Standardized error response body"""
    code: ErrorCode = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="User-friendly error message")
    details: List[ErrorDetail] = Field(default_factory=list)
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )


# ── Response Wrappers ───────────────────────────────────────────────────────

class APIResponse(BaseModel, Generic[DataT]):
    """Standard API response wrapper"""
    success: bool = True
    message: Optional[str] = "Success"
    data: Optional[Any] = None
    error: Optional[ErrorResponse] = None
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat()
    )
    path: str = ""
    request_id: str = ""

    @classmethod
    def success_response(
        cls,
        data: Optional[Any] = None,
        message: str = "Success"
    ) -> "APIResponse":
        """Create a success response"""
        return cls(success=True, message=message, data=data)

    @classmethod
    def error_response_cls(
        cls,
        message: str,
        data: Optional[Any] = None
    ) -> "APIResponse":
        """Create an error response"""
        return cls(success=False, message=message, data=data)

    @classmethod
    def list_response(
        cls,
        data: List[Any],
        count: int,
        message: str = "Success"
    ) -> "APIResponse":
        """Create a list response"""
        return cls(success=True, message=message, data=data)


class ListResponse(BaseModel, Generic[DataT]):
    """Response for list endpoints with pagination"""
    success: bool = True
    message: str = "Success"
    data: List[Any] = []
    total: int = 0
    page: int = 1
    page_size: int = 50
    has_more: bool = False


# ── Helper Functions (used by exceptions.py) ───────────────────────────────

def error_response(
    code: ErrorCode,
    message: str,
    details: Optional[List[ErrorDetail]] = None,
    request_id: str = "",
    path: str = "",
) -> APIResponse:
    """Create an error APIResponse."""
    return APIResponse(
        success=False,
        error=ErrorResponse(
            code=code,
            message=message,
            details=details or [],
        ),
        timestamp=datetime.utcnow().isoformat(),
        request_id=request_id,
        path=path,
    )


def validation_error_response(
    errors: List[Dict[str, str]],
    message: str = "Validation failed",
    request_id: str = "",
) -> APIResponse:
    """Create a validation error APIResponse."""
    details = [
        ErrorDetail(
            field=e.get("field", "unknown"),
            message=e.get("message", "Invalid value"),
            code=e.get("code"),
        )
        for e in errors
    ]
    return error_response(
        code=ErrorCode.VALIDATION_ERROR,
        message=message,
        details=details,
        request_id=request_id,
    )
