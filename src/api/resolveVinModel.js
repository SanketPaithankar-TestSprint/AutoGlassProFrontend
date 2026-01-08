import { getMakes, getModels } from "./getModels";
import { fuzzyMatchModel } from "../utils/vinHelpers";

/**
 * Find make_id by matching make name from VIN decode
 * @param {string|number} year - Vehicle year
 * @param {string} makeName - Make name from VIN (e.g., "Toyota")
 * @returns {Promise<{make_id: number|null, makeName: string}>}
 */
const findMakeId = async (year, makeName) => {
    try {
        const data = await getMakes(year);
        const makesList = Array.isArray(data?.makes) ? data.makes : [];

        if (makesList.length === 0) {
            return { make_id: null, makeName };
        }

        // Exact match first (case-insensitive)
        const lowerMakeName = makeName.toLowerCase();
        let matched = makesList.find(m =>
            (m.name && m.name.toLowerCase() === lowerMakeName) ||
            (m.abbrev && m.abbrev.toLowerCase() === lowerMakeName)
        );

        // If no exact match, try partial match
        if (!matched) {
            matched = makesList.find(m =>
                (m.name && m.name.toLowerCase().includes(lowerMakeName)) ||
                (m.abbrev && m.abbrev.toLowerCase().includes(lowerMakeName)) ||
                lowerMakeName.includes((m.name || '').toLowerCase()) ||
                lowerMakeName.includes((m.abbrev || '').toLowerCase())
            );
        }

        if (matched) {
            return {
                make_id: matched.make_id,
                makeName: matched.name || matched.abbrev || makeName
            };
        }

        return { make_id: null, makeName };
    } catch (error) {
        console.error("[findMakeId] Error:", error);
        return { make_id: null, makeName };
    }
};

/**
 * Resolve VIN model name to internal backend model using fuzzy matching
 * Now returns make_id and make_model_id for the new API
 * @param {string|number} year - Vehicle year from VIN
 * @param {string} make - Vehicle make from VIN
 * @param {string} vinModel - Model name from VIN decode (e.g., "Frontier")
 * @returns {Promise<{
 *   resolvedModel: string|null, 
 *   models: Array<{make_model_id: number, model_name: string, veh_modifier_id: number|null}>,
 *   matchFound: boolean,
 *   makeId: number|null,
 *   makeName: string,
 *   makeModelId: number|null,
 *   vehModifierId: number|null
 * }>}
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
                resolvedModel: vinModel,
                models: [],
                matchFound: false,
                makeId: null,
                makeName: make || '',
                makeModelId: null,
                vehModifierId: null
            };
        }

        // Step 1: Find make_id from make name
        const { make_id: makeId, makeName } = await findMakeId(year, make);

        if (!makeId) {
            console.warn(`[resolveVinModel] Could not find make_id for ${make}`);
            return {
                resolvedModel: vinModel,
                models: [],
                matchFound: false,
                makeId: null,
                makeName: make,
                makeModelId: null,
                vehModifierId: null
            };
        }

        // Step 2: Fetch models list using make_id
        const data = await getModels(year, makeId);
        const modelsList = Array.isArray(data?.models) ? data.models : [];

        if (modelsList.length === 0) {
            console.warn(
                `[resolveVinModel] No models found for ${year} ${make} (make_id: ${makeId})`
            );
            return {
                resolvedModel: vinModel,
                models: [],
                matchFound: false,
                makeId,
                makeName,
                makeModelId: null,
                vehModifierId: null
            };
        }

        // Step 3: Apply fuzzy matching to find the model
        // Extract model_name strings for matching
        const modelNames = modelsList.map(m => m.model_name);
        const matchedModelName = fuzzyMatchModel(vinModel, modelNames);

        // Find the full model object
        let matchedModel = null;
        if (matchedModelName) {
            matchedModel = modelsList.find(m => m.model_name === matchedModelName);
        }

        return {
            resolvedModel: matchedModelName || vinModel,
            models: modelsList,
            matchFound: !!matchedModel,
            makeId,
            makeName,
            makeModelId: matchedModel?.make_model_id || null,
            vehModifierId: matchedModel?.veh_modifier_id || null
        };
    } catch (error) {
        console.error("[resolveVinModel] Error resolving model:", error);
        return {
            resolvedModel: vinModel,
            models: [],
            matchFound: false,
            makeId: null,
            makeName: make || '',
            makeModelId: null,
            vehModifierId: null
        };
    }
};

/**
 * Resolve complete VIN data including model and body type
 * @param {Object} vinData - Complete VIN decode response
 * @param {string} vinData.year - Vehicle year
 * @param {string} vinData.make - Vehicle make
 * @param {string} vinData.model - Vehicle model
 * @returns {Promise<{
 *   resolvedModel: string, 
 *   matchFound: boolean, 
 *   models: Array,
 *   makeId: number|null,
 *   makeName: string,
 *   makeModelId: number|null,
 *   vehModifierId: number|null
 * }>}
 */
export const resolveCompleteVinData = async (vinData) => {
    if (!vinData || !vinData.year || !vinData.make || !vinData.model) {
        console.warn("[resolveCompleteVinData] Invalid VIN data:", vinData);
        return {
            resolvedModel: vinData?.model || null,
            matchFound: false,
            models: [],
            makeId: null,
            makeName: vinData?.make || '',
            makeModelId: null,
            vehModifierId: null
        };
    }

    return await resolveVinModel(vinData.year, vinData.make, vinData.model);
};
