// src/api/getDistributorCredentials.js
import urls from "../config";

/**
 * Fetch all distributor credentials for the authenticated user
 * @param {string} token - JWT authentication token
 * @returns {Promise<Array>} Array of distributor credentials
 */
export async function getDistributorCredentials(token) {
    const url = `${urls.javaApiUrl}/v1/distributor-credentials`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const credentials = await response.json();
        return Array.isArray(credentials) ? credentials : [];
    } catch (error) {
        console.error("Failed to fetch distributor credentials:", error);
        throw error;
    }
}
