// src/api/login.js
import urls from '../config';
import { getUserSlugByUserId } from './userSlugInfo';

/**
 * Login API call
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.usernameOrEmail - Username or email
 * @param {string} credentials.password - Password
 * @param {string} credentials.deviceType - Device type (e.g., "WEB")
 * @param {string} credentials.browserInfo - Browser information
 * @returns {Promise<Object>} - Login response with token and user data
 */
export async function loginUser({ usernameOrEmail, password, deviceType, browserInfo }) {
    const response = await fetch(`${urls.javaApiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            usernameOrEmail,
            password,
            deviceType,
            browserInfo,
        }),
    });

    const data = await response.json();
    return data;
}

/**
 * Handle post-login storage and setup
 * @param {Object} loginResponse - Response from login API
 * @param {boolean} rememberMe - Whether to persist login
 */
export function handleLoginSuccess(loginResponse, rememberMe = false) {
    const tokenStr = JSON.stringify(loginResponse);

    // Store token
    if (rememberMe) {
        localStorage.setItem("ApiToken", tokenStr);
    } else {
        sessionStorage.setItem("ApiToken", tokenStr);
    }

    // Store user data if available
    if (loginResponse.data) {
        const userData = loginResponse.data;

        // Store user ID in sessionStorage
        if (userData.userId) {
            sessionStorage.setItem('userId', userData.userId);
        }

        // Store labor rate in localStorage (using consistent naming: GlobalLaborRate)
        if (userData.laborRate !== undefined && userData.laborRate !== null) {
            localStorage.setItem('GlobalLaborRate', String(userData.laborRate));
        }

        // Store username
        if (userData.username) {
            sessionStorage.setItem('username', userData.username);
        }

        // Fetch and store User Slug
        // Note: We need the token. loginResponse usually has it.
        // loginResponse structure seems to be { success: true, data: { ... }, token: "..." } or similar based on usage.
        // Looking at login.jsx: res.data.username is accessed.
        // We will assume loginResponse.data.token or loginResponse.token exists.
        // Wait, handleLoginSuccess line 38: const tokenStr = JSON.stringify(loginResponse);
        // It saves the WHOLE response as "ApiToken".
        // Use that token for the call.
        if (userData.userId) {
            const token = loginResponse.token || (loginResponse.data && loginResponse.data.token);
            if (token) {
                getUserSlugByUserId(token, userData.userId)
                    .then(slugInfo => {
                        if (slugInfo && slugInfo.slug) {
                            localStorage.setItem('userSlug', slugInfo.slug);
                        }
                    })
                    .catch(err => console.error("Failed to fetch user slug on login", err));
            }
        }
    }
}
