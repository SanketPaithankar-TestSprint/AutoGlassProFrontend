import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates task status.
 * @param {number} assignmentId - The task assignment ID.
 * @param {string} status - New status (PENDING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED).
 * @returns {Promise<Object>} - The updated task assignment.
 */
export const updateTaskStatus = async (assignmentId, status) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/${assignmentId}/status?status=${status}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to update task status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating task status:", error);
        throw error;
    }
};
