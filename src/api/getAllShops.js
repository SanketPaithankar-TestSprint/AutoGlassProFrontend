
import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const getAllShops = async (token) => {
    const response = await fetch(`${AGP_API_URL}/shops/my-shops`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch shops");
    }

    return await response.json();
};
