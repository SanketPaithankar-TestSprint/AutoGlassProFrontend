import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Marks a service document as completed.
 * @param {string|number} documentId - The ID of the document.
 * @returns {Promise<Object>} - The updated service document.
 */
export const completeServiceDocument = async (documentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}/complete`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to complete service document: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error completing service document:", error);
        throw error;
    }
};
