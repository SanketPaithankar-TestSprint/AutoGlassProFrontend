// src/api/getProfile.js
import urls from "../config";

export async function getProfile(token)
{
    const url = `${urls.javaApiUrl}/profile`;
    try
    {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok)
        {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error)
    {
        console.error("Failed to fetch profile:", error);
        throw error;
    }
}
