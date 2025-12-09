import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Retrieves service documents by status.
 * @param {string} status - The status to filter by (pending, completed, paid).
 * @returns {Promise<Array>} - The list of documents.
 */
export const getServiceDocumentsByStatus = async (status) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/status/${status}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch documents by status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching documents by status:", error);
        throw error;
    }
};
