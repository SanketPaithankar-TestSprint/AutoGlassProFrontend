import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Records a payment for a service document.
 * @param {string} documentNumber - The document number (e.g., "INV-2025-12-00042").
 * @param {number} amountPaid - The amount paid.
 * @returns {Promise<Object>} - The updated service document.
 */
export const recordServiceDocumentPayment = async (documentNumber, amountPaid) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/payment?amountPaid=${amountPaid}`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to record payment: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error recording payment:", error);
        throw error;
    }
};
