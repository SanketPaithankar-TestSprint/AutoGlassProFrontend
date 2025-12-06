import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a new service document (Quote, Order, Invoice).
 * @param {Object} documentData - The service document payload.
 * @returns {Promise<Object>} - The created service document response.
 */
export const createServiceDocument = async (documentData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(documentData)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create service document: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating service document:", error);
        throw error;
    }
};
