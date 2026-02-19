// src/api/getProfile.js
import urls from "../config";

export async function getProfile(token) {
    const url = `${urls.javaApiUrl}/v1/users/profile`;
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

        const profileData = await response.json();

        // Store userId in sessionStorage and laborRate in localStorage for global access
        if (profileData.userId) {
            localStorage.setItem('userId', profileData.userId); // Updated to localStorage
        }
        if (profileData.laborRate) {
            localStorage.setItem('GlobalLaborRate', profileData.laborRate);
        }

        return profileData;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        throw error;
    }
}

