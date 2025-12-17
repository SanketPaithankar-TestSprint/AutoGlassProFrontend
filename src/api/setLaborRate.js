// src/api/setLaborRate.js
import urls from "../config";

export async function setLaborRate(token, laborRate) {
    const url = `${urls.javaApiUrl}/v1/users/set-labor-rate?laborRate=${laborRate}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
            body: "",
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // Handle both JSON and text responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            const text = await response.text();
            return { message: text, success: true };
        }
    } catch (error) {
        console.error("Failed to set labor rate:", error);
        throw error;
    }
}
