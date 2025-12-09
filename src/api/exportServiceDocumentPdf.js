import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Exports a service document as PDF.
 * @param {string|number} documentId - The ID of the document.
 * @returns {Promise<Blob>} - The PDF blob.
 */
export const exportServiceDocumentPdf = async (documentId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}/export/pdf`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error("Error exporting PDF:", error);
        throw error;
    }
};
