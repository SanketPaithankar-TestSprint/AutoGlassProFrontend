import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a new vehicle.
 * @param {Object} vehicleData - The vehicle data (customerId, vehicleYear, vehicleMake, vehicleModel required).
 * @returns {Promise<Object>} - The created vehicle response.
 */
export const createVehicle = async (vehicleData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create vehicle: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating vehicle:", error);
        throw error;
    }
};
