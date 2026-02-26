import urls from "../config";

/**
 * Fetch available makes for a given year
 * @param {number|string} year - Vehicle year
 * @returns {Promise<{makes: Array<{make_id: number, abbrev: string, name: string}>}>} - Array of makes
 */
export const getMakes = async (year) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    const url = `${baseUrl}?year=${year}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch makes:", error);
        throw error;
    }
};

/**
 * Fetch available models for a given year and make_id
 * @param {number|string} year - Vehicle year
 * @param {number} makeId - Vehicle make ID
 * @returns {Promise<{models: Array<{make_model_id: number, model_name: string, veh_modifier_id: number|null}>}>} - Array of models with IDs
 */
export const getModels = async (year, makeId) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    const url = `${baseUrl}?year=${year}&make_id=${makeId}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch models:", error);
        throw error;
    }
};

/**
 * Fetch available body types for a given year, make_id, make_model_id, and optional veh_modifier_id
 * @param {number|string} year - Vehicle year
 * @param {number} makeId - Vehicle make ID
 * @param {number} makeModelId - Vehicle make/model combination ID
 * @param {number|null} vehModifierId - Optional vehicle modifier ID
 * @returns {Promise<{body_types: Array<{body_style_id: number, abbrev: string, desc: string}>}>} - Array of body types
 */
export const getBodyTypes = async (year, makeId, makeModelId, vehModifierId = null) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    let url = `${baseUrl}?year=${year}&make_id=${makeId}&make_model_id=${makeModelId}`;

    // Only add veh_modifier_id if it's not null
    if (vehModifierId !== null && vehModifierId !== undefined) {
        url += `&veh_modifier_id=${vehModifierId}`;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch body types:", error);
        throw error;
    }
};

/**
 * Reverse lookup — cascades Model → Make → Year
 * - No params: returns all distinct base models AND modifier variants
 *   Each item has make_model_id, name, veh_modifier_id (null for base models)
 * - make_model_id only (+ optional veh_modifier_id): returns all makes for that model/variant
 *   Response: list of { make_id, name }
 * - make_model_id + make_id (+ optional veh_modifier_id): returns all years for that make+model/variant
 *   Response: list of year integers in descending order
 */
export const getModelsReverse = async ({ makeModelId, vehModifierId, makeId } = {}) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup-reverse";
    const params = new URLSearchParams();

    if (makeModelId !== undefined && makeModelId !== null) {
        params.append("make_model_id", makeModelId);
    }
    if (vehModifierId !== undefined && vehModifierId !== null) {
        params.append("veh_modifier_id", vehModifierId);
    }
    if (makeId !== undefined && makeId !== null) {
        params.append("make_id", makeId);
    }

    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch reverse model lookup:", error);
        throw error;
    }
};

/**
 * Fetch vehicle details including veh_id and model_id using all IDs
 * @param {number|string} year - Vehicle year
 * @param {number} makeId - Vehicle make ID
 * @param {number} makeModelId - Vehicle make/model combination ID
 * @param {number} bodyStyleId - Body style ID
 * @param {number|null} vehModifierId - Optional vehicle modifier ID
 * @returns {Promise<{veh_id: number, model_id: number, image: string, description: string}>} - Vehicle details
 */
export const getVehicleDetails = async (year, makeId, makeModelId, bodyStyleId, vehModifierId = null) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    let url = `${baseUrl}?year=${year}&make_id=${makeId}&make_model_id=${makeModelId}&body_style_id=${bodyStyleId}`;

    // Only add veh_modifier_id if it's not null
    if (vehModifierId !== null && vehModifierId !== undefined) {
        url += `&veh_modifier_id=${vehModifierId}`;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch vehicle details:", error);
        throw error;
    }
};
