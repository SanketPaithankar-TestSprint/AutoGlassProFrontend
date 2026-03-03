import urls from "../config";
import { getValidToken } from "./getValidToken";


export const testSmtpConnection = async (configId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/smtp-config/${configId}/test`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to test SMTP connection: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error testing SMTP connection:", error);
        throw error;
    }
};
