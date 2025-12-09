import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Sends the service document via email.
 * @param {string|number} documentId - The ID of the document.
 * @param {string} email - The recipient email address.
 * @returns {Promise<string>} - The response message.
 */
export const sendServiceDocumentEmail = async (documentId, email) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentId}/send-email?email=${encodeURIComponent(email)}`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error("Error sending service document email:", error);
        throw error;
    }
};
