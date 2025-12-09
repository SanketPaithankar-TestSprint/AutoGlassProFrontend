import urls from "../config";

export async function createCustomer(token, customerData) {
    const url = `${urls.javaApiUrl}/v1/customers`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customerData)
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to create customer:", error);
        throw error;
    }
}
