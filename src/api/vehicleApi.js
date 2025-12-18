/**
 * Organization Vehicle API Functions
 * APIs for managing fleet vehicles belonging to organizations
 */
import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Create a vehicle for an organization (fleet vehicle)
 * @param {Object} vehicleData - Vehicle data
 * @param {number} vehicleData.organizationId - Organization ID (required for fleet vehicles)
 * @param {number} vehicleData.vehicleYear - Vehicle year (required)
 * @param {string} vehicleData.vehicleMake - Vehicle make (required)
 * @param {string} vehicleData.vehicleModel - Vehicle model (required)
 * @param {string} [vehicleData.vehicleStyle] - Vehicle style/body type (optional)
 * @param {string} [vehicleData.licensePlateNumber] - License plate (optional)
 * @param {string} [vehicleData.vin] - VIN (optional)
 * @param {string} [vehicleData.notes] - Notes (optional)
 * @returns {Promise<Object>} - Created vehicle
 */
export const createOrganizationVehicle = async (vehicleData) => {
    try {
        const token = await getValidToken();

        // Ensure organizationId is set and customerId is null/removed
        const payload = {
            ...vehicleData,
            customerId: null // Organization vehicles don't belong to individual customers
        };

        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create organization vehicle: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating organization vehicle:", error);
        throw error;
    }
};

/**
 * Create a vehicle for an individual customer
 * @param {Object} vehicleData - Vehicle data
 * @param {number} vehicleData.customerId - Customer ID (required)
 * @param {number} vehicleData.vehicleYear - Vehicle year (required)
 * @param {string} vehicleData.vehicleMake - Vehicle make (required)
 * @param {string} vehicleData.vehicleModel - Vehicle model (required)
 * @param {string} [vehicleData.vehicleStyle] - Vehicle style/body type (optional)
 * @param {string} [vehicleData.licensePlateNumber] - License plate (optional)
 * @param {string} [vehicleData.vin] - VIN (optional)
 * @param {string} [vehicleData.notes] - Notes (optional)
 * @returns {Promise<Object>} - Created vehicle
 */
export const createCustomerVehicle = async (vehicleData) => {
    try {
        const token = await getValidToken();

        // Ensure customerId is set and organizationId is null/removed
        const payload = {
            ...vehicleData,
            organizationId: null // Customer vehicles don't belong to organizations
        };

        const response = await fetch(`${urls.javaApiUrl}/v1/vehicles`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create customer vehicle: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating customer vehicle:", error);
        throw error;
    }
};

/**
 * Get all vehicles
 * @returns {Promise<Array>} - List of all vehicles
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

/**
 * Get vehicle by ID
 * @param {number} vehicleId - Vehicle ID
 * @returns {Promise<Object>} - Vehicle details
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

/**
 * Update a vehicle
 * @param {number} vehicleId - Vehicle ID
 * @param {Object} vehicleData - Updated vehicle data
 * @returns {Promise<Object>} - Updated vehicle
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
            const errorText = await response.text();
            throw new Error(`Failed to update vehicle: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
};

/**
 * Delete a vehicle
 * @param {number} vehicleId - Vehicle ID
 * @returns {Promise<Object>} - Delete response
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
