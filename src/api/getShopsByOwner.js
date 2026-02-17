
import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const getShopsByOwner = async (token, ownerId) => {
    const response = await fetch(`${AGP_API_URL}/shops/owner/${ownerId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch shops for owner");
    }

    return await response.json();
};
