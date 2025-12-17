import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Sends the service document via email.
 * @param {string} documentNumber - The document number (e.g., "QT-2025-12-00003").
 * @param {string} recipientEmail - The recipient email address.
 * @returns {Promise<Object>} - The email send response.
 */
export const sendServiceDocumentEmail = async (documentNumber, recipientEmail) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/service-documents/${documentNumber}/send-email?recipientEmail=${encodeURIComponent(recipientEmail)}`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to send email: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending service document email:", error);
        throw error;
    }
};
