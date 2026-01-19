"""
🎓 LEARNING: County Models

These models represent Kenya's 47 counties and their disease statistics.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level for a county"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CountyBase(BaseModel):
    """Base county model"""
    name: str = Field(..., example="Nairobi")
    code: str = Field(..., description="County code (001-047)", example="047")
    population: Optional[int] = Field(None, example=4397073)
    region: Optional[str] = Field(None, example="Central")


class County(CountyBase):
    """Full county model with database fields"""
    id: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class CountyStats(BaseModel):
    """Disease statistics for a county"""
    county_id: str
    county_name: str
    active_cases: int = Field(..., ge=0, description="Current active cases")
    risk_level: RiskLevel
    trend: str = Field(..., example="+5%", description="Week-over-week change")
    top_diseases: List[str] = Field(default_factory=list)
    last_updated: datetime


class CountyListResponse(BaseModel):
    """Response for listing counties with stats"""
    data: List[CountyStats]
    count: int
