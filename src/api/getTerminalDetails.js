import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const getTerminalDetails = async (token) => {
    const response = await fetch(`${AGP_API_URL}/v1/terminal-details`, {
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        let errorMessage = "Failed to fetch terminal details";
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
