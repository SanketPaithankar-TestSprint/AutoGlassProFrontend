// src/api/getServiceDocumentSchedule.js
import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * Fetches scheduled service documents from the API.
 * @param {Object} options - Query options
 * @param {number} options.days - Number of days to fetch (default: 30)
 * @param {string} options.startDate - Start date in YYYY-MM-DD format
 * @param {boolean} options.includePast - Whether to include past documents (default: false)
 * @returns {Promise<Array>} - List of scheduled service documents (normalized)
 */
export const getServiceDocumentSchedule = async ({
    days = 30,
    startDate,
    includePast = false
} = {}) => {
    try {
        const token = await getValidToken();

        // Build query params
        const params = new URLSearchParams();
        params.append('days', days);
        if (startDate) {
            params.append('startDate', startDate);
        }
        params.append('includePast', includePast);

        const url = `${urls.javaApiUrl}/v1/service-documents/schedule?${params.toString()}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch scheduled documents: ${response.status}`);
        }

        const data = await response.json();

        // Handle both array and paginated response formats
        const rawDocuments = data.content || (Array.isArray(data) ? data : []);

        // Normalize the data structure
        // API returns: { serviceDocument: {...}, customer: {...}, vehicle: {...}, ... }
        // We flatten it for easier consumption
        const normalizedDocuments = rawDocuments.map(item => {
            const doc = item.serviceDocument || item;
            const customer = item.customer || null;
            const vehicle = item.vehicle || null;

            return {
                // Document fields
                id: doc.documentId || doc.id,
                documentNumber: doc.documentNumber,
                documentType: doc.documentType,
                status: doc.status,
                serviceLocation: doc.serviceLocation,
                scheduledDate: doc.scheduledDate,
                totalAmount: doc.totalAmount,
                balanceDue: doc.balanceDue,

                // Customer info (normalized)
                customerId: doc.customerId || customer?.customerId,
                customerName: doc.customerName || (customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 'N/A'),
                customer: customer ? {
                    id: customer.customerId,
                    name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A',
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    phone: customer.phone,
                    email: customer.email
                } : null,

                // Vehicle info (normalized)
                vehicleId: doc.vehicleId || vehicle?.vehicleId,
                vehicleInfo: doc.vehicleInfo,
                vehicle: vehicle ? {
                    id: vehicle.vehicleId,
                    year: vehicle.vehicleYear,
                    make: vehicle.vehicleMake,
                    model: vehicle.vehicleModel,
                    bodyType: vehicle.bodyType,
                    vin: vehicle.vin
                } : null,

                // Employee info
                employeeId: doc.employeeId,
                employeeName: doc.employeeName,

                // Original data in case needed
                _raw: item
            };
        });

        return normalizedDocuments;
    } catch (error) {
        console.error("Error fetching scheduled documents:", error);
        throw error;
    }
};
