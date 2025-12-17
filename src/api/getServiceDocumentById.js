import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Fetches a single service document by its document number.
 * @param {string} documentNumber - The document number (e.g., "QT-2025-12-00003").
 * @returns {Promise<Object>} - The service document.
 */
export const getServiceDocumentById = async (documentNumber) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}`, {
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
