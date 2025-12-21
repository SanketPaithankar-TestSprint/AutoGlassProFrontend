import urls from "../config";
import { getValidToken } from "./getValidToken";

export const getAttachmentsByDocumentNumber = async (documentNumber) => {
    try {
        const token = getValidToken();
        if (!token) {
            throw new Error("No valid authentication token found.");
        }

        // Using path without /v1/ as per user provided CURL
        const response = await fetch(`${urls.javaApiUrl}/attachments/document/${documentNumber}`, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch attachments: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching attachments:", error);
        throw error;
    }
};
