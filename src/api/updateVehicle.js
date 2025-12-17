import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Updates a vehicle.
 * @param {number} vehicleId - The vehicle ID.
 * @param {Object} vehicleData - The updated vehicle data.
 * @returns {Promise<Object>} - The updated vehicle.
 */
export const updateVehicle = async (vehicleId, vehicleData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles/${vehicleId}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData)
        });

        if (!response.ok) {
            throw new Error(`Failed to update vehicle: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
};
