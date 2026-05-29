from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class DiseaseEnum(str, Enum):
    MALARIA = "Malaria"
    CHOLERA = "Cholera"
    FLU = "Flu"
    TYPHOID = "Typhoid"
    DENGUE = "Dengue"
    COVID = "COVID-19"


class RiskLevelEnum(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TrainingDataPoint(BaseModel):
    id: Optional[int] = None
    county: str
    disease: DiseaseEnum
    temperature: float
    humidity: float
    rainfall: float
    population_density: float
    access_to_water: float = 0
    healthcare_coverage: float = 0
    previous_cases: int = 0
    vaccination_rate: float = 0
    outbreak_occurred: bool
    cases_reported: int = 0
    date: datetime = Field(default_factory=datetime.now)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PredictionRequest(BaseModel):
    county: str
    disease: DiseaseEnum
    temperature: float
    humidity: float
    rainfall: float
    population_density: float
    access_to_water: float = 0
    healthcare_coverage: float = 0
    previous_cases: int = 0
    vaccination_rate: float = 0


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    county: str
    disease: DiseaseEnum
    risk_level: RiskLevelEnum
    outbreak_probability: float
    confidence_score: float
    predicted_cases: int = 0
    model_version: str
    created_at: datetime = Field(default_factory=datetime.now)
    recommendations: List[str] = Field(default_factory=list)


class ModelTrainingRequest(BaseModel):
    disease: Optional[DiseaseEnum] = None
    test_size: float = 0.2
    random_state: int = 42


class ModelTrainingResponse(BaseModel):
    success: bool
    model_version: str
    disease: Optional[DiseaseEnum]
    accuracy: float
    training_samples: int
    training_timestamp: datetime
    status: str = "success"
    metrics: Optional[dict] = None
