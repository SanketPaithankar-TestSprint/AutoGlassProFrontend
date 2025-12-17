import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Sets the labor rate for the authenticated user.
 * @param {number} laborRate - The labor rate (per hour).
 * @returns {Promise<Object>} - Response with success status and new labor rate.
 */
export const setLaborRate = async (laborRate) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/users/set-labor-rate?laborRate=${laborRate}`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to set labor rate: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error setting labor rate:", error);
        throw error;
    }
};
