import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Get tasks for a specific employee, optionally filtered by status
 * @param {number} employeeId - Employee ID
 * @param {string} status - Optional status filter (PENDING, IN_PROGRESS, etc.)
 * @returns {Promise<Array>} - List of task assignments
 */
export const getEmployeeTasks = async (employeeId, status = null) => {
    try {
        const token = await getValidToken();
        const url = status
            ? `${urls.javaApiUrl}/v1/tasks/employee/${employeeId}?status=${status}`
            : `${urls.javaApiUrl}/v1/tasks/employee/${employeeId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get employee tasks: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting employee tasks:", error);
        throw error;
    }
};
