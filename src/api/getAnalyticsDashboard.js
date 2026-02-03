import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Fetches the analytics dashboard data for the given user.
 * @param {string|number} userId - The ID of the user to fetch analytics for.
 * @param {string} [startDate] - Start date in YYYY-MM-DD format.
 * @param {string} [endDate] - End date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - The analytics data.
 */
export const getAnalyticsDashboard = async (userId, startDate, endDate) => {
    try {
        const token = await getValidToken();
        const queryParams = new URLSearchParams({ user_id: userId });
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

        const response = await fetch(`${urls.pythonApiUrl}agp/v1/analytics/dashboard?${queryParams.toString()}`, {
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
