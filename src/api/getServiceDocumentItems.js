import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Retrieves all items for a service document.
 * @param {string} documentNumber - The document number (e.g., "QT-2025-12-00003").
 * @returns {Promise<Array>} - The list of service items.
 */
export const getServiceDocumentItems = async (documentNumber) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/items`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch document items: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching document items:", error);
        throw error;
    }
};
