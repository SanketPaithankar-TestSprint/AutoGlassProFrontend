
import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const deleteShop = async (token, id) => {
    const response = await fetch(`${AGP_API_URL}/shops/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to delete shop");
    }

    return true; // Success
};
