/**
 * 🎓 LEARNING: Predictions Service
 * 
 * Handles API calls for AI outbreak predictions.
 */

import { api } from './api';

// ═══════════════════════════════════════════════════════════════════════════════
// TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════════════════════

export type PredictionConfidence = 'low' | 'medium' | 'high';

export interface DailyPrediction {
    date: string;
    predicted_cases: number;
    lower_bound: number;
    upper_bound: number;
}

export interface OutbreakPrediction {
    county_id: string;
    county_name: string;
    disease_name: string;
    risk_score: number;
    confidence: PredictionConfidence;
    prediction_date: string;
    forecast_days: number;
    daily_predictions: DailyPrediction[];
    contributing_factors: string[];
    recommended_actions: string[];
}

export interface PredictionResponse {
    predictions: OutbreakPrediction[];
    generated_at: string;
    model_version: string;
}

export interface NationalSummary {
    overall_risk: string;
    high_risk_counties: number;
    counties_monitored: number;
    active_outbreaks: number;
    predictions_generated_today: number;
    model_accuracy: number;
    last_updated: string;
    alerts: Array<{
        county: string;
        disease: string;
        risk_score: number;
        message: string;
    }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service Functions
// ═══════════════════════════════════════════════════════════════════════════════

export const predictionsService = {
    /**
     * Get predictions for a specific county
     */
    getForCounty: async (
        countyId: string,
        params?: { disease?: string; days?: number }
    ): Promise<PredictionResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.disease) searchParams.set('disease', params.disease);
        if (params?.days) searchParams.set('days', String(params.days));

        const query = searchParams.toString();
        return api.get(`/api/predictions/${countyId}${query ? `?${query}` : ''}`);
    },

    /**
     * Generate a custom prediction
     */
    generate: async (request: {
        county_id: string;
        disease_id?: string;
        forecast_days?: number;
    }): Promise<PredictionResponse> => {
        return api.post('/api/predictions/generate', request);
    },

    /**
     * Get national summary
     */
    getNationalSummary: async (): Promise<NationalSummary> => {
        return api.get('/api/predictions/national/summary');
    },
};
