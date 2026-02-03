"""
Training Data Repository

Manages CRUD operations for training data in Supabase
"""

import logging
from typing import List, Optional
from datetime import datetime
from supabase import Client

from app.models.training_data import TrainingDataPoint, DiseaseEnum

logger = logging.getLogger(__name__)


class TrainingDataRepository:
    """Repository for training data operations"""
    
    def __init__(self, db: Client):
        """Initialize with Supabase client"""
        self.db = db
        self.table_name = "training_data"
    
    def create(self, data: TrainingDataPoint) -> TrainingDataPoint:
        """Create new training data point"""
        try:
            record = data.dict()
            record['created_at'] = datetime.now().isoformat()
            record['updated_at'] = datetime.now().isoformat()
            
            # Remove None values
            record = {k: v for k, v in record.items() if v is not None}
            
            response = self.db.table(self.table_name).insert(record).execute()
            
            if response.data:
                logger.info(f"Training data created: {response.data[0]['id']}")
                return TrainingDataPoint(**response.data[0])
            else:
                raise Exception("Failed to create training data")
        
        except Exception as e:
            logger.error(f"Error creating training data: {e}")
            raise
    
    def create_batch(self, data_list: List[TrainingDataPoint]) -> List[TrainingDataPoint]:
        """Create multiple training data points"""
        try:
            records = []
            for data in data_list:
                record = data.dict()
                record['created_at'] = datetime.now().isoformat()
                record['updated_at'] = datetime.now().isoformat()
                record = {k: v for k, v in record.items() if v is not None}
                records.append(record)
            
            response = self.db.table(self.table_name).insert(records).execute()
            logger.info(f"Created {len(response.data)} training data points")
            return [TrainingDataPoint(**r) for r in response.data]
        
        except Exception as e:
            logger.error(f"Error creating batch training data: {e}")
            raise
    
    def get_all(self) -> List[TrainingDataPoint]:
        """Get all training data"""
        try:
            response = self.db.table(self.table_name).select("*").execute()
            return [TrainingDataPoint(**r) for r in response.data]
        except Exception as e:
            logger.error(f"Error fetching training data: {e}")
            raise
    
    def get_by_disease(self, disease: DiseaseEnum) -> List[TrainingDataPoint]:
        """Get training data for specific disease"""
        try:
            response = self.db.table(self.table_name).select("*").eq(
                "disease", disease.value
            ).execute()
            return [TrainingDataPoint(**r) for r in response.data]
        except Exception as e:
            logger.error(f"Error fetching training data for {disease}: {e}")
            raise
    
    def get_by_county(self, county: str) -> List[TrainingDataPoint]:
        """Get training data for specific county"""
        try:
            response = self.db.table(self.table_name).select("*").eq(
                "county", county
            ).execute()
            return [TrainingDataPoint(**r) for r in response.data]
        except Exception as e:
            logger.error(f"Error fetching training data for {county}: {e}")
            raise
    
    def get_by_id(self, id: int) -> Optional[TrainingDataPoint]:
        """Get training data by ID"""
        try:
            response = self.db.table(self.table_name).select("*").eq(
                "id", id
            ).execute()
            
            if response.data:
                return TrainingDataPoint(**response.data[0])
            return None
        except Exception as e:
            logger.error(f"Error fetching training data {id}: {e}")
            raise
    
    def update(self, id: int, data: TrainingDataPoint) -> TrainingDataPoint:
        """Update training data"""
        try:
            record = data.dict()
            record['updated_at'] = datetime.now().isoformat()
            record = {k: v for k, v in record.items() if v is not None and k != 'id'}
            
            response = self.db.table(self.table_name).update(record).eq(
                "id", id
            ).execute()
            
            if response.data:
                logger.info(f"Training data updated: {id}")
                return TrainingDataPoint(**response.data[0])
            else:
                raise Exception(f"Failed to update training data {id}")
        
        except Exception as e:
            logger.error(f"Error updating training data: {e}")
            raise
    
    def delete(self, id: int) -> bool:
        """Delete training data"""
        try:
            response = self.db.table(self.table_name).delete().eq("id", id).execute()
            logger.info(f"Training data deleted: {id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting training data: {e}")
            raise
    
    def get_statistics(self) -> dict:
        """Get statistics about training data"""
        try:
            all_data = self.get_all()
            
            stats = {
                "total_records": len(all_data),
                "by_disease": {},
                "by_county": {},
                "outbreaks": sum(1 for d in all_data if d.outbreak_occurred),
                "avg_temperature": 0,
                "avg_humidity": 0,
                "avg_rainfall": 0
            }
            
            if all_data:
                # Group by disease
                for disease in DiseaseEnum:
                    count = sum(1 for d in all_data if d.disease == disease)
                    if count > 0:
                        stats["by_disease"][disease.value] = count
                
                # Group by county
                counties = set(d.county for d in all_data)
                for county in counties:
                    count = sum(1 for d in all_data if d.county == county)
                    stats["by_county"][county] = count
                
                # Calculate averages
                temps = [d.temperature for d in all_data]
                humidities = [d.humidity for d in all_data]
                rainfalls = [d.rainfall for d in all_data]
                
                stats["avg_temperature"] = round(sum(temps) / len(temps), 2)
                stats["avg_humidity"] = round(sum(humidities) / len(humidities), 2)
                stats["avg_rainfall"] = round(sum(rainfalls) / len(rainfalls), 2)
            
            return stats
        
        except Exception as e:
            logger.error(f"Error calculating statistics: {e}")
            raise
