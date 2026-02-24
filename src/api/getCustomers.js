import urls from "../config";

export async function getCustomers(token, { page, size } = {}) {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page);
    if (size !== undefined) params.append('size', size);
    const queryString = params.toString();
    const url = `${urls.javaApiUrl}/v1/customers${queryString ? `?${queryString}` : ''}`;
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
