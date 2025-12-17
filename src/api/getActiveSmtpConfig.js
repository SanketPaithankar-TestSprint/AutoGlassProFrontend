import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets the currently active SMTP configuration.
 * @returns {Promise<Object>} - The active SMTP configuration.
 */
export const getActiveSmtpConfig = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config/active`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch active SMTP config: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching active SMTP config:", error);
        throw error;
    }
};
