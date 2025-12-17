import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Get all overdue tasks
 * @returns {Promise<Array>} - List of overdue task assignments
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
            const errorText = await response.text();
            throw new Error(`Failed to get overdue tasks: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting overdue tasks:", error);
        throw error;
    }
};
