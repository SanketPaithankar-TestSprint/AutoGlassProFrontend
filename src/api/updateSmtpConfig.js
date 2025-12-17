import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates an existing SMTP configuration.
 * @param {number} configId - The SMTP configuration ID.
 * @param {Object} smtpData - Updated SMTP configuration data.
 * @returns {Promise<Object>} - The updated SMTP configuration.
 */
export const updateSmtpConfig = async (configId, smtpData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config/${configId}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(smtpData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update SMTP config: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating SMTP config:", error);
        throw error;
    }
};
