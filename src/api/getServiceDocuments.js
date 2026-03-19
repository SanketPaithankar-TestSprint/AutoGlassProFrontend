// src/api/getServiceDocuments.js
import urls from "../config";

export async function getServiceDocuments(token, page = 0, size = 10, documentType = null, hasInsurance = null, isOverdue = null) {
    let url = `${urls.javaApiUrl}/v1/service-documents/my?page=${page}&size=${size}`;
    if (documentType && documentType !== 'all') {
        url += `&documenttype=${documentType.toUpperCase()}`;
    }
    if (hasInsurance !== null) {
        url += `&hasInsurance=${hasInsurance}`;
    }
    if (isOverdue !== null && isOverdue !== false) {
        url += `&isOverdue=${isOverdue}`;
    }
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
        console.error("Failed to fetch service documents:", error);
        throw error;
    }
}
