
// Helper to parse glass data codes
// Helper to parse glass data codes
export const getPrefixCd = (glass) => (glass?.prefix || glass?.code?.substring(0, 2) || "").toUpperCase();

export const getPosCd = (glass) => {
    const prefix = getPrefixCd(glass);
    if (prefix === "DW" || prefix === "DB") return "NULL";

    const raw = (glass?.position || "").toUpperCase();
    if (raw.startsWith("FRONT") || raw === "F") return "F";
    if (raw.startsWith("REAR") || raw === "R") return "R";
    return "NULL";
};

export const getSideCd = (glass) => {
    const prefix = getPrefixCd(glass);
    if (prefix === "DW" || prefix === "DB") return "NULL";

    const raw = (glass?.side || "").toUpperCase();
    if (raw.startsWith("LEFT") || raw === "L") return "L";
    if (raw.startsWith("RIGHT") || raw === "R") return "R";
    return "NULL";
};

// Helper to find glass by code prefix/position/side
export const findGlassInCatalog = (glassData, prefix, pos = "N/A", side = "N/A") => {
    return glassData.find((g) => {
        // Match prefix
        const gPrefix = getPrefixCd(g);
        if (gPrefix !== prefix) return false;

        // Match position
        const gPos = (g.position || "N/A").toUpperCase();
        const targetPos = (pos || "N/A").toUpperCase();
        if (gPos !== targetPos) return false;

        // Match side
        const gSide = (g.side || "N/A").toUpperCase();
        const targetSide = (side || "N/A").toUpperCase();
        if (gSide !== targetSide) return false;

        return true;
    });
};

// Definition of diagram zones with their glass criteria
export const GLASS_ZONES_CONFIG = [
    {
        id: "windshield",
        label: "Windshield",
        criteria: { prefix: "DW" },
        path: "M85,140 C85,140 110,120 150,120 C190,120 215,140 215,140 L225,175 C225,175 190,185 150,185 C110,185 75,175 75,175 L85,140 Z",
    },
    {
        id: "back_glass",
        label: "Back Glass",
        criteria: { prefix: "DB" },
        path: "M80,405 C80,405 110,395 150,395 C190,395 220,405 220,405 L210,445 C210,445 180,455 150,455 C120,455 90,445 90,445 L80,405 Z",
    },

    // --- LEFT SIDE ---
    {
        id: "l_fq",
        label: "Front Quarter (left)",
        criteria: { prefix: "DQ", side: "Left" },
        path: "M68,170 L72,185 L52,185 C51,180 55,175 68,170 Z",
    },
    {
        id: "l_fv",
        label: "Front Vent (left)",
        criteria: { prefix: "DV", pos: "Front", side: "Left" },
        path: "M72,188 L72,210 L52,210 L52,188 Z",
    },
    {
        id: "l_fd",
        label: "Front Door (left)",
        criteria: { prefix: "DD", pos: "Front", side: "Left" },
        path: "M72,213 L72,270 L50,270 C48,250 48,230 52,213 Z",
    },
    {
        id: "l_md",
        label: "Middle Door (left)",
        criteria: { prefix: "DD", pos: "Middle", side: "Left" },
        path: "M72,273 L72,295 L50,295 L50,273 Z",
    },
    {
        id: "l_rd",
        label: "Rear Door (left)",
        criteria: { prefix: "DD", pos: "Rear", side: "Left" },
        path: "M72,298 L72,355 L52,355 C50,335 50,315 50,298 Z",
    },
    {
        id: "l_rv",
        label: "Rear Vent (left)",
        criteria: { prefix: "DV", pos: "Rear", side: "Left" },
        path: "M72,358 L72,380 L54,380 L52,358 Z",
    },
    {
        id: "l_rq",
        label: "Rear Quarter (left)",
        criteria: { prefix: "DQ", side: "Left" },
        path: "M72,383 L68,400 C58,395 55,390 54,383 Z",
    },

    // --- RIGHT SIDE ---
    {
        id: "r_fq",
        label: "Front Quarter (right)",
        criteria: { prefix: "DQ", side: "Right" },
        path: "M232,170 L228,185 L248,185 C249,180 245,175 232,170 Z",
    },
    {
        id: "r_fv",
        label: "Front Vent (right)",
        criteria: { prefix: "DV", pos: "Front", side: "Right" },
        path: "M228,188 L228,210 L248,210 L248,188 Z",
    },
    {
        id: "r_fd",
        label: "Front Door (right)",
        criteria: { prefix: "DD", pos: "Front", side: "Right" },
        path: "M228,213 L228,270 L250,270 C252,250 252,230 248,213 Z",
    },
    {
        id: "r_md",
        label: "Middle Door (right)",
        criteria: { prefix: "DD", pos: "Middle", side: "Right" },
        path: "M228,273 L228,295 L250,295 L250,273 Z",
    },
    {
        id: "r_rd",
        label: "Rear Door (right)",
        criteria: { prefix: "DD", pos: "Rear", side: "Right" },
        path: "M228,298 L228,355 L248,355 C250,335 250,315 250,298 Z",
    },
    {
        id: "r_rv",
        label: "Rear Vent (right)",
        criteria: { prefix: "DV", pos: "Rear", side: "Right" },
        path: "M228,358 L228,380 L246,380 L248,358 Z",
    },
    {
        id: "r_rq",
        label: "Rear Quarter (right)",
        criteria: { prefix: "DQ", side: "Right" },
        path: "M228,383 L232,400 C242,395 245,390 246,383 Z",
    },
];

