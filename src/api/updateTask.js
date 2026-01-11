import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates an existing task assignment.
 * @param {string} taskId - The ID of the task to update.
 * @param {Object} taskData - The updated task data.
 * @returns {Promise<Object>} - The updated task assignment.
 */
export const updateTask = async (taskId, taskData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update task: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};
