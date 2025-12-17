import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets pending tasks for an employee.
 * @param {number} employeeId - The employee ID.
 * @returns {Promise<Array>} - List of pending task assignments sorted by due date.
 */
export const getPendingTasks = async (employeeId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/employee/${employeeId}/pending`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch pending tasks: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching pending tasks:", error);
        throw error;
    }
};
