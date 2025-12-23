import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Uploads attachments for a specific service document.
 * 
 * @param {File[]} files - The array of file objects to upload.
 * @param {string[]} descriptions - The array of descriptions corresponding to each file.
 * @param {Object} documentData - Object containing metadata.
 * @param {string} documentData.documentNumber - The service document number.
 * @param {string|number} documentData.customerId - The customer ID.
 * @param {string|number} documentData.userId - The user ID.
 * @returns {Promise<Object>} - The server response.
 */
export const uploadAttachments = async (files, descriptions, { documentNumber, customerId, userId }) => {
    try {
        const token = await getValidToken();
        const formData = new FormData();

        // Append files to body
        if (Array.isArray(files)) {
            files.forEach((file) => {
                formData.append('files', file);
            });
        }

        // Construct Query Parameters
        const params = new URLSearchParams();
        if (customerId) params.append('customerId', customerId);
        if (userId) params.append('userId', userId);
        if (documentNumber) params.append('documentNumber', documentNumber);

        // Append descriptions as repeated query params
        if (Array.isArray(descriptions)) {
            descriptions.forEach((desc) => {
                params.append('descriptions', desc || "");
            });
        }

        // Config: https://javaapi.autopaneai.com/api
        // Target: https://javaapi.autopaneai.com/api/attachments/upload
        const uploadUrl = `${urls.javaApiUrl}/attachments/upload`;

        // RE-READING PROMPT: "Use the following curl command structure ... Endpoint: https://javaapi.autopaneai.com/api/attachments/upload"
        // I will prioritize using the `urls` config but adapting the path.

        const response = await fetch(`${uploadUrl}?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error("Error uploading attachments:", error);
        throw error;
    }
};
