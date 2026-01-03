import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a new user kit price.
 * @param {Object} data - The kit price data { kitCode, kitPrice }.
 * @returns {Promise<Object>} - The response.
 */
export const createUserKitPrice = async (data) => {
    try {
        const token = getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/user-kit-prices`, {
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
            throw new Error(`Failed to create user kit price: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating user kit price:", error);
        throw error;
    }
};

/**
 * Fetches all user kit prices.
 * @returns {Promise<Array>} - The list of kit prices.
 */
export const getUserKitPrices = async () => {
    try {
        const token = getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/user-kit-prices`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch user kit prices: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user kit prices:", error);
        throw error;
    }
};
