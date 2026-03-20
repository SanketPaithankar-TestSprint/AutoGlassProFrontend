import urls from "../config";

export async function getVendorContacts(token) {
    const url = `${urls.javaApiUrl}/v1/vendor-contacts`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch vendor contacts:", error);
        throw error;
    }
}

export async function createVendorContact(token, data) {
    const url = `${urls.javaApiUrl}/v1/vendor-contacts`;
    // The API expects an array: curl -d '[{...}]'
    const payload = Array.isArray(data) ? data : [data];
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "accept": "*/*",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to create vendor contact:", error);
        throw error;
    }
}

export async function updateVendorContact(token, id, data) {
    const url = `${urls.javaApiUrl}/v1/vendor-contacts/${id}`;
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "accept": "*/*",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to update vendor contact:", error);
        throw error;
    }
}

export async function deleteVendorContact(token, id) {
    const url = `${urls.javaApiUrl}/v1/vendor-contacts/${id}`;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        // DELETE might return 204 No Content or success message
        if (response.status === 204) return { success: true };
        return await response.json();
    } catch (error) {
        console.error("Failed to delete vendor contact:", error);
        throw error;
    }
}
