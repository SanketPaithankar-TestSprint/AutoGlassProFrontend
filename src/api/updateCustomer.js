import urls from "../config";

export async function updateCustomer(token, customerId, customerData) {
    const url = `${urls.javaApiUrl}/v1/customers/${customerId}`;
    try {
        const response = await fetch(url, {
            method: "PUT",
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
        console.error("Failed to update customer:", error);
        throw error;
    }
}
