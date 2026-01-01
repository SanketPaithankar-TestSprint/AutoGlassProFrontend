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
        const storedUserId = userId || localStorage.getItem('userId') || '1';
        const storedCustomerId = customerId || localStorage.getItem('customerId') || '1';

        // Create FormData for files
        const formData = new FormData();

        // Append files
        files.forEach((file) => {
            formData.append('files', file);
        });

        // Combine descriptions into a single string
        const combinedDescription = descriptions
            .map((desc, index) => desc || `File ${index + 1}`)
            .join(' & ');

        // Build query parameters
        const params = new URLSearchParams({
            documentNumber: documentNumber,
            customerId: storedCustomerId,
            userId: storedUserId,
            descriptions: combinedDescription || 'Attachment'
        });

        console.log('[uploadAttachments] Uploading to:', `${urls.javaApiUrl}api/attachments/upload?${params.toString()}`);
        console.log('[uploadAttachments] Files:', files.length, files.map(f => f.name));

        const response = await fetch(`${urls.javaApiUrl}api/attachments/upload?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
                // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
            },
            body: formData
        });

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
