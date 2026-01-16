
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
