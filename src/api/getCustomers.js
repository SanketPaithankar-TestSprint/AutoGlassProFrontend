import urls from "../config";

export async function getCustomers(token) {
    const url = `${urls.javaApiUrl}/v1/customers`;
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
        console.error("Failed to fetch customers:", error);
        throw error;
    }
}
