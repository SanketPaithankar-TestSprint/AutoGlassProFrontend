import { getModels } from "./getModels";
import { fuzzyMatchModel } from "../utils/vinHelpers";

/**
 * Resolve VIN model name to internal backend model using fuzzy matching
 * @param {string|number} year - Vehicle year from VIN
 * @param {string} make - Vehicle make from VIN
 * @param {string} vinModel - Model name from VIN decode (e.g., "Frontier")
 * @returns {Promise<{resolvedModel: string|null, models: string[], matchFound: boolean}>}
 */
export const resolveVinModel = async (year, make, vinModel) => {
    try {
        // Validate inputs
        if (!year || !make || !vinModel) {
            console.warn("[resolveVinModel] Missing required parameters:", {
                year,
                make,
                vinModel,
            });
            return {
                resolvedModel: vinModel, // Fallback to original
                models: [],
                matchFound: false,
            };
        }

        // Fetch models list from backend
        const data = await getModels(year, make);
        const modelsList = Array.isArray(data?.models) ? data.models : [];

        if (modelsList.length === 0) {
            console.warn(
                `[resolveVinModel] No models found for ${year} ${make}`
            );
            return {
                resolvedModel: vinModel, // Fallback to original
                models: [],
                matchFound: false,
            };
        }

        // Apply fuzzy matching
        const matchedModel = fuzzyMatchModel(vinModel, modelsList);

        return {
            resolvedModel: matchedModel || vinModel, // Fallback to original if no match
            models: modelsList,
            matchFound: !!matchedModel,
        };
    } catch (error) {
        console.error("[resolveVinModel] Error resolving model:", error);
        // Return original model on error
        return {
            resolvedModel: vinModel,
            models: [],
            matchFound: false,
        };
    }
};

/**
 * Resolve complete VIN data including model and body type
 * @param {Object} vinData - Complete VIN decode response
 * @param {string} vinData.year - Vehicle year
 * @param {string} vinData.make - Vehicle make
 * @param {string} vinData.model - Vehicle model
 * @returns {Promise<{resolvedModel: string, matchFound: boolean, models: string[]}>}
 */
export const resolveCompleteVinData = async (vinData) => {
    if (!vinData || !vinData.year || !vinData.make || !vinData.model) {
        console.warn("[resolveCompleteVinData] Invalid VIN data:", vinData);
        return {
            resolvedModel: vinData?.model || null,
            matchFound: false,
            models: [],
        };
    }

    return await resolveVinModel(vinData.year, vinData.make, vinData.model);
};
