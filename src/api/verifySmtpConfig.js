import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Marks SMTP configuration as verified.
 * @param {number} configId - The SMTP configuration ID.
 * @returns {Promise<Object>} - The verified SMTP configuration.
 */
export const verifySmtpConfig = async (configId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config/${configId}/verify`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to verify SMTP config: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error verifying SMTP config:", error);
        throw error;
    }
};
