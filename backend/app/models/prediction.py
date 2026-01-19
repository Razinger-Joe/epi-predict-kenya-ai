"""
🎓 LEARNING: Prediction Models

These models represent the AI prediction outputs.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from enum import Enum


class PredictionConfidence(str, Enum):
    """Confidence level of the prediction"""
    LOW = "low"         # < 70%
    MEDIUM = "medium"   # 70-85%
    HIGH = "high"       # > 85%


class DailyPrediction(BaseModel):
    """Prediction for a single day"""
    date: date
    predicted_cases: int = Field(..., ge=0)
    lower_bound: int = Field(..., ge=0, description="95% confidence interval lower")
    upper_bound: int = Field(..., ge=0, description="95% confidence interval upper")


class OutbreakPrediction(BaseModel):
    """
    Disease outbreak prediction for a county.
    
    🎓 LEARNING: This is what your AI model will return.
    The structure is designed to be useful for the dashboard.
    """
    county_id: str
    county_name: str
    disease_name: str
    
    # Prediction details
    risk_score: float = Field(..., ge=0, le=100, description="Risk score 0-100")
    confidence: PredictionConfidence
    prediction_date: datetime = Field(..., description="When this prediction was made")
    
    # Forecast
    forecast_days: int = Field(default=14, description="Days into the future")
    daily_predictions: List[DailyPrediction] = Field(default_factory=list)
    
    # Insights
    contributing_factors: List[str] = Field(
        default_factory=list,
        example=["Recent rainfall", "Population density", "Historical patterns"]
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        example=["Increase surveillance", "Stock antimalarials", "Public awareness campaign"]
    )


class PredictionRequest(BaseModel):
    """Request body for generating a prediction"""
    county_id: str
    disease_id: Optional[str] = Field(None, description="Specific disease, or None for all")
    forecast_days: int = Field(default=14, ge=7, le=30)


class PredictionResponse(BaseModel):
    """Response containing predictions"""
    predictions: List[OutbreakPrediction]
    generated_at: datetime
    model_version: str = Field(default="1.0.0")
