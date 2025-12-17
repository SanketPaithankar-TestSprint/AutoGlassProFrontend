import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Get task by ID
 * @param {number} assignmentId - Task assignment ID
 * @returns {Promise<Object>} - Task assignment details
 */
export const getTaskById = async (assignmentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/${assignmentId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get task: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting task:", error);
        throw error;
    }
};
