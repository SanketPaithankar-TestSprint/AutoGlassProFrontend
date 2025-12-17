import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Gets a vehicle by ID.
 * @param {number} vehicleId - The vehicle ID.
 * @returns {Promise<Object>} - The vehicle details.
 */
export const getVehicleById = async (vehicleId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles/${vehicleId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch vehicle: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        throw error;
    }
};
