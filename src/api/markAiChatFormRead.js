import { fetchWithAuth } from './fetchWithAuth';
import config from '../config';

/**
 * Update the read status of an AI chat contact form.
 * @param {string} sessionId - The session ID of the form.
 * @param {boolean} isRead - The new read status (default true).
 * @returns {Promise<Object>}
 */
export const markAiChatFormRead = async (sessionId, isRead = true) => {
    const url = `${config.pythonApiUrl}agp/v1/ai-contact-forms/${sessionId}/read`;
    const response = await fetchWithAuth(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_read: isRead }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed with status ${response.status}`);
    }

    return response.json();
};