/**
 * Helper to extract pricing and description from glass API response.
 * Prioritizes Pilkington data if available.
 * 
 * @param {Object} apiData - The JSON response from the glass-info API
 * @param {string} originalDescription - Fallback description if none found
 * @returns {Object} - { listPrice, netPrice, description, labor, manufacturer }
 */
export const extractGlassInfo = (apiData, originalDescription = "") => {
    if (!apiData) return { listPrice: 0, netPrice: 0, description: originalDescription, labor: 0, manufacturer: "" };

    // 1. Check for nested 'glass_parts' array (New Structure)
    if (apiData.glass_parts && Array.isArray(apiData.glass_parts) && apiData.glass_parts.length > 0) {
        // Use the first part found
        const part = apiData.glass_parts[0];
        const info = part.glass_info || {};

        let description = info.description || originalDescription;
        let manufacturer = info.manufacturer || "";
        let netPrice = Number(info.list_price) || 0; // Default Net to List if no Pilkington

        if (info.pilkington && Array.isArray(info.pilkington) && info.pilkington.length > 0) {
            const pilk = info.pilkington[0];
            description = pilk.Description || description;

            // Remove IndustryCode from description if it starts with it
            if (pilk.IndustryCode && description.startsWith(pilk.IndustryCode)) {
                description = description.substring(pilk.IndustryCode.length).trim();
            }

            manufacturer = "Pilkington";
            // Net Price comes from Pilkington
            netPrice = Number(pilk.UnitPrice) || Number(pilk.NetPrice) || netPrice;
        }

        return {
            listPrice: Number(info.list_price) || 0,
            netPrice: netPrice,
            description: description,
            labor: Number(info.labor) || 0,
            manufacturer: manufacturer,
            ta: info.ta || ""
        };
    }

    // 2. Fallback for Old Structure (Direct Properties)
    let description = apiData.description || originalDescription;
    let manufacturer = apiData.manufacturer || "";
    let listPrice = Number(apiData.list_price) || 0;
    let netPrice = listPrice;

    if (apiData.pilkington && Array.isArray(apiData.pilkington) && apiData.pilkington.length > 0) {
        const pilk = apiData.pilkington[0];
        description = pilk.Description || description;

        // Remove IndustryCode from description if it starts with it
        if (pilk.IndustryCode && description.startsWith(pilk.IndustryCode)) {
            description = description.substring(pilk.IndustryCode.length).trim();
        }

        manufacturer = "Pilkington";
        netPrice = Number(pilk.UnitPrice) || Number(pilk.NetPrice) || netPrice;
    }

    return {
        listPrice: listPrice,
        netPrice: netPrice,
        description: description,
        labor: Number(apiData.labor) || 0,
        manufacturer: manufacturer,
        ta: apiData.ta || ""
    };
};
