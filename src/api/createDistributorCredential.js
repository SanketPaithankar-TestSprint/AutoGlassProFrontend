// src/api/createDistributorCredential.js
import urls from "../config";

/**
 * Create a new distributor credential
 * @param {string} token - JWT authentication token
 * @param {Object} credentialData - Credential data
 * @param {string} credentialData.distributorName - Name of the distributor
 * @param {string} credentialData.username - Username for the distributor
 * @param {string} credentialData.password - Password for the distributor
 * @returns {Promise<Object>} Created credential response
 */
export async function createDistributorCredential(token, credentialData) {
    const url = `${urls.javaApiUrl}/v1/distributor-credentials`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(credentialData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to create distributor credential:", error);
        throw error;
    }
}
