
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
        let errorMsg = "Failed to delete shop";
        try {
            const errorData = await response.json();
            if (errorData?.message) errorMsg = errorData.message;
        } catch (e) {
            // If body is not JSON, fallback to generic
        }
        throw new Error(errorMsg);
    }

    return true; // Success
};
