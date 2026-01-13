// src/api/publicContactForm.js
import urls from '../config';

/**
 * Validate a business slug and get business information
 * @param {string} slug - The business slug to validate
 * @returns {Promise<Object>} - Business info if valid, error if invalid
 */
export async function validateSlug(slug) {
    const response = await fetch(`${urls.pythonApiUrl}agp/v1/user-by-slug/${slug}`, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to validate slug');
    }

    const data = await response.json();
    return data;
}

/**
 * Send a message to the AI chat endpoint
 * @param {string} sessionId - Unique session identifier
 * @param {string} message - User's message
 * @param {number} userId - User ID from slug validation
 * @returns {Promise<Object>} - AI response with message, options, and collected data
 */
export async function sendAiChatMessage(sessionId, message, userId) {
    const response = await fetch(`${urls.pythonApiUrl}agp/v1/ai-chat`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId,
            message: message,
            user_id: userId,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data;
}
