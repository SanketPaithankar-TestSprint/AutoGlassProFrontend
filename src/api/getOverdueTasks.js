import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets all overdue tasks across all employees.
 * @returns {Promise<Array>} - List of overdue task assignments.
 */
export const getOverdueTasks = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/overdue`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch overdue tasks: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching overdue tasks:", error);
        throw error;
    }
};
