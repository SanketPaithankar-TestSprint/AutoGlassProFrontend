import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Downloads an attachment file as bytes from the backend
 * @param {number} attachmentId - The ID of the attachment to download
 * @returns {Promise<Blob>} - The file content as a Blob
 */
export const downloadAttachmentFile = async (attachmentId) => {
    try {
        const token = getValidToken();
        if (!token) {
            throw new Error("No valid authentication token found.");
        }

        const response = await fetch(`${urls.javaApiUrl}/attachments/${attachmentId}/download`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "accept": "*/*"
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to download attachment: ${response.status} ${response.statusText}`);
        }

        // Return the response as a Blob
        return await response.blob();
    } catch (error) {
        console.error("Error downloading attachment:", error);
        throw error;
    }
};

/**
 * Downloads an attachment and triggers browser download
 * @param {number} attachmentId - The ID of the attachment
 * @param {string} fileName - The original filename for the download
 */
export const downloadAndSaveAttachment = async (attachmentId, fileName) => {
    try {
        const blob = await downloadAttachmentFile(attachmentId);

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading and saving attachment:", error);
        throw error;
    }
};

/**
 * Gets a preview URL for an attachment
 * @param {number} attachmentId - The ID of the attachment
 * @returns {Promise<string>} - A temporary URL for previewing the file
 */
export const getAttachmentPreviewUrl = async (attachmentId) => {
    try {
        const blob = await downloadAttachmentFile(attachmentId);

        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);

        return url;
    } catch (error) {
        console.error("Error getting attachment preview URL:", error);
        throw error;
    }
};
