import urls from "../config";

const AGP_API_URL = urls.javaApiUrl;

export const deleteTerminalDetails = async (token, id) => {
    const response = await fetch(`${AGP_API_URL}/v1/terminal-details/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "*/*"
        }
    });

    if (!response.ok) {
        let errorMessage = "Failed to delete terminal details";
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
    }

    // Sometimes DELETE requests return 204 No Content
    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
    } else {
        return await response.text();
    }
};
