import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates the user's profile information.
 * @param {Object} data - The profile data to update.
 * @returns {Promise<Object>} - The updated profile.
 */
export const updateProfile = async (data) => {
    try {
        const token = getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/users/profile`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};
