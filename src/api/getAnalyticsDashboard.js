import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Fetches the analytics dashboard data for the given user.
 * @param {string|number} userId - The ID of the user to fetch analytics for.
 * @returns {Promise<Object>} - The analytics data.
 */
export const getAnalyticsDashboard = async (userId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.pythonApiUrl}agp/v1/analytics/dashboard?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch analytics: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching analytics dashboard:", error);
        throw error;
    }
};
