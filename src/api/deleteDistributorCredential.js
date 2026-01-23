// src/api/deleteDistributorCredential.js
import urls from "../config";

/**
 * Delete a distributor credential by distributor name
 * @param {string} token - JWT authentication token
 * @param {string} distributorName - Name of the distributor credential to delete
 * @returns {Promise<void>}
 */
export async function deleteDistributorCredential(token, distributorName) {
    const url = `${urls.javaApiUrl}/v1/distributor-credentials/${encodeURIComponent(distributorName)}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        return;
    } catch (error) {
        console.error("Failed to delete distributor credential:", error);
        throw error;
    }
}
