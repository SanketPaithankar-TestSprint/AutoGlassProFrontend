import { getValidToken } from "./getValidToken";

import urls from "../config";

const BASE_URL = `${urls.javaApiUrl}/v1`;

/**
 * Convert a Quote to Work Order
 * POST /api/v1/service-documents/{documentNumber}/convert-to-workorder
 * 
 * @param {string} documentNumber - Document number (e.g., QT-2025-12-00001)
 * @returns {Promise<Object>} Updated service document response
 */
export const convertToWorkOrder = async (documentNumber) => {
    const token = getValidToken();
    if (!token) {
        throw new Error("No authentication token found");
    }

    const response = await fetch(
        `${BASE_URL}/service-documents/${encodeURIComponent(documentNumber)}/convert-to-workorder`,
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
        throw new Error(errorData.message || `Failed to convert to work order: ${response.status}`);
    }

    return response.json();
};

export default convertToWorkOrder;
