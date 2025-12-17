/**
 * Utility functions for accessing global session storage values
 */

/**
 * Get the current user ID from session storage
 * @returns {number|null} - The user ID or null if not found
 */
export const getUserId = () => {
    const userId = sessionStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
};

/**
 * Get the global labor rate from session storage
 * @returns {number|null} - The labor rate or null if not found
 */
export const getGlobalLaborRate = () => {
    const laborRate = sessionStorage.getItem('GlobalLaborRate');
    return laborRate ? parseFloat(laborRate) : null;
};

/**
 * Set the user ID in session storage
 * @param {number} userId - The user ID to store
 */
export const setUserId = (userId) => {
    sessionStorage.setItem('userId', userId);
};

/**
 * Set the global labor rate in session storage
 * @param {number|string} laborRate - The labor rate to store
 */
export const setGlobalLaborRate = (laborRate) => {
    sessionStorage.setItem('GlobalLaborRate', laborRate);
};

/**
 * Clear user session data
 */
export const clearUserSession = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('GlobalLaborRate');
};
