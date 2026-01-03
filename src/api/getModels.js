import urls from "../config";

/**
 * Fetch available models for a given year and make
 * @param {number|string} year - Vehicle year
 * @param {string} make - Vehicle make
 * @returns {Promise<{models: string[]}>} - Array of model names
 */
export const getModels = async (year, make) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    const url = `${baseUrl}?year=${year}&make=${make}`;

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
 * Fetch available body types for a given year, make, and model
 * @param {number|string} year - Vehicle year
 * @param {string} make - Vehicle make
 * @param {string} model - Vehicle model
 * @returns {Promise<{body_types: Array<{body_style_id: number, abbrev: string, desc: string}>}>} - Array of body types
 */
export const getBodyTypes = async (year, make, model) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    const url = `${baseUrl}?year=${year}&make=${make}&model=${encodeURIComponent(model)}`;

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
 * Fetch vehicle details including veh_id and model_id using body_style_id
 * @param {number|string} year - Vehicle year
 * @param {string} make - Vehicle make
 * @param {string} model - Vehicle model
 * @param {number} bodyStyleId - Body style ID
 * @returns {Promise<{veh_id: number, model_id: number, image: string, description: string}>} - Vehicle details
 */
export const getVehicleDetails = async (year, make, model, bodyStyleId) => {
    const baseUrl = urls.pythonApiUrl + "agp/v1/model-lookup";
    const url = `${baseUrl}?year=${year}&make=${make}&model=${encodeURIComponent(model)}&body_style_id=${bodyStyleId}`;

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

