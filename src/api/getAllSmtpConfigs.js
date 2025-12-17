import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets all SMTP configurations for the authenticated user.
 * @returns {Promise<Array>} - List of SMTP configurations.
 */
export const getAllSmtpConfigs = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch SMTP configs: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching SMTP configs:", error);
        throw error;
    }
};
