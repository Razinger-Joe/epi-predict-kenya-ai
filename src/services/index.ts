/**
 * 🎓 LEARNING: Services Index
 * 
 * Re-exports all services for easy importing.
 * Instead of: import { predictionsService } from '@/services/predictions';
 * You can do: import { predictionsService } from '@/services';
 */

export { api, API_BASE_URL } from './api';
export { diseasesService } from './diseases';
export type { Disease, DiseaseCreate, DiseaseCategory, DiseaseListResponse } from './diseases';
export { countiesService } from './counties';
export type { County, CountyStats, RiskLevel, CountyListResponse } from './counties';
export { predictionsService } from './predictions';
export type { OutbreakPrediction, PredictionResponse, NationalSummary } from './predictions';
