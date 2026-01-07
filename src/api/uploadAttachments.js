import { getValidToken } from "./getValidToken";
import urls from "../config";

/**
 * Upload attachments for a service document
 * @param {string} documentNumber - The document number to attach files to
 * @param {File[]} files - Array of files to upload
 * @param {string[]} descriptions - Array of descriptions for each file (optional)
 * @param {number} customerId - Customer ID (optional)
 * @param {number} userId - User ID (optional)
 * @returns {Promise<any>} - Response from the API
 */
export const uploadAttachments = async (documentNumber, files, descriptions = [], customerId = null, userId = null) => {
    try {
        const token = await getValidToken();
        debugger;

        if (!token) {
            throw new Error("Authentication token not found. Please log in.");
        }

        if (!documentNumber) {
            throw new Error("Document number is required");
        }

        if (!files || files.length === 0) {
            throw new Error("At least one file is required");
        }

        // Get userId from localStorage if not provided
        // const storedUserId = userId || localStorage.getItem('userId') || '1'; // Unused

        // Create FormData
        const formData = new FormData();

        // Append files
        files.forEach((file) => {
            formData.append('files', file);
        });

        // Append documentNumber
        formData.append('documentNumber', documentNumber);

        // Append descriptions
        if (descriptions && descriptions.length > 0) {
            descriptions.forEach((desc, index) => {
                formData.append('descriptions', desc || `Attachment ${index + 1}`);
            });
        } else {
            // Fallback if no descriptions provided
            files.forEach((_, index) => {
                formData.append('descriptions', `Attachment ${index + 1}`);
            });
        }

        console.log('[uploadAttachments] Uploading to:', `${urls.javaApiUrl}/attachments/upload`);
        console.log('[uploadAttachments] FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0] + ', ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        const response = await fetch(`${urls.javaApiUrl}/attachments/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
                // Content-Type header is set automatically by browser with boundary
            },
            body: formData
        });
        debugger;
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.message ||
                errorData?.error ||
                `Failed to upload attachments: ${response.status} ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error uploading attachments:", error);
        throw error;
    }
};
