import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Deletes (soft deletes) a service document.
 * @param {string|number} documentId - The ID of the document to delete.
 * @returns {Promise<void>}
 */
export const deleteServiceDocument = async (documentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete service document: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting service document:", error);
        throw error;
    }
};
