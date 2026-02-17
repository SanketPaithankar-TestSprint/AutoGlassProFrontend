
import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const createShop = async (token, ownerId, shopData) => {
    const response = await fetch(`${AGP_API_URL}/shops?ownerId=${ownerId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(shopData)
    });

    if (!response.ok) {
        let errorMessage = "Failed to create shop";
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
