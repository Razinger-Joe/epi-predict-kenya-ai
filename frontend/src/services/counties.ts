/**
 * 🎓 LEARNING: Counties Service
 * 
 * Handles API calls for Kenya's 47 counties.
 */

import { api } from './api';

// ═══════════════════════════════════════════════════════════════════════════════
// TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════════════════════

export type RiskLevel = 'low' | 'medium' | 'high';

export interface CountyStats {
    county_id: string;
    county_name: string;
    active_cases: number;
    risk_level: RiskLevel;
    trend: string;
    top_diseases: string[];
    last_updated: string;
}

export interface CountyListResponse {
    data: CountyStats[];
    count: number;
}

export interface County {
    id: string;
    name: string;
    code: string;
    population?: number;
    region?: string;
}

export interface CountyHistory {
    county: string;
    period_days: number;
    history: Array<{
        date: string;
        cases: number;
    }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Service Functions
// ═══════════════════════════════════════════════════════════════════════════════

export const countiesService = {
    /**
     * List all counties with stats
     */
    list: async (params?: {
        region?: string;
        risk_level?: RiskLevel;
    }): Promise<CountyListResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.region) searchParams.set('region', params.region);
        if (params?.risk_level) searchParams.set('risk_level', params.risk_level);

        const query = searchParams.toString();
        return api.get(`/api/counties${query ? `?${query}` : ''}`);
    },

    /**
     * Get a single county with details
     */
    get: async (id: string): Promise<County & { stats: CountyStats }> => {
        return api.get(`/api/counties/${id}`);
    },

    /**
     * Get historical data for a county
     */
    getHistory: async (id: string, days: number = 30): Promise<CountyHistory> => {
        return api.get(`/api/counties/${id}/history?days=${days}`);
    },
};
