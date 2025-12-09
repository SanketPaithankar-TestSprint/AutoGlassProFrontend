import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates an existing service document.
 * @param {string|number} documentId - The ID of the document to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Object>} - The updated service document.
 */
export const updateServiceDocument = async (documentId, updateData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update service document: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating service document:", error);
        throw error;
    }
};
