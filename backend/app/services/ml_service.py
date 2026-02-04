"""
Machine Learning Services

This module provides ML model training, prediction, and management services.
Uses scikit-learn's Naive Bayes classifier for disease outbreak prediction.
"""

import joblib
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

from app.models.training_data import (
    TrainingDataPoint,
    PredictionRequest,
    PredictionResponse,
    RiskLevelEnum,
    DiseaseEnum,
)

logger = logging.getLogger(__name__)


class MLModelManager:
    """
    Manages ML model lifecycle including training, saving, loading, and predictions
    """
    
    def __init__(self, models_dir: str = "backend/models"):
        """
        Initialize ML Model Manager
        
        Args:
            models_dir: Directory to store trained models
        """
        self.models_dir = Path(models_dir)
        self.models_dir.mkdir(parents=True, exist_ok=True)
        
        # Store models and scalers in memory
        self.models: Dict[str, GaussianNB] = {}
        self.scalers: Dict[str, StandardScaler] = {}
        self.model_metadata: Dict[str, dict] = {}
        
        # Load metadata only (lazy load models)
        self._load_metadata()
    
    def _get_model_path(self, disease: Optional[str] = None) -> Path:
        """Get file path for model"""
        model_name = disease if disease else "all_diseases"
        return self.models_dir / f"naive_bayes_{model_name}.pkl"
    
    def _get_scaler_path(self, disease: Optional[str] = None) -> Path:
        """Get file path for scaler"""
        model_name = disease if disease else "all_diseases"
        return self.models_dir / f"scaler_{model_name}.pkl"
    
    def _get_metadata_path(self, disease: Optional[str] = None) -> Path:
        """Get file path for metadata"""
        model_name = disease if disease else "all_diseases"
        return self.models_dir / f"metadata_{model_name}.json"
    
    def _load_metadata(self):
        """Load metadata for all models (lightweight)"""
        try:
            for meta_file in self.models_dir.glob("metadata_*.json"):
                disease = meta_file.stem.replace("metadata_", "").replace("all_diseases", None)
                try:
                    with open(meta_file, 'r') as f:
                        self.model_metadata[disease or "all"] = json.load(f)
                    logger.info(f"Loaded metadata for disease: {disease}")
                except Exception as e:
                    logger.warning(f"Failed to load metadata {disease}: {e}")
        except Exception as e:
            logger.warning(f"No existing metadata found: {e}")

    def _get_or_load_model(self, disease_key: str):
        """Lazy load model and scaler if not in memory"""
        if disease_key in self.models:
            return self.models[disease_key], self.scalers.get(disease_key)
        
        # Determine disease name from key
        disease_name = None if disease_key == "all" else disease_key
        
        model_path = self._get_model_path(disease_name)
        if not model_path.exists():
            return None, None
            
        try:
            model = joblib.load(model_path)
            self.models[disease_key] = model
            
            scaler_path = self._get_scaler_path(disease_name)
            if scaler_path.exists():
                self.scalers[disease_key] = joblib.load(scaler_path)
                
            logger.info(f"Lazy loaded model for {disease_key}")
            return model, self.scalers.get(disease_key)
        except Exception as e:
            logger.error(f"Failed to lazy load model {disease_key}: {e}")
            return None, None
    
    def prepare_training_data(
        self,
        training_data: List[TrainingDataPoint],
        disease: Optional[DiseaseEnum] = None
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare data for training
        
        Args:
            training_data: List of training data points
            disease: Specific disease to filter for
            
        Returns:
            Features (X) and labels (y) as numpy arrays
        """
        # Filter by disease if specified
        if disease:
            data = [d for d in training_data if d.disease == disease]
        else:
            data = training_data
        
        if not data:
            raise ValueError(f"No training data available for disease: {disease}")
        
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame([d.dict() for d in data])
        
        # Feature columns (exclude id, dates, and outcome)
        feature_cols = [
            'temperature', 'humidity', 'rainfall',
            'population_density', 'access_to_water', 'healthcare_coverage',
            'previous_cases', 'vaccination_rate'
        ]
        
        X = df[feature_cols].values
        y = df['outbreak_occurred'].values
        
        logger.info(f"Prepared {len(X)} samples with {len(feature_cols)} features")
        return X, y
    
    def train_model(
        self,
        training_data: List[TrainingDataPoint],
        disease: Optional[DiseaseEnum] = None,
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Dict:
        """
        Train a Naive Bayes model
        
        Args:
            training_data: List of training data points
            disease: Specific disease to train for (None = all diseases)
            test_size: Proportion of data to use for testing
            random_state: Random seed for reproducibility
            
        Returns:
            Training results dictionary with metrics
        """
        try:
            # Prepare data
            X, y = self.prepare_training_data(training_data, disease)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            model = GaussianNB()
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test_scaled)
            
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, zero_division=0)
            recall = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)
            
            # Store model and scaler
            model_key = disease.value if disease else "all"
            self.models[model_key] = model
            self.scalers[model_key] = scaler
            
            # Save model and metadata
            model_path = self._get_model_path(disease.value if disease else None)
            scaler_path = self._get_scaler_path(disease.value if disease else None)
            
            joblib.dump(model, model_path)
            joblib.dump(scaler, scaler_path)
            
            # Save metadata
            metadata = {
                "disease": disease.value if disease else "all_diseases",
                "accuracy": float(accuracy),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
                "trained_at": datetime.now().isoformat(),
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "features": [
                    'temperature', 'humidity', 'rainfall',
                    'population_density', 'access_to_water', 'healthcare_coverage',
                    'previous_cases', 'vaccination_rate'
                ]
            }
            self.model_metadata[model_key] = metadata
            
            meta_path = self._get_metadata_path(disease.value if disease else None)
            with open(meta_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logger.info(f"Model trained successfully for {disease or 'all diseases'}")
            
            return {
                "success": True,
                "model_version": f"v{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "disease": disease.value if disease else None,
                "accuracy": accuracy,
                "precision": precision,
                "recall": recall,
                "f1_score": f1,
                "training_samples": len(X_train),
                "metrics": {
                    "true_positives": int(np.sum((y_pred == 1) & (y_test == 1))),
                    "true_negatives": int(np.sum((y_pred == 0) & (y_test == 0))),
                    "false_positives": int(np.sum((y_pred == 1) & (y_test == 0))),
                    "false_negatives": int(np.sum((y_pred == 0) & (y_test == 1)))
                }
            }
        
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def predict(self, prediction_request: PredictionRequest) -> PredictionResponse:
        """
        Make a prediction using trained model
        
        Args:
            prediction_request: Prediction request with features
            
        Returns:
            Prediction response with probability and recommendations
        """
        try:
            # Get model for disease
            model_key = prediction_request.disease.value
            
            model, scaler = self._get_or_load_model(model_key)
            
            if not model:
                logger.warning(f"No model for {model_key}, trying general model")
                model_key = "all"
                model, scaler = self._get_or_load_model(model_key)
            
            if not model:
                raise ValueError(f"No trained model available for {prediction_request.disease}")
            
            # Prepare features
            features = np.array([[
                prediction_request.temperature,
                prediction_request.humidity,
                prediction_request.rainfall,
                prediction_request.population_density,
                prediction_request.access_to_water,
                prediction_request.healthcare_coverage,
                prediction_request.previous_cases,
                prediction_request.vaccination_rate
            ]])
            
            # Scale features
            if scaler:
                features = scaler.transform(features)
            
            # Predict
            outbreak_prob = model.predict_proba(features)[0][1]  # Probability of outbreak
            prediction = model.predict(features)[0]
            
            # Determine risk level
            if outbreak_prob >= 0.8:
                risk_level = RiskLevelEnum.CRITICAL
                estimated_cases = int(prediction_request.previous_cases * 2.5)
            elif outbreak_prob >= 0.6:
                risk_level = RiskLevelEnum.HIGH
                estimated_cases = int(prediction_request.previous_cases * 1.8)
            elif outbreak_prob >= 0.4:
                risk_level = RiskLevelEnum.MEDIUM
                estimated_cases = int(prediction_request.previous_cases * 1.2)
            else:
                risk_level = RiskLevelEnum.LOW
                estimated_cases = int(prediction_request.previous_cases * 0.8)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                prediction_request,
                risk_level,
                outbreak_prob
            )
            
            metadata = self.model_metadata.get(model_key, {})
            model_version = metadata.get("trained_at", "unknown")[:10]  # Date only
            
            response = PredictionResponse(
                county=prediction_request.county,
                disease=prediction_request.disease,
                risk_level=risk_level,
                outbreak_probability=round(outbreak_prob, 4),
                confidence_score=round(max(outbreak_prob, 1 - outbreak_prob), 4),
                predicted_cases=estimated_cases,
                model_version=f"NaiveBayes_{model_version}",
                recommendations=recommendations
            )
            
            logger.info(
                f"Prediction for {prediction_request.county} ({prediction_request.disease}): "
                f"{risk_level} (prob={outbreak_prob:.2%})"
            )
            
            return response
        
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            raise
    
    @staticmethod
    def _generate_recommendations(
        request: PredictionRequest,
        risk_level: RiskLevelEnum,
        probability: float
    ) -> List[str]:
        """Generate actionable recommendations based on prediction"""
        recommendations = []
        
        if risk_level == RiskLevelEnum.CRITICAL:
            recommendations.extend([
                "🚨 Activate emergency response protocol immediately",
                "📞 Alert Ministry of Health for outbreak investigation",
                "🏥 Prepare isolation wards and ICU beds",
                "💉 Begin mass vaccination campaign",
                "📊 Increase surveillance frequency to daily"
            ])
        elif risk_level == RiskLevelEnum.HIGH:
            recommendations.extend([
                "⚠️  Increase health facility preparedness",
                "📋 Stockpile medical supplies and medications",
                "👥 Alert community health workers",
                "📊 Begin weekly surveillance monitoring",
                "🎓 Conduct public health education"
            ])
        elif risk_level == RiskLevelEnum.MEDIUM:
            recommendations.extend([
                "👁️  Maintain elevated surveillance",
                "📦 Review and update supply inventory",
                "🏥 Train healthcare workers on protocols",
                "📊 Monitor trend every 2-3 days"
            ])
        else:  # LOW
            recommendations.append("✅ Continue routine surveillance")
        
        # Environment-specific recommendations
        if request.temperature > 30 and request.disease == DiseaseEnum.MALARIA:
            recommendations.append("🦟 Increase mosquito control measures")
        
        if request.humidity > 70 and request.rainfall > 100:
            recommendations.append("💧 Enhance water quality monitoring")
        
        if request.vaccination_rate < 50:
            recommendations.append("💉 Accelerate vaccination campaigns")
        
        if request.access_to_water < 60:
            recommendations.append("💦 Improve water and sanitation infrastructure")
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def get_model_status(self) -> Dict:
        """Get status of all trained models"""
        status = {
            "models": {},
            "last_update": None
        }
        
        for disease, metadata in self.model_metadata.items():
            status["models"][disease] = {
                "trained_at": metadata.get("trained_at"),
                "accuracy": metadata.get("accuracy"),
                "training_samples": metadata.get("training_samples"),
                "features": len(metadata.get("features", []))
            }
            if metadata.get("trained_at"):
                status["last_update"] = metadata.get("trained_at")
        
        return status
