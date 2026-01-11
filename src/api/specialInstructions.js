import urls from "../config";

export const getSpecialInstructions = async (token) => {
    const url = `${urls.javaApiUrl}/v1/users/special-instructions`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // The API returns the string directly, which might be in JSON format or just plain text? 
        // User request says: respons as "string".
        // If it returns a JSON string like "some text", response.json() will parse it to `some text`.
        // If it returns raw text, response.text() is better. 
        // Typically JSON APIs return valid JSON values. A string in JSON is "string".
        // Let's assume it returns a JSON-encoded string.
        const text = await response.text();
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (e) {
            // If response is not valid JSON, return as plain text
            return text;
        }
    } catch (error) {
        console.error("Failed to fetch special instructions:", error);
        throw error;
    }
};

export const saveSpecialInstructions = async (token, instructions) => {
    const url = `${urls.javaApiUrl}/v1/users/special-instructions`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(instructions) // Instructions is likely a string, so JSON.stringify("text") -> "\"text\""
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        // POST might return the saved string or something else, but we don't strictly need the return if ok.
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        throw error;
    }
};

export const updateSpecialInstructions = async (token, instructions) => {
    const url = `${urls.javaApiUrl}/v1/users/special-instructions`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(instructions)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    } catch (error) {
        throw error;
    }
};
