import { fetchWithAuth } from "./fetchWithAuth";

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
    // Validation
    if (!email || email.length < 5 || email.length > 255) {
        throw new Error("Email must be between 5 and 255 characters");
    }
    if (!subject || subject.length < 1 || subject.length > 255) {
        throw new Error("Subject must be between 1 and 255 characters");
    }
    if (!body || body.length < 1) {
        throw new Error("Body cannot be empty");
    }

    try {
        // Build FormData with email content - userId is now extracted from JWT on backend
        const formData = new FormData();
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

        // Use external API endpoint with auth wrapper
        const response = await fetchWithAuth("https://api.autopaneai.com/agp/v1/send-email", {
            method: "POST",
            body: formData,
            // Header Content-Type is handled automatically by browser for FormData
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
