import urls from "../config";

export async function deleteCustomer(token, customerId, force = false) {
    const url = `${urls.javaApiUrl}/v1/customers/${customerId}?force=${force}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            if (response.status === 409) {
                return await response.json();
            }
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json(); // Or response.ok if no body
    } catch (error) {
        console.error("Failed to delete customer:", error);
        throw error;
    }
}
