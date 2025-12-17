import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets customer with all associated vehicles.
 * @param {number} customerId - The customer ID.
 * @returns {Promise<Object>} - Customer details with vehicles array.
 */
export const getCustomerWithVehicles = async (customerId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/customers/${customerId}/with-vehicles`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch customer with vehicles: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching customer with vehicles:", error);
        throw error;
    }
};
