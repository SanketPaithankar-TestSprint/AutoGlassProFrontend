import config from "../config";
import { getActiveSmtpConfig } from "./getActiveSmtpConfig";

/**
 * Sends an email with an optional attachment using SMTP configuration.
 * 
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @param {File} [file] - Optional file object to attach
 * @returns {Promise<any>} - Response from the server
 */
export const sendEmail = async (email, subject, body, file) => {
    try {
        // Get active SMTP configuration
        const smtpConfig = await getActiveSmtpConfig();

        if (!smtpConfig) {
            throw new Error("No active SMTP configuration found. Please configure SMTP in your profile settings.");
        }

        // Build FormData with email content and SMTP credentials
        const formData = new FormData();
        formData.append("email", email);
        formData.append("subject", subject);
        formData.append("body", body);

        // Add SMTP configuration parameters
        formData.append("smtp_host", smtpConfig.host);
        formData.append("smtp_port", smtpConfig.port.toString());
        formData.append("smtp_username", smtpConfig.username);
        formData.append("smtp_password", smtpConfig.password);
        formData.append("from_email", smtpConfig.fromEmail);

        if (file) {
            formData.append("file", file);
        }

        // Use external API endpoint
        const response = await fetch("https://api.autopaneai.com/agp/v1/send-email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                // Content-Type is automatically set by browser for FormData
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Email send failed: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
