// src/utils/sessionUtils.js

/**
 * Generate a unique session ID (UUID v4)
 * @returns {string} - UUID string
 */
export function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Get or create a session ID for the contact form
 * @param {string} slug - Business slug for unique session per business
 * @returns {string} - Session ID
 */
export function getOrCreateSessionId(slug) {
    const storageKey = `contact_session_${slug}`;
    let sessionId = sessionStorage.getItem(storageKey);

    if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
}

/**
 * Clear the session ID for a given slug (for starting new inquiry)
 * @param {string} slug - Business slug
 */
export function clearSessionId(slug) {
    const storageKey = `contact_session_${slug}`;
    sessionStorage.removeItem(storageKey);
}
