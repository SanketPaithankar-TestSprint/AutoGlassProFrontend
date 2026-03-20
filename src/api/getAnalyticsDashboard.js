import urls from "../config";
import { fetchWithAuth } from "./fetchWithAuth";

/**
 * Fetches the analytics dashboard data.
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
export const getAnalyticsDashboard = async (startDate, endDate) => {
    // Validation: Dates must be exactly 10 characters in YYYY-MM-DD format
    if (startDate && startDate.length !== 10) {
        throw new Error("Start date must be in YYYY-MM-DD format (10 characters)");
    }
    if (endDate && endDate.length !== 10) {
        throw new Error("End date must be in YYYY-MM-DD format (10 characters)");
    }

    try {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

        const response = await fetchWithAuth(`${urls.pythonApiUrl}agp/v1/analytics/dashboard?${queryParams.toString()}`, {
            method: 'GET'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch analytics: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching analytics dashboard:", error);
        throw error;
    }
};
