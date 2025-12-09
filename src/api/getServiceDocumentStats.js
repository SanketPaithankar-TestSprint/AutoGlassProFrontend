import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Retrieves summary statistics of all service documents.
 * @returns {Promise<Object>} - The statistics object.
 */
export const getServiceDocumentStats = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/summary/stats`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        // The API returns a string, but the content type might be JSON or plain text.
        // Based on the swagger definition response schema is string, but let's try to parse if possible or return text.
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    } catch (error) {
        console.error("Error fetching stats:", error);
        throw error;
    }
};
