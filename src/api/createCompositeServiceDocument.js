import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a Full Service Document (Atomic Operation).
 * This creates Customer, Vehicle, Service Document, Quotes, and Attachments in one go.
 * 
 * @param {Object} data - The JSON payload containing { customerWithVehicle, serviceDocument, insurance, attachmentDescription }.
 * @param {File} [file] - Optional file attachment.
 * @returns {Promise<Object>} - The created ServiceDocumentResponse.
 */
export const createCompositeServiceDocument = async (data, file) => {
    try {
        const token = await getValidToken();
        const formData = new FormData();

        // Append the JSON data as a Blob with application/json type
        // This is crucial for Spring Boot @RequestPart("data") to parse it correctly as JSON
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append("data", jsonBlob);

        // Append file if it exists
        if (file) {
            formData.append("file", file);
        }

        const response = await fetch(`${urls.javaApiUrl}/v1/composite/service-document`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
                // Note: Content-Type header is NOT set here. 
                // The browser sets it automatically to multipart/form-data with the boundary.
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create composite service document: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating composite service document:", error);
        throw error;
    }
};
