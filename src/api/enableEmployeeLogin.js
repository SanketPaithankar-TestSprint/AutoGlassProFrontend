import urls from "../config";

export async function enableEmployeeLogin(token, payload) {
    const url = `${urls.javaApiUrl}/v1/employees/enable-login`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error: ${response.status} - ${errorText}`);
        }
        return await response.text(); // Returns success message string
    } catch (error) {
        console.error("Failed to enable employee login:", error);
        throw error;
    }
}
