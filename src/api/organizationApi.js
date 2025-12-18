/**
 * Organization API Functions
 * APIs for managing organizations/companies with fleet vehicles
 */
import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Get all organizations for the authenticated user
 * @returns {Promise<Array>} - List of organizations
 */
export const getOrganizations = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch organizations: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching organizations:", error);
        throw error;
    }
};

/**
 * Get user's organizations (organizations belonging to authenticated user)
 * @returns {Promise<Array>} - List of user's organizations
 */
export const getMyOrganizations = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/my`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch my organizations: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching my organizations:", error);
        throw error;
    }
};

/**
 * Get top 10 most recent organizations
 * @returns {Promise<Array>} - List of recent organizations
 */
export const getTop10Organizations = async () => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/top10`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch top organizations: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching top organizations:", error);
        throw error;
    }
};

/**
 * Get organization by ID
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Object>} - Organization details
 */
export const getOrganizationById = async (organizationId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/${organizationId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch organization: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching organization:", error);
        throw error;
    }
};

/**
 * Get organization with full details (contacts and vehicles)
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Object>} - Organization with contacts and vehicles
 */
export const getOrganizationWithDetails = async (organizationId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/${organizationId}/details`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch organization details: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching organization details:", error);
        throw error;
    }
};

/**
 * Get organization's vehicles (fleet)
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Array>} - List of organization's vehicles
 */
export const getOrganizationVehicles = async (organizationId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/${organizationId}/vehicles`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch organization vehicles: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching organization vehicles:", error);
        throw error;
    }
};

/**
 * Create a new organization
 * @param {Object} organizationData - Organization data
 * @param {string} organizationData.companyName - Company name (required)
 * @param {string} organizationData.phone - Phone number (required)
 * @param {string} organizationData.addressLine1 - Address line 1 (required)
 * @param {string} organizationData.city - City (required)
 * @param {string} organizationData.state - State (required)
 * @param {string} organizationData.postalCode - Postal code (required)
 * @param {string} organizationData.country - Country (required)
 * @param {string} [organizationData.taxId] - Tax ID (optional)
 * @param {string} [organizationData.email] - Email (optional)
 * @param {string} [organizationData.alternatePhone] - Alternate phone (optional)
 * @param {string} [organizationData.addressLine2] - Address line 2 (optional)
 * @param {string} [organizationData.notes] - Notes (optional)
 * @returns {Promise<Object>} - Created organization
 */
export const createOrganization = async (organizationData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(organizationData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create organization: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating organization:", error);
        throw error;
    }
};

/**
 * Update an existing organization
 * @param {number} organizationId - Organization ID
 * @param {Object} organizationData - Updated organization data
 * @returns {Promise<Object>} - Updated organization
 */
export const updateOrganization = async (organizationId, organizationData) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/${organizationId}`, {
            method: 'PUT',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(organizationData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update organization: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
    }
};

/**
 * Delete an organization
 * @param {number} organizationId - Organization ID
 * @returns {Promise<Object>} - Delete response
 */
export const deleteOrganization = async (organizationId) => {
    try {
        const token = await getValidToken();
        const response = await fetch(`${urls.javaApiUrl}/v1/organizations/${organizationId}`, {
            method: 'DELETE',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete organization: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting organization:", error);
        throw error;
    }
};
