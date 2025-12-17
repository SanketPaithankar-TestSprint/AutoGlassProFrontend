import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Accepts (approves) a service document.
 * @param {string} documentNumber - The document number (e.g., "QT-2025-12-00003").
 * @returns {Promise<Object>} - The accepted service document.
 */
export const acceptServiceDocument = async (documentNumber) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/accept`, {
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
