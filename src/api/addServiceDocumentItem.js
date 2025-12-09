import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Adds an item to a service document.
 * @param {string|number} documentId - The ID of the document.
 * @param {Object} itemData - The item data to add.
 * @returns {Promise<Object>} - The added item.
 */
export const addServiceDocumentItem = async (documentId, itemData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}/items`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            throw new Error(`Failed to add item: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error adding document item:", error);
        throw error;
    }
};
