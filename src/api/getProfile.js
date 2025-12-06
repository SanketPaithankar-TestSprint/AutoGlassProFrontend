// src/api/getProfile.js
import urls from "../config";

export async function getProfile(token) {
    // const url = `${urls.javaApiUrl}/v1/users/profile`;
    const url = `http://localhost:8080/api/v1/users/profile`;
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
        console.error("Failed to fetch profile:", error);
        throw error;
    }
}
