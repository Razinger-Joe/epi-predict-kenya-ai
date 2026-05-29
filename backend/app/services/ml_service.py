"""
Machine Learning Services - Stateless Client Wrapper

Delegates ML training, prediction, and status requests to the standalone 
ml-service microservice via HTTP requests.
"""

import httpx
import logging
from typing import Optional, Dict, List
from app.config import settings
from app.models.training_data import (
    TrainingDataPoint,
    PredictionRequest,
    PredictionResponse,
)

logger = logging.getLogger(__name__)


class MLModelManager:
    """
    Client proxy that manages the ML model lifecycle by making API calls to ml-service
    """
    
    def __init__(self):
        """Initialize and configure ml-service URL"""
        self.ml_service_url = settings.ML_SERVICE_URL or "http://localhost:5000"
        logger.info(f"MLModelManager configured to communicate with: {self.ml_service_url}")
    
    def predict(self, prediction_request: PredictionRequest) -> PredictionResponse:
        """
        Delegates prediction to standalone ml-service via POST /predict
        """
        try:
            url = f"{self.ml_service_url}/predict"
            payload = prediction_request.dict()
            
            # Convert DiseaseEnum to standard string value for JSON serialization
            if payload.get("disease"):
                payload["disease"] = prediction_request.disease.value
                
            logger.info(f"Forwarding prediction request to ML microservice: {url}")
            
            with httpx.Client(timeout=30.0) as client:
                response = client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                
                return PredictionResponse(**data)
                
        except Exception as e:
            logger.error(f"ML prediction delegation failed: {e}")
            raise
    
    def train_model(
        self,
        training_data: List[TrainingDataPoint],
        disease: Optional[str] = None,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict:
        """
        Delegates model training to standalone ml-service via POST /train
        """
        try:
            url = f"{self.ml_service_url}/train"
            
            # Serialize the TrainingDataPoint objects to dictionaries
            serialized_data = []
            for d in training_data:
                record = d.dict()
                # Ensure date structures serialize correctly into ISO strings
                if record.get('date') and hasattr(record['date'], 'isoformat'):
                    record['date'] = record['date'].isoformat()
                if record.get('created_at') and hasattr(record['created_at'], 'isoformat'):
                    record['created_at'] = record['created_at'].isoformat()
                if record.get('updated_at') and hasattr(record['updated_at'], 'isoformat'):
                    record['updated_at'] = record['updated_at'].isoformat()
                
                # Convert DiseaseEnum to string
                if record.get('disease'):
                    record['disease'] = d.disease.value
                serialized_data.append(record)
            
            payload = {
                "training_data": serialized_data,
                "disease": disease.value if hasattr(disease, 'value') else disease,
                "test_size": test_size,
                "random_state": random_state
            }
            
            logger.info(f"Forwarding training request with {len(training_data)} samples to: {url}")
            
            with httpx.Client(timeout=120.0) as client:
                response = client.post(url, json=payload)
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            logger.error(f"ML training delegation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def get_model_status(self) -> Dict:
        """
        Retrieves ML model statuses from standalone ml-service via GET /model/status
        """
        try:
            url = f"{self.ml_service_url}/model/status"
            logger.info(f"Retrieving model status from ML microservice: {url}")
            
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url)
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            logger.error(f"Failed to retrieve ML status: {e}")
            return {
                "models": {},
                "last_update": None,
                "error": str(e)
            }
