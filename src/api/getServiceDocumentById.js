import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Retrieves a specific service document by ID.
 * @param {string|number} documentId - The ID of the document to retrieve.
 * @returns {Promise<Object>} - The service document details.
 */
export const getServiceDocumentById = async (documentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch service document: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching service document:", error);
        throw error;
    }
};
