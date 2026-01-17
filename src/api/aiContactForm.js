
import urls from "../config";

export async function getAiContactForms(token, page = 0, size = 10) {
    const url = `${urls.javaApiUrl}/v1/ai-contact-form?page=${page}&size=${size}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch AI contact forms:", error);
        throw error;
    }
}

export async function getAiContactFormById(token, id) {
    const url = `${urls.javaApiUrl}/v1/ai-contact-form/${id}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch AI contact form ${id}:`, error);
        throw error;
    }
}

export async function updateAiContactFormStatus(token, id, status) {
    const url = `${urls.javaApiUrl}/v1/ai-contact-form/${id}/service-status?status=${status}`;
    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return true; // Success
    } catch (error) {
        console.error(`Failed to update status for AI contact form ${id}:`, error);
        throw error;
    }
}
