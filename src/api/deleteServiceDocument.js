import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Deletes (cancels) a service document.
 * @param {string} documentNumber - The document number (e.g., "QT-2025-12-00003").
 * @param {boolean} hardDelete - If true, permanently deletes from database. Defaults to false.
 * @returns {Promise<Object>} - The deletion response.
 */
export const deleteServiceDocument = async (documentNumber, hardDelete = false) => {
    try {
        const token = await getValidToken();
        const url = hardDelete
            ? `${urls.javaApiUrl}/v1/service-documents/${documentNumber}/hard`
            : `${urls.javaApiUrl}/v1/service-documents/${documentNumber}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete service document: ${response.status}`);
        }
    } catch (error) {
        console.error("Error deleting service document:", error);
        throw error;
    }
};
