import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets SMTP configuration by ID.
 * @param {number} configId - The SMTP configuration ID.
 * @returns {Promise<Object>} - The SMTP configuration details.
 */
export const getSmtpConfigById = async (configId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config/${configId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch SMTP config: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching SMTP config:", error);
        throw error;
    }
};
