import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets all tasks for a service document.
 * @param {number} documentId - The service document ID.
 * @returns {Promise<Array>} - List of task assignments for the document.
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
            throw new Error(`Failed to fetch document tasks: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching document tasks:", error);
        throw error;
    }
};
