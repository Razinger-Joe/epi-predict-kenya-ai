"""
Training Data Models for Machine Learning

These models define the structure of data used for training and storing
ML model predictions and training datasets.
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class DiseaseEnum(str, Enum):
    """Disease types for prediction"""
    MALARIA = "Malaria"
    CHOLERA = "Cholera"
    FLU = "Flu"
    TYPHOID = "Typhoid"
    DENGUE = "Dengue"
    COVID = "COVID-19"


class RiskLevelEnum(str, Enum):
    """Risk levels for outbreak predictions"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TrainingDataPoint(BaseModel):
    """
    Single data point for training the ML model
    
    Fields represent environmental and health factors that influence
    disease outbreak likelihood.
    """
    id: Optional[int] = None
    county: str = Field(..., description="County name (e.g., Nairobi)")
    disease: DiseaseEnum = Field(..., description="Type of disease")
    
    # Environmental factors
    temperature: float = Field(..., description="Average temperature (Celsius)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    rainfall: float = Field(..., ge=0, description="Monthly rainfall (mm)")
    
    # Health factors
    population_density: float = Field(..., ge=0, description="People per km²")
    access_to_water: float = Field(0, ge=0, le=100, description="% with water access")
    healthcare_coverage: float = Field(0, ge=0, le=100, description="% healthcare coverage")
    
    # Disease factors
    previous_cases: int = Field(0, ge=0, description="Cases in previous month")
    vaccination_rate: float = Field(0, ge=0, le=100, description="% vaccinated")
    
    # Outcome
    outbreak_occurred: bool = Field(..., description="Did outbreak occur? (label)")
    cases_reported: int = Field(0, ge=0, description="Number of cases reported")
    
    # Metadata
    date: datetime = Field(default_factory=datetime.now, description="Date of observation")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Update timestamp")


class PredictionRequest(BaseModel):
    """Request model for making predictions"""
    county: str = Field(..., description="County to predict for")
    disease: DiseaseEnum = Field(..., description="Disease to predict")
    
    # Environmental factors
    temperature: float = Field(..., description="Average temperature (Celsius)")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    rainfall: float = Field(..., ge=0, description="Monthly rainfall (mm)")
    
    # Health factors
    population_density: float = Field(..., ge=0, description="People per km²")
    access_to_water: float = Field(0, ge=0, le=100, description="% with water access")
    healthcare_coverage: float = Field(0, ge=0, le=100, description="% healthcare coverage")
    
    # Disease factors
    previous_cases: int = Field(0, ge=0, description="Cases in previous month")
    vaccination_rate: float = Field(0, ge=0, le=100, description="% vaccinated")


class PredictionResponse(BaseModel):
    """Response model for predictions"""
    id: Optional[int] = None
    county: str
    disease: DiseaseEnum
    risk_level: RiskLevelEnum = Field(..., description="Predicted risk level")
    outbreak_probability: float = Field(..., ge=0, le=1, description="Probability of outbreak (0-1)")
    confidence_score: float = Field(..., ge=0, le=1, description="Model confidence (0-1)")
    predicted_cases: int = Field(0, description="Estimated number of cases")
    
    # Model info
    model_version: str = Field(..., description="ML model version used")
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Recommendations
    recommendations: List[str] = Field(default_factory=list, description="Action recommendations")


class ModelTrainingRequest(BaseModel):
    """Request to train a new ML model"""
    disease: Optional[DiseaseEnum] = Field(None, description="Specific disease or None for all")
    test_size: float = Field(0.2, ge=0.1, le=0.5, description="Test data percentage")
    random_state: int = Field(42, description="Random seed for reproducibility")


class ModelTrainingResponse(BaseModel):
    """Response after model training"""
    success: bool
    model_version: str
    disease: Optional[DiseaseEnum]
    accuracy: float = Field(..., ge=0, le=1, description="Model accuracy on test set")
    training_samples: int
    training_timestamp: datetime
    status: str = Field("success", description="Training status")
    metrics: Optional[dict] = Field(None, description="Additional metrics")
