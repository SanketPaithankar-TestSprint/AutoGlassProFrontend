/**
 * Create a customer as an organization contact
 * Links a customer to an organization as a contact person
 */
import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Creates a new customer linked to an organization as a contact person
 * @param {Object} customerData - Customer data including organizationId
 * @param {string} customerData.firstName - First name (required)
 * @param {string} customerData.lastName - Last name (required)
 * @param {string} customerData.phone - Phone number (required)
 * @param {number} customerData.organizationId - Organization ID to link to (required)
 * @param {string} [customerData.email] - Email (optional)
 * @param {string} [customerData.alternatePhone] - Alternate phone (optional)
 * @param {string} [customerData.addressLine1] - Address line 1 (optional, can inherit from org)
 * @param {string} [customerData.city] - City (optional)
 * @param {string} [customerData.state] - State (optional)
 * @param {string} [customerData.postalCode] - Postal code (optional)
 * @param {string} [customerData.country] - Country (optional)
 * @param {string} [customerData.preferredContactMethod] - phone, email, or sms (optional)
 * @param {string} [customerData.notes] - Notes (optional)
 * @returns {Promise<Object>} - Created customer with organizationId linked
 */
export const createOrganizationContact = async (customerData) => {
    try {
        const token = await getValidToken();

        // Ensure customerType is set to ORGANIZATION_CONTACT
        const payload = {
            ...customerData,
            customerType: "ORGANIZATION_CONTACT"
        };

        const response = await fetch(`${urls.javaApiUrl}/v1/customers`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create organization contact: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating organization contact:", error);
        throw error;
    }
};

/**
 * Creates a new individual customer (not linked to any organization)
 * @param {Object} customerData - Customer data
 * @returns {Promise<Object>} - Created customer
 */
export const createIndividualCustomer = async (customerData) => {
    try {
        const token = await getValidToken();

        // Ensure customerType is set to INDIVIDUAL
        const payload = {
            ...customerData,
            customerType: "INDIVIDUAL"
        };

        const response = await fetch(`${urls.javaApiUrl}/v1/customers`, {
            method: 'POST',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create individual customer: ${response.status} ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating individual customer:", error);
        throw error;
    }
};
