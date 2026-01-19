/**
 * 🎓 LEARNING: React Query Hooks for API Data
 * 
 * React Query (TanStack Query) handles:
 * - Caching API responses
 * - Background refetching
 * - Loading/error states
 * - Optimistic updates
 * 
 * This gives you a much better UX than managing state manually.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    diseasesService,
    countiesService,
    predictionsService,
    type Disease,
    type DiseaseCreate,
    type DiseaseCategory,
    type RiskLevel,
} from '@/services';

// ═══════════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING: Query Keys
// ═══════════════════════════════════════════════════════════════════════════════
// Query keys identify cached data. When you invalidate a key,
// React Query knows to refetch that data.

export const queryKeys = {
    diseases: {
        all: ['diseases'] as const,
        list: (params?: { category?: DiseaseCategory }) =>
            [...queryKeys.diseases.all, 'list', params] as const,
        detail: (id: string) => [...queryKeys.diseases.all, 'detail', id] as const,
    },
    counties: {
        all: ['counties'] as const,
        list: (params?: { region?: string; risk_level?: RiskLevel }) =>
            [...queryKeys.counties.all, 'list', params] as const,
        detail: (id: string) => [...queryKeys.counties.all, 'detail', id] as const,
        history: (id: string, days: number) =>
            [...queryKeys.counties.all, 'history', id, days] as const,
    },
    predictions: {
        all: ['predictions'] as const,
        forCounty: (countyId: string, params?: { disease?: string }) =>
            [...queryKeys.predictions.all, 'county', countyId, params] as const,
        nationalSummary: () => [...queryKeys.predictions.all, 'national'] as const,
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING: useQuery Hooks (Read Data)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook to fetch list of diseases
 */
export function useDiseases(params?: { category?: DiseaseCategory; search?: string }) {
    return useQuery({
        queryKey: queryKeys.diseases.list(params),
        queryFn: () => diseasesService.list(params),
        // 🎓 LEARNING: staleTime = how long before data is considered "stale"
        // After this time, React Query will refetch in the background
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to fetch a single disease
 */
export function useDisease(id: string) {
    return useQuery({
        queryKey: queryKeys.diseases.detail(id),
        queryFn: () => diseasesService.get(id),
        // 🎓 LEARNING: enabled = condition to run the query
        // If false, query won't run until condition is true
        enabled: !!id,
    });
}

/**
 * Hook to fetch counties with stats
 */
export function useCounties(params?: { region?: string; risk_level?: RiskLevel }) {
    return useQuery({
        queryKey: queryKeys.counties.list(params),
        queryFn: () => countiesService.list(params),
        staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
    });
}

/**
 * Hook to fetch county history
 */
export function useCountyHistory(countyId: string, days: number = 30) {
    return useQuery({
        queryKey: queryKeys.counties.history(countyId, days),
        queryFn: () => countiesService.getHistory(countyId, days),
        enabled: !!countyId,
    });
}

/**
 * Hook to fetch predictions for a county
 */
export function usePredictions(countyId: string, params?: { disease?: string }) {
    return useQuery({
        queryKey: queryKeys.predictions.forCounty(countyId, params),
        queryFn: () => predictionsService.getForCounty(countyId, params),
        enabled: !!countyId,
        staleTime: 10 * 60 * 1000, // 10 minutes (predictions don't change often)
    });
}

/**
 * Hook to fetch national summary
 */
export function useNationalSummary() {
    return useQuery({
        queryKey: queryKeys.predictions.nationalSummary(),
        queryFn: () => predictionsService.getNationalSummary(),
        staleTime: 5 * 60 * 1000,
        // 🎓 LEARNING: refetchInterval = auto-refetch every X ms
        // Great for dashboards that need real-time-ish data
        refetchInterval: 60 * 1000, // Refetch every minute
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING: useMutation Hooks (Write Data)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook to create a disease
 */
export function useCreateDisease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DiseaseCreate) => diseasesService.create(data),
        // 🎓 LEARNING: onSuccess callback
        // After mutation succeeds, invalidate related queries to refetch
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.diseases.all });
        },
    });
}

/**
 * Hook to update a disease
 */
export function useUpdateDisease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Disease> }) =>
            diseasesService.update(id, data),
        onSuccess: (_, { id }) => {
            // Invalidate both the list and the specific disease
            queryClient.invalidateQueries({ queryKey: queryKeys.diseases.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.diseases.detail(id) });
        },
    });
}

/**
 * Hook to delete a disease
 */
export function useDeleteDisease() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => diseasesService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.diseases.all });
        },
    });
}
