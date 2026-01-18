import { getValidToken } from "./getValidToken";
import urls from "../config";

/**
 * Uploads the user shop logo.
 * @param {File} file - The logo file to upload.
 * @returns {Promise<any>} - The API response.
 */
export const saveUserLogo = async (file) => {
    try {
        const token = await getValidToken();

        if (!token) {
            throw new Error("Authentication token not found. Please log in.");
        }

        if (!file) {
            throw new Error("No file provided.");
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${urls.javaApiUrl}/v1/users/logo`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "accept": "*/*",
                // Content-Type is inferred as multipart/form-data
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                errorData?.message ||
                `Failed to upload logo: ${response.status} ${response.statusText}`
            );
        }

        // Convert the uploaded file to base64 and store in localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                localStorage.setItem('userLogo', reader.result);
                // Dispatch custom event to notify Sidebar and other components
                window.dispatchEvent(new Event('userLogoUpdated'));
            }
        };
        reader.readAsDataURL(file);

        return await response.json();
    } catch (error) {
        console.error("Error uploading logo:", error);
        throw error;
    }
};
