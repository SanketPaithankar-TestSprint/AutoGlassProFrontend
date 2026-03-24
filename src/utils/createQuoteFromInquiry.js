import config from '../config';
import { getMakes, getModels } from '../api/getModels';
import { fetchJsonWithAuth } from '../api/fetchWithAuth';

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

/**
 * Resolves vehicle IDs from a service inquiry and returns a prefillData object
 * ready to be passed as location.state.prefillData to /quote.
 *
 * Strategy:
 *  1. Detect if AI Chat Inquiry (has session_id).
 *  2. If VIN is present (17 chars) → call VIN API (lookup_ids=true) for full IDs.
 *  3. If no VIN but year + make are present → call model-lookup API cascade.
 *  4. Body style is mapped if available in the inquiry.
 *  5. Glass items are mapped for AI Chat if available.
 *
 * @param {object} inquiry - Service inquiry object (Standard or AI Chat)
 * @returns {Promise<{customer: object, vehicle: object, items: array, notes: string}>} - prefillData for SearchByRoot
 */
export async function createQuoteFromInquiry(inquiry) {
    const isAiChat = !!inquiry.session_id;

    const baseCustomer = {
        firstName:    (isAiChat ? inquiry.first_name : inquiry.firstName) || '',
        lastName:     (isAiChat ? inquiry.last_name  : inquiry.lastName)  || '',
        email:        inquiry.email        || '',
        phone:        inquiry.phone        || '',
        addressLine1: inquiry.addressLine1 || '',
        city:         inquiry.city         || '',
        state:        inquiry.state        || '',
        postalCode:   inquiry.postalCode   || '',
    };

    let vehicle = {
        vehicleYear:   (isAiChat ? inquiry.year        : inquiry.vehicleYear)  || '',
        vehicleMake:   (isAiChat ? inquiry.make_name   : inquiry.vehicleMake)  || '',
        vehicleModel:  (isAiChat ? inquiry.model_name  : inquiry.vehicleModel) || '',
        bodyType:      (isAiChat ? inquiry.body_style_name : inquiry.bodyType) || '',
        vin:           inquiry.vin           || '',
        // IDs resolved below
        makeId:        null,
        makeModelId:   null,
        vehModifierId: null,
        vehicleId:     null,
    };

    let items = [];
    let notes = (isAiChat ? '' : inquiry.customerMessage) || '';

    // Handle AI Chat details (Glasses, Features, Incident)
    if (isAiChat) {
        // Map Glasses
        if (Array.isArray(inquiry.selected_glasses)) {
            items = inquiry.selected_glasses.map(g => ({
                nagsId: typeof g === 'string' ? g : g.glass_code,
                glassType: typeof g === 'string' ? g : g.glass_type,
            })).filter(item => item.nagsId || item.glassType);
        }

        // Map Notes
        const noteParts = [];
        if (inquiry.incident_details && typeof inquiry.incident_details === 'object') {
            noteParts.push('Incident Details:');
            Object.entries(inquiry.incident_details).forEach(([key, val]) => {
                noteParts.push(`${key.replace(/_/g, ' ')}: ${val}`);
            });
        }
        if (Array.isArray(inquiry.windshield_features) && inquiry.windshield_features.length > 0) {
            noteParts.push(`Windshield Features: ${inquiry.windshield_features.join(', ')}`);
        }
        if (noteParts.length > 0) {
            notes = noteParts.join('\n');
        }
    }

    try {
        const vin = (inquiry.vin || '').trim().toUpperCase();

        if (VIN_REGEX.test(vin)) {
            // ── Path 1: VIN decode ──────────────────────────────────────────────
            const url = `${config.pythonApiUrl}agp/v1/vin?vin=${vin}&lookup_ids=true`;
            const data = await fetchJsonWithAuth(url);
            
            if (data) {
                vehicle = {
                    ...vehicle,
                    vehicleYear:   data.year        || vehicle.vehicleYear,
                    vehicleMake:   data.make        || vehicle.vehicleMake,
                    vehicleModel:  data.model       || vehicle.vehicleModel,
                    bodyType:      data.body_type   || vehicle.bodyType,
                    vin:           data.vin         || vin,
                    makeId:        data.make_id         ?? null,
                    makeModelId:   data.make_model_id   ?? null,
                    vehModifierId: data.veh_modifier_id ?? null,
                    vehicleId:     data.veh_id          ?? null,
                };
            }
        } else if (vehicle.vehicleYear && vehicle.vehicleMake) {
            // ── Path 2: model-lookup cascade ────────────────────────────────────
            const year      = vehicle.vehicleYear;
            const makeName  = (vehicle.vehicleMake  || '').trim().toLowerCase();
            const modelName = (vehicle.vehicleModel || '').trim().toLowerCase();

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

    return { customer: baseCustomer, vehicle, items, notes };
}
