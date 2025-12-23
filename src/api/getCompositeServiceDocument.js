import config from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Fetches the composite details of a service document (including customer, vehicle, items, attachments).
 * GET /api/service-documents/composite/{documentNumber}
 * 
 * @param {string} documentNumber - The unique document number (e.g. DOC-2024-001)
 * @returns {Promise<Object>} - The full composite document object
 */
export const getCompositeServiceDocument = async (documentNumber) => {
    try {
        const token = getValidToken();
        if (!token) throw new Error("No validation token found");

        const response = await fetch(`${config.javaApiUrl}/v1/composite/${documentNumber}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch composite document: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error in getCompositeServiceDocument:", error);
        throw error;
    }
};
