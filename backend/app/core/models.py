"""
app/core/models.py - Common Request/Response Models

Provides base models and validators used across the API.
Follows DRY principle by centralizing common patterns.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from enum import Enum
from datetime import datetime


class PaginationParams(BaseModel):
    """
    Common pagination parameters for list endpoints.
    
    Usage:
        @router.get("/items")
        async def list_items(params: PaginationParams = Depends()):
            ...
    """
    skip: int = Field(
        default=0,
        ge=0,
        description="Number of items to skip"
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Maximum number of items to return"
    )
    
    @field_validator('limit')
    @classmethod
    def validate_limit(cls, v):
        """Ensure limit doesn't exceed maximum"""
        if v > 100:
            raise ValueError("Limit cannot exceed 100")
        return v


class SortDirection(str, Enum):
    """Sort direction enum"""
    ASC = "asc"
    DESC = "desc"


class SortParam(BaseModel):
    """
    Sort parameter for list endpoints.
    
    Example: sort=name:asc,created_at:desc
    """
    field: str = Field(..., description="Field to sort by")
    direction: SortDirection = Field(
        default=SortDirection.ASC,
        description="Sort direction (asc or desc)"
    )


class FilterParams(BaseModel):
    """
    Base class for filter parameters.
    Inherit from this and add domain-specific filters.
    """
    search: Optional[str] = Field(
        None,
        description="Search term (searches across multiple fields)"
    )
    
    @field_validator('search')
    @classmethod
    def validate_search(cls, v):
        """Sanitize search input"""
        if v and len(v) > 255:
            raise ValueError("Search term too long (max 255 characters)")
        return v


class TimeRangeFilter(BaseModel):
    """
    Common time range filter.
    
    Usage:
        start_date: Optional[datetime]
        end_date: Optional[datetime]
    """
    start_date: Optional[datetime] = Field(
        None,
        description="Start date (inclusive)"
    )
    end_date: Optional[datetime] = Field(
        None,
        description="End date (inclusive)"
    )
    
    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v, info):
        """Ensure end_date is after start_date"""
        if v and info.data.get('start_date') and v < info.data['start_date']:
            raise ValueError("End date must be after start date")
        return v


class BaseResponse(BaseModel):
    """Base response model with common fields"""
    id: str = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        from_attributes = True


class BaseCreateRequest(BaseModel):
    """Base create request model"""
    
    class Config:
        json_schema_extra = {
            "example": "Implement in subclass with example data"
        }


class BaseUpdateRequest(BaseModel):
    """
    Base update request model.
    All fields are optional for PATCH operations.
    """
    
    class Config:
        # Exclude None values when serializing
        exclude_none = True


# ═══════════════════════════════════════════════════════════════════════════════
# Validation Helpers
# ═══════════════════════════════════════════════════════════════════════════════

def validate_email(email: str) -> str:
    """Validate email format"""
    if "@" not in email or "." not in email.split("@")[1]:
        raise ValueError("Invalid email format")
    return email.lower()


def validate_phone(phone: str) -> str:
    """Validate phone number (Kenya-focused)"""
    # Remove spaces and dashes
    cleaned = phone.replace(" ", "").replace("-", "")
    
    # Check if it's a valid Kenyan number
    if not cleaned.isdigit() or len(cleaned) < 10:
        raise ValueError("Invalid phone number")
    
    return cleaned


def validate_name(name: str) -> str:
    """Validate person/place names"""
    if len(name.strip()) < 2:
        raise ValueError("Name must be at least 2 characters")
    if len(name) > 100:
        raise ValueError("Name cannot exceed 100 characters")
    return name.strip()


def validate_percentage(value: float) -> float:
    """Validate percentage value (0-100)"""
    if not (0 <= value <= 100):
        raise ValueError("Percentage must be between 0 and 100")
    return value


def validate_positive_int(value: int) -> int:
    """Validate positive integer"""
    if value < 0:
        raise ValueError("Value must be positive")
    return value


# ═══════════════════════════════════════════════════════════════════════════════
# Custom Field Types
# ═══════════════════════════════════════════════════════════════════════════════

class PositiveInt(int):
    """Custom type for positive integers"""
    pass


class Percentage(float):
    """Custom type for percentage values (0-100)"""
    pass


class CountryCode(str):
    """Custom type for ISO 3166-1 alpha-2 country codes"""
    
    @classmethod
    def validate(cls, v: str) -> str:
        if not isinstance(v, str) or len(v) != 2 or not v.isalpha():
            raise ValueError("Invalid country code (must be 2 letter ISO 3166-1)")
        return v.upper()
