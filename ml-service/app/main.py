from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from app.models import (
    PredictionRequest,
    PredictionResponse,
    TrainingDataPoint,
    ModelTrainingRequest,
    ModelTrainingResponse,
)
from app.ml_service import MLModelManager

app = FastAPI(
    title="EpiPredict Kenya AI - ML Service",
    description="Standalone ML prediction and training service",
    version="1.0.0"
)

ml_manager = MLModelManager()


class TrainPayload(BaseModel):
    training_data: List[TrainingDataPoint]
    disease: Optional[str] = None
    test_size: float = 0.2
    random_state: int = 42


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ml-service"}


@app.post("/predict", response_model=PredictionResponse)
def predict_outbreak(request: PredictionRequest):
    try:
        return ml_manager.predict(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/train")
def train_model(payload: TrainPayload):
    try:
        # Convert disease string to enum if present
        from app.models import DiseaseEnum
        disease_enum = None
        if payload.disease:
            disease_enum = DiseaseEnum(payload.disease)
            
        result = ml_manager.train_model(
            training_data=payload.training_data,
            disease=disease_enum,
            test_size=payload.test_size,
            random_state=payload.random_state
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/model/status")
def get_model_status():
    try:
        return ml_manager.get_model_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
