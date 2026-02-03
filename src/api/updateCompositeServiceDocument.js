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
        console.log("[updateCompositeServiceDocument] Received files:", file);
        if (Array.isArray(file)) {
            console.log("[updateCompositeServiceDocument] Appending", file.length, "files to FormData");
            file.forEach((f, index) => {
                if (f) {
                    console.log(`  - File ${index + 1}:`, f.name, f.type, f.size, "bytes");
                    formData.append("files", f);
                }
            });
        } else if (file) {
            console.log("[updateCompositeServiceDocument] Appending single file:", file.name);
            formData.append("files", file);
        } else {
            console.log("[updateCompositeServiceDocument] No files to upload");
        }

        console.log("[updateCompositeServiceDocument] Calling API:", `${urls.javaApiUrl}/v1/composite/${documentNumber}`);
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
            let errorMessage = `Failed to update composite service document: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMessage = errorData.message;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } catch (e) {
                // Fallback to text if JSON parse fails
                const errorText = await response.text();
                if (errorText) errorMessage += ` ${errorText}`;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating composite service document:", error);
        throw error;
    }
};
