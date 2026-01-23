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
    try {
        // Get userId from localStorage, fallback to 1 if not found
        const userId = localStorage.getItem('userId') || '';

        // Build FormData with email content
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("email", email);
        formData.append("subject", subject);
        formData.append("body", body);

        // Add file if provided, otherwise send empty file parameter
        if (file) {
            formData.append("file", file);
        } else {
            formData.append("file", "");
        }

        console.log("[sendEmail] Sending email to:", email, "with subject:", subject);

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

        const result = await response.json();
        console.log("[sendEmail] Email sent successfully:", result);
        return result;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
