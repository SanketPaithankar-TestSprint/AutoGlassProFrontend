import urls from '../config';
import { getUserSlugByUserId } from './userSlugInfo';
import { getUserLogo } from './getUserLogo';
import { getSpecialInstructions } from './specialInstructions';

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
                // Fetch and store user slug
                getUserSlugByUserId(token, userData.userId)
                    .then(slugInfo => {
                        if (slugInfo && slugInfo.slug) {
                            localStorage.setItem('userSlug', slugInfo.slug);
                        }
                    })
                    .catch(err => console.error("Failed to fetch user slug on login", err));

                // Fetch and store user logo
                // Check if we already have it? The requirement says "check if independent", 
                // but usually login implies a fresh start. We will fetch and update.
                getUserLogo()
                    .then(logoData => {
                        if (logoData) {
                            localStorage.setItem('userLogo', logoData);
                        } else {
                            localStorage.removeItem('userLogo');
                        }
                        // Dispatch custom event to notify Sidebar and other components
                        window.dispatchEvent(new Event('userLogoUpdated'));
                    })
                    .catch(err => console.error("Failed to fetch user logo on login", err));

                // Fetch and store special instructions
                getSpecialInstructions(token)
                    .then(instructions => {
                        if (instructions !== null) {
                            localStorage.setItem('user_special_instructions', instructions);
                        } else {
                            localStorage.removeItem('user_special_instructions');
                        }
                    })
                    .catch(err => console.error("Failed to fetch special instructions on login", err));
            }
        }
    }
}
