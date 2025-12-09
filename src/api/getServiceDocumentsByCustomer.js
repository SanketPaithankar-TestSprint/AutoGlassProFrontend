import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Retrieves service documents for a specific customer.
 * @param {string|number} customerId - The ID of the customer.
 * @returns {Promise<Array>} - The list of documents.
 */
export const getServiceDocumentsByCustomer = async (customerId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/customer/${customerId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch documents by customer: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching documents by customer:", error);
        throw error;
    }
};
