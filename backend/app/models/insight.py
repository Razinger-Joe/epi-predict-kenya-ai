"""
Insight Models
==============
Pydantic models for health insights and operator reports.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class InsightStatus(str, Enum):
    """Status of an insight in the verification pipeline."""
    PENDING = "pending"
    ANALYZING = "analyzing"
    ANALYZED = "analyzed"
    VERIFIED = "verified"
    REJECTED = "rejected"


class OperatorRole(str, Enum):
    """Roles for health operators."""
    DOCTOR = "doctor"
    NURSE = "nurse"
    PHARMACIST = "pharmacist"
    LAB_TECH = "lab_technician"
    HEALTH_OFFICER = "health_officer"
    ADMIN = "admin"


class SourceType(str, Enum):
    """Source types for insights."""
    SOCIAL_MEDIA = "social_media"
    PDF_REPORT = "pdf_report"
    FIELD_OBSERVATION = "field_observation"
    LAB_REPORT = "lab_report"


# ═══════════════════════════════════════════════════════════════════════════════
# Health Operator Models
# ═══════════════════════════════════════════════════════════════════════════════

class HealthOperatorBase(BaseModel):
    """Base model for health operators."""
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    phone: str = Field(..., min_length=10, max_length=15)
    organization: str = Field(..., min_length=2, max_length=200)
    license_number: str = Field(..., min_length=3, max_length=50)
    county: str = Field(..., min_length=2, max_length=50)
    role: OperatorRole = OperatorRole.DOCTOR


class HealthOperatorCreate(HealthOperatorBase):
    """Model for creating a new health operator."""
    user_id: str


class HealthOperatorResponse(HealthOperatorBase):
    """Model for health operator API responses."""
    id: str
    user_id: str
    is_verified: bool
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class OperatorApprovalRequest(BaseModel):
    """Request model for approving/rejecting operators."""
    action: str = Field(..., pattern=r'^(approve|reject)$')
    reason: Optional[str] = None


# ═══════════════════════════════════════════════════════════════════════════════
# Insight Models
# ═══════════════════════════════════════════════════════════════════════════════

class InsightBase(BaseModel):
    """Base model for health insights."""
    title: str = Field(..., min_length=5, max_length=200)
    content: str = Field(..., min_length=10)
    county: str
    source_type: SourceType


class InsightCreate(InsightBase):
    """Model for creating a new insight."""
    operator_id: str
    disease_indicators: List[str] = []
    severity_score: int = Field(default=50, ge=0, le=100)


class InsightResponse(InsightBase):
    """Model for insight API responses."""
    id: str
    operator_id: str
    disease_indicators: List[str]
    severity_score: int
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    status: InsightStatus
    file_path: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InsightVerifyRequest(BaseModel):
    """Request model for verifying an insight."""
    is_verified: bool
    notes: Optional[str] = None


class HarvestRequest(BaseModel):
    """Request model for triggering a social media harvest."""
    counties: Optional[List[str]] = None  # Filter by counties, None = all
    diseases: Optional[List[str]] = None  # Filter by diseases, None = all


class HarvestResponse(BaseModel):
    """Response model for harvest operation."""
    success: bool
    insights_count: int
    insights: List[dict]
    harvested_at: datetime


# ═══════════════════════════════════════════════════════════════════════════════
# PDF Upload Models
# ═══════════════════════════════════════════════════════════════════════════════

class PDFUploadResponse(BaseModel):
    """Response model for PDF upload."""
    success: bool
    filename: str
    insight_id: str
    extracted_summary: str
    disease_indicators: List[str]
    severity_score: int
    status: InsightStatus
    message: str
