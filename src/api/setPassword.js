import urls from '../config';

/**
 * Set Password API call
 * @param {string} token - Verification token
 * @param {string} password - New password
 * @returns {Promise<Object>} - Response data
 */
export async function setPassword(token, password) {
    const response = await fetch(`${urls.javaApiUrl}/auth/set-password`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token,
            newPassword: password
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to set password');
    }

    // Backend might return text or JSON, handling both safety
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}
