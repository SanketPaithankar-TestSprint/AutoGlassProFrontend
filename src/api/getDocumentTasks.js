import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Get all tasks for a specific service document
 * @param {number} documentId - Service document ID
 * @returns {Promise<Array>} - List of task assignments
 */
export const getDocumentTasks = async (documentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/tasks/document/${documentId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to get document tasks: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting document tasks:", error);
        throw error;
    }
};
