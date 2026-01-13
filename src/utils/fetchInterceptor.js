
export const setupFetchInterceptor = () => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
        try {
            const response = await originalFetch(...args);

            // Check for Unauthorized (401)
            // Check for Unauthorized (401)
            // But skip for specific endpoints that might legitimately return 401/404 without needing full logout
            // e.g. checking if a slug exists might return 401/403/404 depending on backend
            if (response.status === 401) {
                const url = args[0] || "";
                if (typeof url === "string" && url.includes("/user-slug-info")) {
                    // Do not redirect for slug info checks
                    console.warn("Suppressing 401 redirect for user-slug-info");
                } else if (!window.location.pathname.includes('/auth')) {
                    console.warn("Unauthorized access detected. Redirecting to login...");

                    // Clear all storage
                    localStorage.clear();
                    sessionStorage.clear();

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
