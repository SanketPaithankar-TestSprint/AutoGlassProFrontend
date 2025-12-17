import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Deletes an SMTP configuration.
 * @param {number} configId - The SMTP configuration ID.
 * @returns {Promise<Object>} - The deletion response.
 */
export const deleteSmtpConfig = async (configId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config/${configId}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete SMTP config: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting SMTP config:", error);
        throw error;
    }
};
