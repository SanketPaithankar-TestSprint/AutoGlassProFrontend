import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Deletes a vehicle.
 * @param {number} vehicleId - The vehicle ID.
 * @returns {Promise<Object>} - The deletion response.
 */
export const deleteVehicle = async (vehicleId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles/${vehicleId}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete vehicle: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        throw error;
    }
};
