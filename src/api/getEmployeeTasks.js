import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets all tasks for an employee, optionally filtered by status.
 * @param {number} employeeId - The employee ID.
 * @param {string} [status] - Optional status filter (PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED).
 * @returns {Promise<Array>} - List of task assignments.
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
            throw new Error(`Failed to fetch employee tasks: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching employee tasks:", error);
        throw error;
    }
};
