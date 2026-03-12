import urls from "../config";
import { getValidToken } from "./getValidToken";

const buildNotificationSettingsUrl = () => {
    const base = (urls.javaApiUrl || "").replace(/\/+$/, "");
    const apiBase = base.endsWith("/api") ? base : `${base}/api`;
    return `${apiBase}/v1/users/me/notification-settings`;
};

export const getNotificationSettings = async () => {
    const token = getValidToken();

    if (!token) {
        throw new Error("No authentication token found.");
    }

    const response = await fetch(buildNotificationSettingsUrl(), {
        method: "GET",
        headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch notification settings: ${response.status} ${errorText}`);
    }

    return response.json();
};
