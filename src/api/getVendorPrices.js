// src/api/getVendorPrices.js
import { fetchWithAuth } from "./fetchWithAuth";
import config from "../config";

/**
 * Fetch vendor prices for a specific part number
 * @param {string} partNumber - Part number (e.g., "FD28887 GTY")
 * @returns {Promise<Object>} Vendor prices object with pilkington array
 */
export async function getVendorPrices(partNumber) {
    const url = `${config.pythonApiUrl}agp/v1/vendor-prices?part_number=${encodeURIComponent(partNumber)}`;

    try {
        const response = await fetchWithAuth(url, {
            method: "GET"
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Error: ${response.status}`);
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
 * @param {string} partNumber - Part number (e.g., "FD28887 GTY")
 * @returns {Promise<Object|null>} First Pilkington price object or null
 */
export async function getPilkingtonPrice(partNumber) {
    try {
        const data = await getVendorPrices(partNumber);

        // Return the first Pilkington price if available
        if (data?.pilkington && Array.isArray(data.pilkington) && data.pilkington.length > 0) {
            return data.pilkington[0];
        }

        return null;
    } catch (error) {
        console.error("Failed to get Pilkington price:", error);
        // Re-throw if it's the specific credentials error so UI can handle it
        if (error.message && error.message.includes("No vendor credentials found")) {
            throw error;
        }
        return null;
    }
}
