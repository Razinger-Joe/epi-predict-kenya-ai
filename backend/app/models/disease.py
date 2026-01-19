"""
🎓 LEARNING: Pydantic Models - Data Validation

Pydantic models define the SHAPE of your data. They:
1. Validate incoming data (API requests)
2. Document what data looks like (for API docs)
3. Provide type hints (IDE autocomplete)
4. Serialize data to JSON (API responses)

Think of them as "contracts" for your data.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Enums for Fixed Values
# ═══════════════════════════════════════════════════════════════════════════════
# When a field can only be one of a few values, use an Enum.
# This prevents typos and gives autocomplete in your IDE.

class SeverityLevel(str, Enum):
    """Disease severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DiseaseCategory(str, Enum):
    """Categories of diseases we track"""
    RESPIRATORY = "respiratory"
    WATERBORNE = "waterborne"
    VECTOR_BORNE = "vector_borne"  # Mosquito, tick, etc.
    VIRAL = "viral"
    BACTERIAL = "bacterial"
    OTHER = "other"


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Base Model (Shared Fields)
# ═══════════════════════════════════════════════════════════════════════════════
# When multiple models share fields, create a base class.
# This follows the DRY principle (Don't Repeat Yourself).

class DiseaseBase(BaseModel):
    """
    Base disease model with shared fields.
    
    🎓 LEARNING: Field() adds extra validation and metadata
    - description: Shows in API docs
    - example: Shows example value in docs
    - min_length/max_length: String length validation
    """
    name: str = Field(
        ...,  # ... means required
        description="Name of the disease",
        example="Malaria",
        min_length=2,
        max_length=100
    )
    category: DiseaseCategory = Field(
        ...,
        description="Disease category",
        example=DiseaseCategory.VECTOR_BORNE
    )
    description: Optional[str] = Field(
        None,  # None means optional with default None
        description="Detailed description of the disease",
        max_length=1000
    )
    symptoms: List[str] = Field(
        default_factory=list,
        description="List of common symptoms",
        example=["fever", "chills", "headache"]
    )


class DiseaseCreate(DiseaseBase):
    """
    Model for creating a new disease (POST request body).
    
    🎓 LEARNING: Separate Create/Read/Update models
    - Create: What client sends when creating
    - Read: What API returns (includes id, timestamps)
    - Update: What client sends when updating (all optional)
    """
    pass  # Same as base for now


class Disease(DiseaseBase):
    """
    Full disease model returned from API (includes database fields).
    """
    id: str = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="When the record was created")
    updated_at: Optional[datetime] = Field(None, description="Last update time")
    
    # 🎓 LEARNING: model_config allows ORM mode
    # This lets Pydantic work with database objects, not just dicts
    model_config = {
        "from_attributes": True  # Previously called "orm_mode"
    }


class DiseaseUpdate(BaseModel):
    """
    Model for updating a disease (PATCH request body).
    All fields optional - only update what's provided.
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    category: Optional[DiseaseCategory] = None
    description: Optional[str] = Field(None, max_length=1000)
    symptoms: Optional[List[str]] = None


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Response Models
# ═══════════════════════════════════════════════════════════════════════════════
# Define what your API responses look like for consistency.

class DiseaseListResponse(BaseModel):
    """Response model for listing diseases"""
    data: List[Disease]
    count: int = Field(..., description="Total number of diseases")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "data": [
                    {
                        "id": "abc123",
                        "name": "Malaria",
                        "category": "vector_borne",
                        "description": "Mosquito-borne disease",
                        "symptoms": ["fever", "chills"],
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": None
                    }
                ],
                "count": 1
            }
        }
    }
