export const PAGE_BACKGROUND_COLORS = {
    '/analytics': '#f1f5f9', // slate-100
    '/customers': '#f1f5f9', // slate-100 (filters toggle white)
    '/search-by-root': '#f1f5f9', // slate-100
    '/schedule': '#f8fafc', // slate-50
    '/open': '#f8fafc', // slate-50
    '/reports': '#f1f5f9', // slate-100
    '/service-contact-form': '#f1f5f9', // slate-100
    '/employee-attendance': '#f8fafc', // slate-50
    '/chat': '#f1f5f9', // slate-100
    '/profile': '#f9fafb', // gray-50 (sub-menu toggles white)
};

export const getPageBackground = (pathname) => {
    if (!pathname) return '#f1f5f9';

    // Try exact match first
    if (PAGE_BACKGROUND_COLORS[pathname]) {
        return PAGE_BACKGROUND_COLORS[pathname];
    }

    // Then try prefix match for nested routes
    for (const [path, color] of Object.entries(PAGE_BACKGROUND_COLORS)) {
        if (pathname.startsWith(path)) {
            return color;
        }
    }

    // Default fallback if unknown route (assumes slate-100)
    return '#f1f5f9';
};
