import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets task details by assignment ID.
 * @param {number} assignmentId - The task assignment ID.
 * @returns {Promise<Object>} - The task assignment details.
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
            throw new Error(`Failed to fetch task: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching task:", error);
        throw error;
    }
};
