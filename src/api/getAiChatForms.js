import { fetchWithAuth } from './fetchWithAuth';
import config from '../config';

const BASE_URL = `${config.pythonApiUrl}agp/v1/ai-contact-forms`;

/**
 * Fetch all AI chat contact forms for the authenticated user.
 * The user is identified by the Bearer JWT token (sub claim = user_id).
 * @returns {Promise<{ user_id: number, count: number, forms: Array }>}
 */
export const getAiChatForms = async () => {
    const response = await fetchWithAuth(BASE_URL, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed with status ${response.status}`);
    }

    return response.json();
};
