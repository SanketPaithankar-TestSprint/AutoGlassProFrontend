import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Deletes a task assignment.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete task: ${response.status} ${errorText}`);
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};
