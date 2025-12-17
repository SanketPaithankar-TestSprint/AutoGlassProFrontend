import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Adds an item to a service document.
 * @param {string} documentNumber - The document number (e.g., "QT-2025-12-00003").
 * @param {Object} itemData - The item data (must include laborRate field).
 * @returns {Promise<Object>} - The added item.
 */
export const addServiceDocumentItem = async (documentNumber, itemData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/items`, {
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
