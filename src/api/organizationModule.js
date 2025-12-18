/**
 * Organization Module API Exports
 * 
 * This module provides APIs for:
 * - Organizations (companies/fleet owners)
 * - Organization contacts (customers linked to organizations)
 * - Organization vehicles (fleet vehicles)
 * 
 * Customer Types:
 * - INDIVIDUAL: Regular customer with their own vehicles
 * - ORGANIZATION_CONTACT: Contact person for an organization (uses org's fleet vehicles)
 */

// Organization APIs
export {
    getOrganizations,
    getMyOrganizations,
    getTop10Organizations,
    getOrganizationById,
    getOrganizationWithDetails,
    getOrganizationVehicles,
    createOrganization,
    updateOrganization,
    deleteOrganization
} from './organizationApi';

// Customer/Contact APIs
export {
    createOrganizationContact,
    createIndividualCustomer
} from './createOrganizationContact';

// Vehicle APIs
export {
    createOrganizationVehicle,
    createCustomerVehicle,
    getAllVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle
} from './vehicleApi';
