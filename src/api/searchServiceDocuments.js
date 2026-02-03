// src/api/searchServiceDocuments.js
import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Search service documents using the backend search API.
 * This is used when local filtering doesn't yield sufficient results.
 * 
 * @param {string} query - Search query string
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Number of results per page
 * @returns {Promise<Object>} - Paginated search results
 */
export async function searchServiceDocuments(query, page = 0, size = 20) {
    const token = getValidToken();
    if (!token) {
        throw new Error("No valid authentication token");
    }

    const url = `${urls.javaApiUrl}/v1/service-documents/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`;

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

        return await response.json();
    } catch (error) {
        console.error("Failed to search service documents:", error);
        throw error;
    }
}
