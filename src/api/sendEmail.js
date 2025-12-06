import config from "../config";

/**
 * Sends an email with an optional attachment.
 * 
 * @param {string} email - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @param {File} [file] - Optional file object to attach
 * @returns {Promise<any>} - Response from the server
 */
export const sendEmail = async (email, subject, body, file) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("subject", subject);
    formData.append("body", body);

    if (file) {
        formData.append("file", file);
    }

    try {
        const response = await fetch(`${config.pythonApiUrl}agp/v1/send-email`, {
            method: "POST",
            headers: {
                "accept": "application/json",
                // Content-Type is simpler to leave undefined when using FormData; 
                // the browser automatically sets it to multipart/form-data with the correct boundary
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Email send failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
