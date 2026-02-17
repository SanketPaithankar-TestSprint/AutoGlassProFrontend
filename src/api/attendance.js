import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Get attendance history for my employees (shop owner).
 * @param {number|null} shopId - Optional shop ID filter
 */
export async function getMyAttendance(shopId) {
    const token = getValidToken();
    if (!token) throw new Error("No token found. Please login.");
    let url = `${urls.javaApiUrl}/v1/attendance/my`;
    if (shopId) url += `?shopId=${shopId}`;
    const response = await fetch(url, {
        method: "GET",
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

/**
 * Get all attendance with filters.
 * @param {Object} filters - { month, year, employeeId, shopId }
 */
export async function getAllAttendance(filters = {}) {
    const token = getValidToken();
    if (!token) throw new Error("No token found. Please login.");
    const params = new URLSearchParams();
    if (filters.month) params.append("month", filters.month);
    if (filters.year) params.append("year", filters.year);
    if (filters.employeeId) params.append("employeeId", filters.employeeId);
    if (filters.shopId) params.append("shopId", filters.shopId);
    const qs = params.toString();
    const url = `${urls.javaApiUrl}/v1/attendance${qs ? `?${qs}` : ""}`;
    const response = await fetch(url, {
        method: "GET",
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

/**
 * Record attendance for a single employee.
 * @param {Object} payload - { employeeId, date, status, clockInTime?, clockOutTime?, notes? }
 */
export async function recordAttendance(payload) {
    const token = getValidToken();
    if (!token) throw new Error("No token found. Please login.");
    const url = `${urls.javaApiUrl}/v1/attendance/record`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}

/**
 * Bulk record attendance for all employees in a shop.
 * @param {number} shopId
 * @param {string} date - YYYY-MM-DD
 * @param {string} status - e.g. PRESENT, ABSENT
 */
export async function bulkRecordAttendance(shopId, date, status) {
    const token = getValidToken();
    if (!token) throw new Error("No token found. Please login.");
    const params = new URLSearchParams({ shopId, date, status });
    const url = `${urls.javaApiUrl}/v1/attendance/shop-owner/record-all?${params.toString()}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { accept: "*/*", Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
}
