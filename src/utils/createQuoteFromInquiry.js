import config from '../config';
import { getMakes, getModels } from '../api/getModels';

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

/**
 * Resolves vehicle IDs from a service inquiry and returns a prefillData object
 * ready to be passed as location.state.prefillData to /search-by-root.
 *
 * Strategy:
 *  1. If VIN is present (17 chars) → call VIN API (lookup_ids=true) for full IDs.
 *  2. If no VIN but year + make are present → call model-lookup API cascade:
 *       year → getMakes → match by name → getMakes(makeId) → getModels → match by name
 *  3. Body style is intentionally left blank — user selects it manually.
 *
 * @param {object} inquiry - Service inquiry object from the API
 * @returns {Promise<{customer: object, vehicle: object}>} - prefillData for SearchByRoot
 */
export async function createQuoteFromInquiry(inquiry) {
    const baseCustomer = {
        firstName:    inquiry.firstName    || '',
        lastName:     inquiry.lastName     || '',
        email:        inquiry.email        || '',
        phone:        inquiry.phone        || '',
        addressLine1: inquiry.addressLine1 || '',
        city:         inquiry.city         || '',
        state:        inquiry.state        || '',
        postalCode:   inquiry.postalCode   || '',
    };

    let vehicle = {
        vehicleYear:   inquiry.vehicleYear   || '',
        vehicleMake:   inquiry.vehicleMake   || '',
        vehicleModel:  inquiry.vehicleModel  || '',
        vin:           inquiry.vin           || '',
        // IDs resolved below
        makeId:        null,
        makeModelId:   null,
        vehModifierId: null,
        vehicleId:     null,
    };

    try {
        const vin = (inquiry.vin || '').trim().toUpperCase();

        if (VIN_REGEX.test(vin)) {
            // ── Path 1: VIN decode ──────────────────────────────────────────────
            const res = await fetch(
                `${config.pythonApiUrl}agp/v1/vin?vin=${vin}&lookup_ids=true`,
                { headers: { accept: 'application/json' } }
            );
            if (res.ok) {
                const data = await res.json();
                vehicle = {
                    ...vehicle,
                    vehicleYear:   data.year        || vehicle.vehicleYear,
                    vehicleMake:   data.make        || vehicle.vehicleMake,
                    vehicleModel:  data.model       || vehicle.vehicleModel,
                    vin:           data.vin         || vin,
                    makeId:        data.make_id         ?? null,
                    makeModelId:   data.make_model_id   ?? null,
                    vehModifierId: data.veh_modifier_id ?? null,
                    vehicleId:     data.veh_id          ?? null,
                };
            } else {
                console.warn('[createQuoteFromInquiry] VIN API returned', res.status);
            }

        } else if (inquiry.vehicleYear && inquiry.vehicleMake) {
            // ── Path 2: model-lookup cascade ────────────────────────────────────
            const year      = inquiry.vehicleYear;
            const makeName  = (inquiry.vehicleMake  || '').trim().toLowerCase();
            const modelName = (inquiry.vehicleModel || '').trim().toLowerCase();

            // Step 1 — fetch makes for the year
            const makesData = await getMakes(year);
            const makes = Array.isArray(makesData?.makes) ? makesData.makes : [];

            const matchedMake = makes.find(m =>
                (m.name || m.abbrev || '').trim().toLowerCase() === makeName
            );

            if (matchedMake) {
                vehicle.makeId = matchedMake.make_id;

                if (modelName) {
                    // Step 2 — fetch models for year + make
                    const modelsData = await getModels(year, matchedMake.make_id);
                    const models = Array.isArray(modelsData?.models) ? modelsData.models : [];

                    const matchedModel = models.find(m =>
                        (m.model_name || '').trim().toLowerCase() === modelName
                    );

                    if (matchedModel) {
                        vehicle.makeModelId   = matchedModel.make_model_id;
                        vehicle.vehModifierId = matchedModel.veh_modifier_id ?? null;
                    }
                }
            }
        }
    } catch (err) {
        console.error('[createQuoteFromInquiry] Vehicle resolution failed:', err);
    }

    return { customer: baseCustomer, vehicle };
}
