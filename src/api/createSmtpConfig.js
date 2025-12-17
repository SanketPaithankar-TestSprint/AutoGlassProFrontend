import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a new SMTP configuration.
 * @param {Object} smtpData - SMTP configuration data (host, port, encryption, username, password, fromEmail required).
 * @returns {Promise<Object>} - The created SMTP configuration.
 */
export const createSmtpConfig = async (smtpData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(smtpData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create SMTP config: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating SMTP config:", error);
        throw error;
    }
};
