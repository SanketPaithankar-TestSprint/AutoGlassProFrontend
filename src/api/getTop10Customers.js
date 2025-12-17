import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets 10 most recent customers for dashboard.
 * @returns {Promise<Array>} - List of 10 most recent customers.
 */
export const getTop10Customers = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/customers/top10`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch top 10 customers: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching top 10 customers:", error);
        throw error;
    }
};
