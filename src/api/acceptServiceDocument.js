import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Accepts a service document (changes status to accepted).
 * @param {string|number} documentId - The ID of the document.
 * @returns {Promise<Object>} - The updated service document.
 */
export const acceptServiceDocument = async (documentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}/accept`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to accept service document: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error accepting service document:", error);
        throw error;
    }
};
