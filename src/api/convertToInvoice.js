import { getValidToken } from "./getValidToken";

import urls from "../config";

const BASE_URL = `${urls.javaApiUrl}/v1`;

/**
 * Convert a Work Order to Invoice
 * POST /api/v1/service-documents/{documentNumber}/convert-to-invoice
 * 
 * @param {string} documentNumber - Document number (e.g., WO-2025-12-00001)
 * @returns {Promise<Object>} Updated service document response
 */
export const convertToInvoice = async (documentNumber) => {
    const token = getValidToken();
    if (!token) {
        throw new Error("No authentication token found");
    }

    const response = await fetch(
        `${BASE_URL}/service-documents/${encodeURIComponent(documentNumber)}/convert-to-invoice`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to convert to invoice: ${response.status}`);
    }

    return response.json();
};

export default convertToInvoice;
