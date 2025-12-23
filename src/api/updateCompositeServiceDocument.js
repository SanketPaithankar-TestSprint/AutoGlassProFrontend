import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates an existing Full Service Document (Atomic Operation).
 * This updates Customer, Vehicle, Service Document, Quotes, and Attachments in one go.
 * 
 * @param {string} documentNumber - The document number to update (e.g., QT-2023-10-12345).
 * @param {Object} data - The JSON payload containing { customerWithVehicle, serviceDocument, insurance, attachmentDescription }.
 * @param {File} [file] - Optional file attachment.
 * @returns {Promise<Object>} - The updated ServiceDocumentResponse.
 */
export const updateCompositeServiceDocument = async (documentNumber, data, file) => {
    try {
        const token = await getValidToken();
        const formData = new FormData();

        // Append the JSON data as a Blob with application/json type
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append("data", jsonBlob);

        // Append files
        if (Array.isArray(file)) {
            file.forEach(f => {
                if (f) formData.append("file", f);
            });
        } else if (file) {
            formData.append("file", file);
        }

        // Additional fields required by backend for updates
        formData.append("descriptions", data.attachmentDescription || "");

        const response = await fetch(`${urls.javaApiUrl}/v1/composite/${documentNumber}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
                // Content-Type is set automatically by browser for FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update composite service document: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating composite service document:", error);
        throw error;
    }
};
