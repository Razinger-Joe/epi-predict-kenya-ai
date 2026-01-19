/**
 * 🎓 LEARNING: API Configuration
 * 
 * This file configures the base URL for API calls.
 * In development, it points to localhost.
 * In production, it will point to your deployed backend.
 */

// Get API URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * 🎓 LEARNING: Fetch Wrapper
 * 
 * A reusable function that wraps fetch() with:
 * - Base URL handling
 * - JSON parsing
 * - Error handling
 * - Type safety
 */
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    // 🎓 LEARNING: Error Handling
    // If the response is not OK (status 200-299), throw an error
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle empty responses (like 204 No Content)
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎓 LEARNING: HTTP Methods as Functions
// ═══════════════════════════════════════════════════════════════════════════════

export const api = {
    /**
     * GET request
     * @example api.get<User[]>('/api/users')
     */
    get: <T>(endpoint: string) => fetchAPI<T>(endpoint, { method: 'GET' }),

    /**
     * POST request
     * @example api.post<User>('/api/users', { name: 'John' })
     */
    post: <T>(endpoint: string, data: unknown) =>
        fetchAPI<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    /**
     * PATCH request (partial update)
     * @example api.patch<User>('/api/users/1', { name: 'Jane' })
     */
    patch: <T>(endpoint: string, data: unknown) =>
        fetchAPI<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    /**
     * DELETE request
     * @example api.delete('/api/users/1')
     */
    delete: (endpoint: string) => fetchAPI<void>(endpoint, { method: 'DELETE' }),
};

// Export the base URL for debugging
export { API_BASE_URL };
