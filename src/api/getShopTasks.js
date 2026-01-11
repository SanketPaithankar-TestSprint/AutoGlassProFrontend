import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets all tasks for the shop/organization.
 * @returns {Promise<Array>} - List of all task assignments in the shop.
 */
export const getShopTasks = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch shop tasks: ${response.status}`);
        }

        const data = await response.json();
        const tasks = data.content || (Array.isArray(data) ? data : []);

        return tasks.map(task => ({
            ...task,
            id: task.assignmentId, // UI uses 'id'
            status: task.assignmentStatus, // UI uses 'status'
            taskName: task.taskDescription || 'Untitled Task', // UI uses 'taskName'
            description: task.notes || '' // UI uses 'description'
        }));
    } catch (error) {
        console.error("Error fetching shop tasks:", error);
        throw error;
    }
};
