import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets all vehicles.
 * @returns {Promise<Array>} - The list of all vehicles.
 */
export const getAllVehicles = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch vehicles: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
    }
};
