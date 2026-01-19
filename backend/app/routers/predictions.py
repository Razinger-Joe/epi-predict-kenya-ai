"""
🎓 LEARNING: predictions.py - AI Predictions Router

This is the core of EpiPredict - outbreak predictions!
In a real system, this would call your ML model.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import random

from app.models.prediction import (
    OutbreakPrediction,
    PredictionConfidence,
    DailyPrediction,
    PredictionRequest,
    PredictionResponse
)

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Mock Prediction Service
# ═══════════════════════════════════════════════════════════════════════════════
# This simulates what your ML model would do.
# In production, you'd call your trained model here.

def generate_mock_prediction(
    county_id: str,
    county_name: str,
    disease: str,
    days: int = 14
) -> OutbreakPrediction:
    """
    Generate a mock outbreak prediction.
    
    🎓 LEARNING: In production, this function would:
    1. Load historical data from database
    2. Preprocess the data
    3. Run it through your trained ML model
    4. Format the results
    """
    random.seed(hash(f"{county_id}-{disease}"))
    
    # Generate risk score
    risk_score = random.uniform(20, 95)
    
    # Determine confidence based on data quality (mocked)
    if risk_score > 70:
        confidence = PredictionConfidence.HIGH
    elif risk_score > 40:
        confidence = PredictionConfidence.MEDIUM
    else:
        confidence = PredictionConfidence.LOW
    
    # Generate daily predictions
    daily_predictions = []
    base_cases = random.randint(10, 100)
    
    for i in range(days):
        date = datetime.utcnow().date() + timedelta(days=i + 1)
        predicted = max(0, base_cases + random.randint(-10, 20))
        margin = int(predicted * 0.2)  # 20% margin
        
        daily_predictions.append(DailyPrediction(
            date=date,
            predicted_cases=predicted,
            lower_bound=max(0, predicted - margin),
            upper_bound=predicted + margin
        ))
    
    # Generate insights
    factors = [
        "Historical disease patterns",
        "Recent rainfall data",
        "Population density",
        "Healthcare facility access",
        "Seasonal trends"
    ]
    
    actions = [
        "Increase disease surveillance",
        "Stock essential medications",
        "Deploy mobile health clinics",
        "Launch public awareness campaign",
        "Coordinate with neighboring counties"
    ]
    
    return OutbreakPrediction(
        county_id=county_id,
        county_name=county_name,
        disease_name=disease,
        risk_score=round(risk_score, 1),
        confidence=confidence,
        prediction_date=datetime.utcnow(),
        forecast_days=days,
        daily_predictions=daily_predictions,
        contributing_factors=random.sample(factors, 3),
        recommended_actions=random.sample(actions, 3)
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Prediction Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/{county_id}", response_model=PredictionResponse)
async def get_predictions_for_county(
    county_id: str,
    disease: Optional[str] = Query(None, description="Specific disease to predict"),
    days: int = Query(14, ge=7, le=30, description="Forecast days")
):
    """
    Get outbreak predictions for a county.
    
    🎓 LEARNING: Path + Query Parameters
    - county_id is required (path)
    - disease and days are optional (query)
    
    URL example: /api/predictions/047?disease=Malaria&days=21
    """
    # In real app: verify county exists in database
    county_names = {
        "001": "Mombasa", "042": "Kisumu", "047": "Nairobi",
        "022": "Kiambu", "032": "Nakuru"
    }
    
    county_name = county_names.get(county_id, f"County {county_id}")
    
    # Generate predictions
    diseases = [disease] if disease else ["Malaria", "Cholera", "Dengue"]
    predictions = [
        generate_mock_prediction(county_id, county_name, d, days)
        for d in diseases
    ]
    
    # Sort by risk score (highest first)
    predictions.sort(key=lambda p: p.risk_score, reverse=True)
    
    return PredictionResponse(
        predictions=predictions,
        generated_at=datetime.utcnow(),
        model_version="1.0.0-mock"
    )


@router.post("/generate", response_model=PredictionResponse)
async def generate_prediction(request: PredictionRequest):
    """
    Generate a custom prediction.
    
    🎓 LEARNING: POST for Complex Queries
    When you have many parameters, using POST with a body
    is cleaner than many query parameters.
    
    POST /api/predictions/generate
    Body: {"county_id": "047", "forecast_days": 21}
    """
    # In real app: validate county_id and disease_id exist
    
    diseases = ["Malaria"] if request.disease_id else ["Malaria", "Cholera", "Dengue"]
    
    predictions = [
        generate_mock_prediction(
            request.county_id,
            f"County {request.county_id}",
            d,
            request.forecast_days
        )
        for d in diseases
    ]
    
    return PredictionResponse(
        predictions=predictions,
        generated_at=datetime.utcnow(),
        model_version="1.0.0-mock"
    )


@router.get("/national/summary")
async def get_national_summary():
    """
    Get national disease prediction summary.
    
    🎓 LEARNING: Aggregate Endpoints
    Sometimes you need to return aggregated data instead of
    individual records. This endpoint summarizes nationwide risk.
    """
    return {
        "overall_risk": "medium",
        "high_risk_counties": 5,
        "counties_monitored": 47,
        "active_outbreaks": 2,
        "predictions_generated_today": 156,
        "model_accuracy": 94.7,
        "last_updated": datetime.utcnow().isoformat(),
        "alerts": [
            {
                "county": "Kisumu",
                "disease": "Cholera",
                "risk_score": 85,
                "message": "Elevated cholera risk due to recent flooding"
            },
            {
                "county": "Mombasa",
                "disease": "Dengue",
                "risk_score": 72,
                "message": "Seasonal dengue increase expected"
            }
        ]
    }
