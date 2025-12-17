import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets service document data for PDF generation.
 * @param {string} documentNumber - The document number (e.g., "INV-2025-12-00042").
 * @returns {Promise<Object>} - The service document data for PDF generation.
 */
export const exportServiceDocumentPdf = async (documentNumber) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/export/pdf`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error exporting PDF:", error);
        throw error;
    }
};
