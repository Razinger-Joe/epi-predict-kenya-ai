/**
 * Health Operators API Service
 * Handles all operator-related API calls
 */

import { API_BASE_URL } from "./api";

export interface HealthOperator {
    id: string;
    user_id?: string;
    full_name: string;
    email: string;
    phone: string;
    organization: string;
    license_number: string;
    county: string;
    role: "doctor" | "nurse" | "pharmacist" | "lab_technician" | "health_officer";
    is_verified: boolean;
    verified_at?: string;
    created_at: string;
}

export interface OperatorRegistration {
    full_name: string;
    email: string;
    phone: string;
    organization: string;
    license_number: string;
    county: string;
    role: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// API Calls
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all health operators with optional status filter
 */
export async function getOperators(status?: "pending" | "verified"): Promise<HealthOperator[]> {
    const url = status
        ? `${API_BASE_URL}/api/operators?status=${status}`
        : `${API_BASE_URL}/api/operators`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch operators");
    return response.json();
}

/**
 * Get pending operators awaiting approval
 */
export async function getPendingOperators(): Promise<HealthOperator[]> {
    return getOperators("pending");
}

/**
 * Get verified operators
 */
export async function getVerifiedOperators(): Promise<HealthOperator[]> {
    return getOperators("verified");
}

/**
 * Register a new health operator
 */
export async function registerOperator(data: OperatorRegistration): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/operators/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Registration failed");
    }
    return response.json();
}

/**
 * Approve a pending operator (admin only)
 */
export async function approveOperator(
    operatorId: string,
    adminEmail: string
): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
        `${API_BASE_URL}/api/operators/${operatorId}/approve?admin_email=${encodeURIComponent(adminEmail)}`,
        { method: "POST" }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Approval failed");
    }
    return response.json();
}

/**
 * Reject a pending operator (admin only)
 */
export async function rejectOperator(
    operatorId: string,
    adminEmail: string,
    reason?: string
): Promise<{ success: boolean; message: string }> {
    const params = new URLSearchParams({ admin_email: adminEmail });
    if (reason) params.append("reason", reason);

    const response = await fetch(
        `${API_BASE_URL}/api/operators/${operatorId}/reject?${params}`,
        { method: "POST" }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Rejection failed");
    }
    return response.json();
}

/**
 * Check if email is admin
 */
export async function checkAdminStatus(email: string): Promise<{ is_admin: boolean }> {
    const response = await fetch(`${API_BASE_URL}/api/operators/check-admin/${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error("Failed to check admin status");
    return response.json();
}
