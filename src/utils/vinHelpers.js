/**
 * VIN Helper Utilities
 * Provides fuzzy matching, door count extraction, and body type selection logic
 * for VIN decoding integration with YYM module
 */

/**
 * Fuzzy match VIN model name against internal backend models list
 * @param {string} vinModel - Model name from VIN decode (e.g., "Frontier")
 * @param {string[]} modelsList - Array of model names from backend (e.g., ["Frontier Pickup", "Frontier King Cab"])
 * @returns {string|null} - Matched model name or null if no match found
 */
export const fuzzyMatchModel = (vinModel, modelsList) => {
    if (!vinModel || !Array.isArray(modelsList) || modelsList.length === 0) {
        return null;
    }

    const normalizedVinModel = vinModel.trim().toLowerCase();

    // Strategy 1: Exact match (case-insensitive)
    const exactMatch = modelsList.find(
        (model) => model.toLowerCase() === normalizedVinModel
    );
    if (exactMatch) {
        return exactMatch;
    }

    // Strategy 2: Contains match - find first model that contains the VIN model string
    // Example: "Frontier" matches "Frontier Pickup"
    const containsMatch = modelsList.find((model) =>
        model.toLowerCase().includes(normalizedVinModel)
    );
    if (containsMatch) {
        return containsMatch;
    }

    // Strategy 3: Reverse contains - VIN model contains backend model
    // Example: "Frontier Pickup" (from VIN) matches "Frontier" (from backend)
    const reverseContainsMatch = modelsList.find((model) =>
        normalizedVinModel.includes(model.toLowerCase())
    );
    if (reverseContainsMatch) {
        return reverseContainsMatch;
    }

    // No match found
    return null;
};

/**
 * Extract door count from VIN response data
 * @param {Object} vinData - VIN decode response
 * @param {string} vinData.body_type - Body type from VIN (e.g., "Pickup", "Sedan")
 * @param {string} vinData.model - Model from VIN
 * @param {string} vinData.vehicle_type - Vehicle type from VIN
 * @returns {number|null} - Door count (2 or 4) or null if not determinable
 */
export const extractDoorCount = (vinData) => {
    if (!vinData) {
        return null;
    }

    // Common patterns to search for door count
    const searchFields = [
        vinData.body_type,
        vinData.model,
        vinData.vehicle_type,
    ].filter(Boolean);

    for (const field of searchFields) {
        const fieldLower = field.toLowerCase();

        // Look for explicit door count patterns
        // Match "2 door", "2-door", "2dr", "two door", etc.
        if (
            /\b2[\s-]?door\b/i.test(field) ||
            /\b2dr\b/i.test(field) ||
            /\btwo[\s-]?door\b/i.test(field)
        ) {
            return 2;
        }

        if (
            /\b4[\s-]?door\b/i.test(field) ||
            /\b4dr\b/i.test(field) ||
            /\bfour[\s-]?door\b/i.test(field)
        ) {
            return 4;
        }

        // Check for cab types (common in trucks)
        if (
            fieldLower.includes("extended cab") ||
            fieldLower.includes("king cab") ||
            fieldLower.includes("access cab")
        ) {
            return 2; // Extended/King/Access cabs are typically 2-door
        }

        if (
            fieldLower.includes("crew cab") ||
            fieldLower.includes("double cab") ||
            fieldLower.includes("quad cab")
        ) {
            return 4; // Crew/Double/Quad cabs are typically 4-door
        }
    }

    // Unable to determine door count
    return null;
};

/**
 * Auto-select body type based on door count
 * @param {Array<{body_style_id: number, abbrev: string, desc: string}>} bodyTypes - Array of body types from backend
 * @param {number|null} doorCount - Door count (2 or 4)
 * @returns {number|null} - Selected body_style_id or null if no match
 */
export const selectBodyTypeByDoors = (bodyTypes, doorCount) => {
    if (!Array.isArray(bodyTypes) || bodyTypes.length === 0 || !doorCount) {
        return null;
    }

    // Search for body type matching the door count
    const matchingBodyType = bodyTypes.find((bt) => {
        const searchText = `${bt.desc} ${bt.abbrev}`.toLowerCase();

        // Look for door count in description or abbreviation
        if (doorCount === 2) {
            return (
                /\b2[\s-]?door\b/i.test(searchText) ||
                /\b2d\b/i.test(searchText) ||
                /^2d/i.test(bt.abbrev)
            );
        }

        if (doorCount === 4) {
            return (
                /\b4[\s-]?door\b/i.test(searchText) ||
                /\b4d\b/i.test(searchText) ||
                /^4d/i.test(bt.abbrev)
            );
        }

        return false;
    });

    return matchingBodyType ? matchingBodyType.body_style_id : null;
};
