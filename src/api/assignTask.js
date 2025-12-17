import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Assign a task to an employee
 * @param {Object} taskData - Task assignment data
 * @returns {Promise<Object>} - The created task assignment
 */
export const assignTask = async (taskData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/assign`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to assign task: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error assigning task:", error);
        throw error;
    }
};
