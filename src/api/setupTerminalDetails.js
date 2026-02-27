import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const setupTerminalDetails = async (token, payload) => {
    const response = await fetch(`${AGP_API_URL}/v1/terminal-details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "Accept": "*/*"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMessage = "Failed to setup terminal details";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        return await response.text();
    }
};
