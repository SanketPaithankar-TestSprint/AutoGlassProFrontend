import { getValidToken } from "./getValidToken";
import urls from "../config";

/**
 * Fetches the user shop logo.
 * @returns {Promise<string>} - The logo as a blob URL or base64 string.
 */
export const getUserLogo = async () => {
    try {
        const token = await getValidToken();

        if (!token) {
            throw new Error("Authentication token not found.");
        }

        const response = await fetch(`${urls.javaApiUrl}/v1/users/logo`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "accept": "*/*",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // No logo found
            }
            throw new Error(`Failed to fetch logo: ${response.status}`);
        }

        // Check content type
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            // If backend returns JSON with a URL or Base64
            const data = await response.json();
            return data.logoUrl || data.url || data;
        } else {
            // Assume it's an image blob
            const blob = await response.blob();
            if (blob.size === 0) return null;
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    } catch (error) {
        console.error("Error fetching user logo:", error);
        return null;
    }
};
