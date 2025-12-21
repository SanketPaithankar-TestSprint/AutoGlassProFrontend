import urls from "../config";
import { getValidToken } from "./getValidToken";

export const deleteAttachment = async (attachmentId) => {
    try {
        const token = getValidToken();
        if (!token) throw new Error("No valid authentication token found.");

        const response = await fetch(`${urls.javaApiUrl}/v1/attachments/${attachmentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "accept": "*/*"
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete attachment: ${response.status} ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error("Error deleting attachment:", error);
        throw error;
    }
};
