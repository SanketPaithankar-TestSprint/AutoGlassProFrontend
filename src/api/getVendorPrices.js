// src/api/getVendorPrices.js
import config from "../config";

/**
 * Fetch vendor prices for a specific part number
 * @param {number|string} userId - User ID
 * @param {string} partNumber - Part number (e.g., "FD28887 GTY")
 * @returns {Promise<Object>} Vendor prices object with pilkington array
 */
export async function getVendorPrices(userId, partNumber) {
    const url = `${config.pythonApiUrl}agp/v1/vendor-prices?user_id=${userId}&part_number=${encodeURIComponent(partNumber)}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch vendor prices:", error);
        throw error;
    }
}

/**
 * Get Pilkington price for a specific part number
 * @param {number|string} userId - User ID
 * @param {string} partNumber - Part number (e.g., "FD28887 GTY")
 * @returns {Promise<Object|null>} First Pilkington price object or null
 */
export async function getPilkingtonPrice(userId, partNumber) {
    try {
        const data = await getVendorPrices(userId, partNumber);

        // Return the first Pilkington price if available
        if (data?.pilkington && Array.isArray(data.pilkington) && data.pilkington.length > 0) {
            return data.pilkington[0];
        }

        return null;
    } catch (error) {
        console.error("Failed to get Pilkington price:", error);
        return null;
    }
}
