import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates the status of a service document.
 * @param {string} documentNumber - The document number.
 * @param {string} status - The new status.
 * @returns {Promise<Object>} - The updated service document.
 */
export const updateServiceDocumentStatus = async (documentNumber, status) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/status?status=${status}`, {
            method: 'PATCH',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to update service document status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating service document status:", error);
        throw error;
    }
};
