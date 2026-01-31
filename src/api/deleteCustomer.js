import urls from "../config";

export async function deleteCustomer(token, customerId) {
    const url = `${urls.javaApiUrl}/v1/customers/${customerId}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json(); // Or response.ok if no body
    } catch (error) {
        console.error("Failed to delete customer:", error);
        throw error;
    }
}
