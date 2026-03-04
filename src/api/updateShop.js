
import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;
import { getValidToken } from "./getValidToken";
export const updateShop = async (id, shopData) => {
    const token = getValidToken();
    const response = await fetch(`${AGP_API_URL}/shops/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(shopData)
    });

    if (!response.ok) {
        let errorMessage = "Failed to update shop";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
    }

    return await response.json();
};
