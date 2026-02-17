
import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const getShopById = async (token, id) => {
    const response = await fetch(`${AGP_API_URL}/shops/${id}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch shop details");
    }

    return await response.json();
};
