import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates customer and vehicle in single atomic operation.
 * @param {Object} customerWithVehicleData - Combined customer and vehicle data.
 * @returns {Promise<Object>} - Response with customerId and vehicleId.
 */
export const createCustomerWithVehicle = async (customerWithVehicleData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/customers/create-with-vehicle`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerWithVehicleData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create customer with vehicle: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating customer with vehicle:", error);
        throw error;
    }
};
