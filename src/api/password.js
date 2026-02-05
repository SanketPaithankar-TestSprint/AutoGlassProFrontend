import urls from '../config';

/**
 * Request a password reset OTP.
 * @param {string} email - User's email address.
 * @returns {Promise<Object>} - API response.
 */
export async function requestPasswordResetOtp(email) {
    const response = await fetch(`${urls.javaApiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    return await response.json();
}

/**
 * Reset password using OTP.
 * @param {string} email - User's email address.
 * @param {string} otp - OTP sent to user's email.
 * @param {string} newPassword - New password to set.
 * @returns {Promise<Object>} - API response.
 */
export async function resetPasswordWithOtp(email, otp, newPassword) {
    const response = await fetch(`${urls.javaApiUrl}/auth/reset-password-otp`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
    });

    return await response.json();
}
