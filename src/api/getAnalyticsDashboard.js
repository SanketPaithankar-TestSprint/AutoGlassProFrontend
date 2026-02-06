import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Fetches the analytics dashboard data for the given user.
 * @param {string|number} userId - The ID of the user to fetch analytics for.
 * @param {string} [startDate] - Start date in YYYY-MM-DD format.
 * @param {string} [endDate] - End date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - The analytics data.
 * @property {Object} quote_analysis - Quote metrics.
 * @property {number} quote_analysis.quotes_created - Total quotes created.
 * @property {number} quote_analysis.invoices_count - Total invoices generated.
 * @property {number} quote_analysis.conversion_rate - Quote to invoice conversion rate.
 * @property {Object} service_location_breakdown - Jobs by location.
 * @property {number} service_location_breakdown.in_shop_count - In-shop job count.
 * @property {number} service_location_breakdown.mobile_count - Mobile job count.
 * @property {Object} adas_analytics - ADAS metrics.
 * @property {number} adas_analytics.adas_count - Total ADAS calibrations.
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
