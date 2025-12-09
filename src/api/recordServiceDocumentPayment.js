import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Records a payment for a service document.
 * @param {string|number} documentId - The ID of the document.
 * @param {number} amount - The amount to record.
 * @returns {Promise<Object>} - The updated service document.
 */
export const recordServiceDocumentPayment = async (documentId, amount) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}/payment?amount=${amount}`, {
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
