
export const setupFetchInterceptor = () => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);

            // Check for Unauthorized (401)
            if (response.status === 401) {
                console.warn("Unauthorized access detected. Redirecting to login...");

                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to login page
                // We use window.location because we might be outside of React context
                // and we want a hard reset anyway.
                if (!window.location.pathname.includes('/auth')) {
                    window.location.href = '/auth';
                }
            }

            return response;
        } catch (error) {
            // Network errors or other fetch issues
            throw error;
        }
    };
};
