import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Marks a service document as completed.
 * @param {string} documentNumber - The document number (e.g., "WO-2025-12-00015").
 * @returns {Promise<Object>} - The completed service document.
 */
export const completeServiceDocument = async (documentNumber) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/complete`, {
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
