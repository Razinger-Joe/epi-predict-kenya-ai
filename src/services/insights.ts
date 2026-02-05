/**
 * Insights API Service
 * Handles social media harvesting and PDF report uploads
 */

import { API_BASE_URL } from "./api";

export interface Insight {
    id: string;
    source: string;
    content: string;
    county: string;
    disease_indicators: string[];
    severity_score: number;
    status: "pending" | "analyzing" | "analyzed" | "verified" | "rejected";
    harvested_at: string;
}

export interface HarvestRequest {
    counties?: string[];
    diseases?: string[];
}

export interface HarvestResponse {
    success: boolean;
    insights_count: number;
    insights: Insight[];
    harvested_at: string;
}

export interface PDFUploadResponse {
    success: boolean;
    filename: string;
    insight_id: string;
    extracted_summary: string;
    disease_indicators: string[];
    severity_score: number;
    status: string;
    message: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Calls
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Trigger social media harvest (simulated demo)
 */
export async function harvestInsights(request?: HarvestRequest): Promise<HarvestResponse> {
    const response = await fetch(`${API_BASE_URL}/api/insights/harvest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: request ? JSON.stringify(request) : undefined,
    });

    if (!response.ok) throw new Error("Harvest failed");
    return response.json();
}

/**
 * Get all insights with optional filters
 */
export async function getInsights(filters?: {
    status?: string;
    county?: string;
    limit?: number;
}): Promise<{ count: number; insights: Insight[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.county) params.append("county", filters.county);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const url = `${API_BASE_URL}/api/insights${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch insights");
    return response.json();
}

/**
 * Get a specific insight by ID
 */
export async function getInsight(insightId: string): Promise<Insight> {
    const response = await fetch(`${API_BASE_URL}/api/insights/${insightId}`);
    if (!response.ok) throw new Error("Insight not found");
    return response.json();
}

/**
 * Upload a PDF health report
 */
export async function uploadPDFReport(
    file: File,
    operatorEmail: string,
    county: string,
    title?: string
): Promise<PDFUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams({
        operator_email: operatorEmail,
        county: county,
    });
    if (title) params.append("title", title);

    const response = await fetch(`${API_BASE_URL}/api/insights/upload?${params}`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Upload failed");
    }
    return response.json();
}

/**
 * Verify or reject an insight
 */
export async function verifyInsight(
    insightId: string,
    isVerified: boolean,
    operatorEmail: string,
    notes?: string
): Promise<{ success: boolean; new_status: string }> {
    const params = new URLSearchParams({
        is_verified: isVerified.toString(),
        operator_email: operatorEmail,
    });
    if (notes) params.append("notes", notes);

    const response = await fetch(`${API_BASE_URL}/api/insights/${insightId}/verify?${params}`, {
        method: "PATCH",
    });

    if (!response.ok) throw new Error("Verification failed");
    return response.json();
}

/**
 * Get featured counties list
 */
export async function getFeaturedCounties(): Promise<{ count: number; counties: Array<{ name: string; region: string }> }> {
    const response = await fetch(`${API_BASE_URL}/api/insights/counties/featured`);
    if (!response.ok) throw new Error("Failed to fetch counties");
    return response.json();
}
