import { getValidToken } from "./getValidToken";

const BASE_URL = "https://javaapi.autopaneai.com/api/v1";

/**
 * Get all tax rates for the authenticated user
 * GET /api/v1/tax-rates
 */
export const getTaxRates = async () => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch tax rates: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
};

/**
 * Get active tax rates only
 * GET /api/v1/tax-rates/active
 */
export const getActiveTaxRates = async () => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates/active`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch active tax rates: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result || [];
};

/**
 * Get default tax rate
 * GET /api/v1/tax-rates/default
 */
export const getDefaultTaxRate = async () => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates/default`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        if (response.status === 404) return null; // No default set
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch default tax rate: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
};

/**
 * Create a new tax rate
 * POST /api/v1/tax-rates
 * @param {Object} data - { stateCode, stateName, taxPercent, isActive, isDefault }
 */
export const createTaxRate = async (data) => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create tax rate: ${response.status}`);
    }

    return response.json();
};

/**
 * Update an existing tax rate
 * PUT /api/v1/tax-rates/{taxRateId}
 * @param {number} taxRateId 
 * @param {Object} data - { stateCode, stateName, taxPercent, isActive, isDefault }
 */
export const updateTaxRate = async (taxRateId, data) => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates/${taxRateId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update tax rate: ${response.status}`);
    }

    return response.json();
};

/**
 * Delete a tax rate
 * DELETE /api/v1/tax-rates/{taxRateId}
 * @param {number} taxRateId 
 */
export const deleteTaxRate = async (taxRateId) => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates/${taxRateId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete tax rate: ${response.status}`);
    }

    return response.json();
};

/**
 * Set a tax rate as the default
 * PATCH /api/v1/tax-rates/{taxRateId}/set-default
 * @param {number} taxRateId 
 */
export const setDefaultTaxRate = async (taxRateId) => {
    const token = getValidToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/tax-rates/${taxRateId}/set-default`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to set default tax rate: ${response.status}`);
    }

    return response.json();
};

export default {
    getTaxRates,
    getActiveTaxRates,
    getDefaultTaxRate,
    createTaxRate,
    updateTaxRate,
    deleteTaxRate,
    setDefaultTaxRate
};
