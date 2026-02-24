import urls from "../config";

export async function searchCustomers(token, query) {
    const url = `${urls.javaApiUrl}/v1/customers/search?query=${encodeURIComponent(query)}&page=0&size=100`;
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
        console.error("Failed to search customers:", error);
        throw error;
    }
}
