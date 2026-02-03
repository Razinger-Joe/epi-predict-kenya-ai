"""
ML Prediction Routes

API endpoints for machine learning predictions and model management
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from supabase import Client
from app.database import get_supabase_client
from app.models.training_data import (
    TrainingDataPoint,
    PredictionRequest,
    PredictionResponse,
    ModelTrainingRequest,
    ModelTrainingResponse,
)
from app.services.ml_service import MLModelManager
from app.services.training_data_repository import TrainingDataRepository
from app.core.responses import APIResponse, ListResponse

logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(tags=["Machine Learning"])

# Global ML Model Manager instance
ml_manager = MLModelManager()


# ═══════════════════════════════════════════════════════════════════════════════
# 📊 Prediction Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/predict",
    response_model=APIResponse[PredictionResponse],
    summary="Make Disease Outbreak Prediction",
    description="Predict disease outbreak probability for a county using trained ML model"
)
async def predict_outbreak(
    request: PredictionRequest,
    db: Client = Depends(get_supabase_client)
) -> APIResponse[PredictionResponse]:
    """
    Make a disease outbreak prediction
    
    Uses trained Naive Bayes model to predict outbreak probability based on
    environmental, health, and disease factors.
    
    Args:
        request: Prediction request with features
        db: Database client (injected)
        
    Returns:
        Prediction response with risk level, probability, and recommendations
        
    Example:
        ```json
        {
            "county": "Nairobi",
            "disease": "Malaria",
            "temperature": 28.5,
            "humidity": 65,
            "rainfall": 45,
            "population_density": 5000,
            "access_to_water": 75,
            "healthcare_coverage": 85,
            "previous_cases": 150,
            "vaccination_rate": 60
        }
        ```
    """
    try:
        prediction = ml_manager.predict(request)
        return APIResponse.success_response(
            data=prediction,
            message=f"Prediction successful: {prediction.risk_level.value} risk"
        )
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post(
    "/predict/batch",
    response_model=APIResponse[List[PredictionResponse]],
    summary="Batch Prediction",
    description="Make predictions for multiple counties/diseases"
)
async def batch_predict(
    requests: List[PredictionRequest],
    db: Client = Depends(get_supabase_client)
) -> APIResponse[List[PredictionResponse]]:
    """
    Make batch predictions for multiple counties or diseases
    
    Args:
        requests: List of prediction requests
        db: Database client (injected)
        
    Returns:
        List of prediction responses
    """
    try:
        predictions = [ml_manager.predict(req) for req in requests]
        return APIResponse.list_response(
            data=predictions,
            count=len(predictions),
            message=f"Generated {len(predictions)} predictions"
        )
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Batch prediction failed: {str(e)}"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 🧠 Model Training Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/train",
    response_model=APIResponse[ModelTrainingResponse],
    summary="Train ML Model",
    description="Train or retrain the Naive Bayes prediction model"
)
async def train_model(
    request: ModelTrainingRequest,
    db: Client = Depends(get_supabase_client)
) -> APIResponse[ModelTrainingResponse]:
    """
    Train a new ML model using historical data
    
    Fetches all training data from database and trains a Naive Bayes classifier.
    Can train a model for specific disease or all diseases combined.
    
    Args:
        request: Training request with model parameters
        db: Database client (injected)
        
    Returns:
        Training results with accuracy and metrics
        
    Note:
        This is an intensive operation and may take time with large datasets.
        Consider running during off-peak hours.
    """
    try:
        # Get training data from database
        repo = TrainingDataRepository(db)
        
        if request.disease:
            training_data = repo.get_by_disease(request.disease)
        else:
            training_data = repo.get_all()
        
        if not training_data:
            raise ValueError(
                f"No training data available for disease: {request.disease}"
            )
        
        # Train model
        result = ml_manager.train_model(
            training_data=training_data,
            disease=request.disease,
            test_size=request.test_size,
            random_state=request.random_state
        )
        
        if result["success"]:
            return APIResponse.success_response(
                data=ModelTrainingResponse(
                    success=True,
                    model_version=result["model_version"],
                    disease=request.disease,
                    accuracy=result["accuracy"],
                    training_samples=result["training_samples"],
                    training_timestamp=__import__("datetime").datetime.now(),
                    status="success",
                    metrics=result["metrics"]
                ),
                message=f"Model trained with {result['accuracy']:.1%} accuracy"
            )
        else:
            raise Exception(result.get("error", "Training failed"))
    
    except Exception as e:
        logger.error(f"Training error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Training failed: {str(e)}"
        )


@router.get(
    "/model/status",
    response_model=APIResponse[dict],
    summary="Get Model Status",
    description="Get status of trained ML models"
)
async def get_model_status() -> APIResponse[dict]:
    """
    Get status of all trained models
    
    Returns:
        Information about trained models including accuracy, training date, etc.
    """
    try:
        status = ml_manager.get_model_status()
        return APIResponse.success_response(
            data=status,
            message="Model status retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Error getting model status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get model status"
        )


# ═══════════════════════════════════════════════════════════════════════════════
# 📚 Training Data Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post(
    "/training-data",
    response_model=APIResponse[TrainingDataPoint],
    summary="Create Training Data",
    description="Add new training data point"
)
async def create_training_data(
    data: TrainingDataPoint,
    db: Client = Depends(get_supabase_client)
) -> APIResponse[TrainingDataPoint]:
    """
    Create a new training data point
    
    Used to build the dataset for training ML models.
    Each point represents observations for a county/disease combination.
    
    Args:
        data: Training data point with all required features
        db: Database client (injected)
        
    Returns:
        Created training data with assigned ID
    """
    try:
        repo = TrainingDataRepository(db)
        created = repo.create(data)
        return APIResponse.success_response(
            data=created,
            message="Training data created successfully"
        )
    except Exception as e:
        logger.error(f"Error creating training data: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create training data: {str(e)}"
        )


@router.post(
    "/training-data/batch",
    response_model=APIResponse[List[TrainingDataPoint]],
    summary="Batch Create Training Data",
    description="Add multiple training data points"
)
async def create_training_data_batch(
    data_list: List[TrainingDataPoint],
    db: Client = Depends(get_supabase_client)
) -> APIResponse[List[TrainingDataPoint]]:
    """
    Create multiple training data points at once
    
    Useful for bulk uploads of historical data.
    
    Args:
        data_list: List of training data points
        db: Database client (injected)
        
    Returns:
        List of created training data with assigned IDs
    """
    try:
        repo = TrainingDataRepository(db)
        created = repo.create_batch(data_list)
        return APIResponse.list_response(
            data=created,
            count=len(created),
            message=f"Created {len(created)} training data points"
        )
    except Exception as e:
        logger.error(f"Error creating training data batch: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create training data: {str(e)}"
        )


@router.get(
    "/training-data",
    response_model=APIResponse[List[TrainingDataPoint]],
    summary="Get All Training Data",
    description="Retrieve all training data points"
)
async def get_training_data(
    db: Client = Depends(get_supabase_client)
) -> APIResponse[List[TrainingDataPoint]]:
    """
    Get all training data points
    
    Args:
        db: Database client (injected)
        
    Returns:
        List of all training data points
    """
    try:
        repo = TrainingDataRepository(db)
        data = repo.get_all()
        return APIResponse.list_response(
            data=data,
            count=len(data),
            message="Training data retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Error fetching training data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch training data"
        )


@router.get(
    "/training-data/statistics",
    response_model=APIResponse[dict],
    summary="Get Training Data Statistics",
    description="Get statistics about training data"
)
async def get_training_data_statistics(
    db: Client = Depends(get_supabase_client)
) -> APIResponse[dict]:
    """
    Get statistics about training data
    
    Returns information about data distribution, averages, etc.
    
    Args:
        db: Database client (injected)
        
    Returns:
        Statistics dictionary with counts, averages, etc.
    """
    try:
        repo = TrainingDataRepository(db)
        stats = repo.get_statistics()
        return APIResponse.success_response(
            data=stats,
            message="Statistics retrieved successfully"
        )
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get statistics"
        )


@router.get(
    "/training-data/{data_id}",
    response_model=APIResponse[TrainingDataPoint],
    summary="Get Training Data by ID",
    description="Retrieve specific training data point"
)
async def get_training_data_by_id(
    data_id: int,
    db: Client = Depends(get_supabase_client)
) -> APIResponse[TrainingDataPoint]:
    """
    Get a specific training data point by ID
    
    Args:
        data_id: ID of training data
        db: Database client (injected)
        
    Returns:
        Training data point or 404 if not found
    """
    try:
        repo = TrainingDataRepository(db)
        data = repo.get_by_id(data_id)
        
        if not data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Training data {data_id} not found"
            )
        
        return APIResponse.success_response(
            data=data,
            message="Training data retrieved successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching training data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch training data"
        )


@router.delete(
    "/training-data/{data_id}",
    response_model=APIResponse[dict],
    summary="Delete Training Data",
    description="Remove a training data point"
)
async def delete_training_data(
    data_id: int,
    db: Client = Depends(get_supabase_client)
) -> APIResponse[dict]:
    """
    Delete a training data point
    
    Args:
        data_id: ID of training data to delete
        db: Database client (injected)
        
    Returns:
        Confirmation message
    """
    try:
        repo = TrainingDataRepository(db)
        repo.delete(data_id)
        return APIResponse.success_response(
            data={"deleted_id": data_id},
            message="Training data deleted successfully"
        )
    except Exception as e:
        logger.error(f"Error deleting training data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete training data"
        )
