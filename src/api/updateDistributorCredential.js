// src/api/updateDistributorCredential.js
import urls from "../config";

/**
 * Update an existing distributor credential
 * @param {string} token - JWT authentication token
 * @param {number|string} credentialId - ID of the credential to update
 * @param {Object} credentialData - Updated credential data
 * @param {string} credentialData.distributorName - Name of the distributor
 * @param {string} credentialData.username - Username for the distributor
 * @param {string} [credentialData.password] - Password (optional, only if changing)
 * @returns {Promise<Object>} Updated credential response
 */
export async function updateDistributorCredential(token, credentialId, credentialData) {
    const url = `${urls.javaApiUrl}/v1/distributor-credentials/${credentialId}`;
    try {
        const response = await fetch(url, {
            method: "PUT",
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
        console.error("Failed to update distributor credential:", error);
        throw error;
    }
}
