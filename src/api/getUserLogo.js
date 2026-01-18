import { getValidToken } from "./getValidToken";
import urls from "../config";

/**
 * Fetches the user shop logo.
 * @returns {Promise<string>} - The logo as a blob URL or base64 string.
 */
export const getUserLogo = async () => {
    try {
        const token = await getValidToken();

        console.log('getUserLogo: Token available:', !!token);

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

        console.log('getUserLogo: API response status:', response.status);

        if (!response.ok) {
            if (response.status === 404) {
                console.log('getUserLogo: No logo found (404)');
                return null; // No logo found
            }
            throw new Error(`Failed to fetch logo: ${response.status}`);
        }

        // Check content type
        const contentType = response.headers.get("content-type");
        console.log('getUserLogo: Content-Type:', contentType);

        if (contentType && contentType.includes("application/json")) {
            // If backend returns JSON with a URL or Base64
            const data = await response.json();
            console.log('getUserLogo: JSON response received');
            return data.logoUrl || data.url || data;
        } else {
            // Assume it's an image blob
            const blob = await response.blob();
            console.log('getUserLogo: Blob size:', blob.size);
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
