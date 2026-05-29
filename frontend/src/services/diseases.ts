/**
 * 🎓 LEARNING: Diseases Service
 * 
 * This service handles all disease-related API calls.
 * It uses the api wrapper from api.ts for consistent error handling.
 */

import { api } from './api';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING: TypeScript Interfaces
// These match the Pydantic models from the backend
// ═══════════════════════════════════════════════════════════════════════════════

export type DiseaseCategory =
    | 'respiratory'
    | 'waterborne'
    | 'vector_borne'
    | 'viral'
    | 'bacterial'
    | 'other';

export interface Disease {
    id: string;
    name: string;
    category: DiseaseCategory;
    description?: string;
    symptoms: string[];
    created_at: string;
    updated_at?: string;
}

export interface DiseaseCreate {
    name: string;
    category: DiseaseCategory;
    description?: string;
    symptoms?: string[];
}

export interface DiseaseUpdate {
    name?: string;
    category?: DiseaseCategory;
    description?: string;
    symptoms?: string[];
}

export interface DiseaseListResponse {
    data: Disease[];
    count: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING: Service Functions
// Each function maps to an API endpoint
// ═══════════════════════════════════════════════════════════════════════════════

export const diseasesService = {
    /**
     * Get all diseases with optional filtering
     */
    list: async (params?: {
        category?: DiseaseCategory;
        search?: string;
        skip?: number;
        limit?: number;
    }): Promise<DiseaseListResponse> => {
        const searchParams = new URLSearchParams();
        if (params?.category) searchParams.set('category', params.category);
        if (params?.search) searchParams.set('search', params.search);
        if (params?.skip) searchParams.set('skip', String(params.skip));
        if (params?.limit) searchParams.set('limit', String(params.limit));

        const query = searchParams.toString();
        return api.get(`/api/diseases${query ? `?${query}` : ''}`);
    },

    /**
     * Get a single disease by ID
     */
    get: async (id: string): Promise<Disease> => {
        return api.get(`/api/diseases/${id}`);
    },

    /**
     * Create a new disease
     */
    create: async (data: DiseaseCreate): Promise<Disease> => {
        return api.post('/api/diseases', data);
    },

    /**
     * Update an existing disease
     */
    update: async (id: string, data: DiseaseUpdate): Promise<Disease> => {
        return api.patch(`/api/diseases/${id}`, data);
    },

    /**
     * Delete a disease
     */
    delete: async (id: string): Promise<void> => {
        return api.delete(`/api/diseases/${id}`);
    },
};
