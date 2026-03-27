import urls from "../config";
import { getValidToken } from "./getValidToken";

/**
 * GET /api/support/tickets
 * Returns a list of tickets belonging to the authenticated user.
 */
export async function getSupportTickets() {
    const url = `${urls.javaApiUrl}/support/tickets`;
    const token = getValidToken();

    const response = await fetch(url, {
        method: "GET",
        headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
    }

    return response.json();
}

/**
 * POST /api/support/tickets
 * Creates a new support ticket with optional file attachments.
 *
 * @param {object} data  - { subject, category, priority, description }
 * @param {File[]} files - optional array of File objects
 */
export async function createSupportTicket(data, files = []) {
    const url = `${urls.javaApiUrl}/support/tickets`;
    const token = getValidToken();

    const formData = new FormData();
    // The backend expects a JSON string in the `data` field
    formData.append("data", JSON.stringify(data));
    files.forEach((file) => formData.append("attachments", file));

    const response = await fetch(url, {
        method: "POST",
        headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
            // Do NOT set Content-Type — browser sets it with boundary automatically
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to create ticket: ${response.status}`);
    }

    return response.json();
}

/**
 * POST /api/support/request-call
 * Schedules a phone callback request.
 *
 * @param {object} data - { preferredDate, preferredTime, contactNumber, notes }
 */
export async function requestPhoneCall(data) {
    const url = `${urls.javaApiUrl}/support/request-call`;
    const token = getValidToken();

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to request call: ${response.status}`);
    }

    return response.json();
}

/**
 * GET /api/support/call-history
 * Returns previous call requests by the user.
 */
export async function getCallHistory() {
    const url = `${urls.javaApiUrl}/support/call-history`;
    const token = getValidToken();

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch call history: ${response.status}`);
    }

    return response.json();
}
