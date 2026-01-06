import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a new user ADAS price.
 * @param {Object} data - The ADAS price data { calibrationCode, calibrationPrice }.
 * @returns {Promise<Object>} - The response.
 */
export const createUserAdasPrice = async (data) => {
    try {
        const token = getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/user-adas-prices`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create user ADAS price: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating user ADAS price:", error);
        throw error;
    }
};

/**
 * Fetches all user ADAS prices.
 * @returns {Promise<Array>} - The list of ADAS prices.
 */
export const getUserAdasPrices = async () => {
    try {
        const token = getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/user-adas-prices`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch user ADAS prices: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user ADAS prices:", error);
        throw error;
    }
};
