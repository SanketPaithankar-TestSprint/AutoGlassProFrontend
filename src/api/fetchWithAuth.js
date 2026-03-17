import { getValidToken } from "./getValidToken";

/**
 * A wrapper around the native fetch API that automatically injects the 
 * JWT Authorization header and handles 401 Unauthorized responses.
 * 
 * @param {string} url - The URL to fetch.
 * @param {Object} options - Standard fetch options.
 * @returns {Promise<Response>} - The fetch response.
 */
export const fetchWithAuth = async (url, options = {}) => {
    const token = getValidToken();
    
    // Merge headers
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, fetchOptions);

        if (response.status === 401) {
            console.warn("[fetchWithAuth] 401 Unauthorized detected. Redirecting to login.");
            // Clear local auth tokens to prevent infinite loops
            localStorage.removeItem("ApiToken");
            sessionStorage.removeItem("ApiToken");
            
            // Redirect to auth/login page
            // We use window.location.href for a hard redirect to ensure state is cleared
            if (window.location.pathname !== '/auth') {
                window.location.href = '/auth';
            }
            return response;
        }

        return response;
    } catch (error) {
        console.error("[fetchWithAuth] Network error:", error);
        throw error;
    }
};

/**
 * Helper for JSON-specific requests
 */
export const fetchJsonWithAuth = async (url, options = {}) => {
    const response = await fetchWithAuth(url, options);
    
    if (!response.ok) {
        let errorDetail = response.statusText;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
            // Fallback if not JSON
        }
        
        const error = new Error(errorDetail);
        error.status = response.status;
        error.response = response;
        throw error;
    }

    return response.json();
};
