export const PAGE_BACKGROUND_COLORS = {
    '/analytics': '#f1f5f9', // slate-100
    '/customers': '#f1f5f9', // slate-100 (filters toggle white)
    '/quote': '#f1f5f9', // slate-100
    '/schedule': '#f8fafc', // slate-50
    '/jobs': '#f8fafc', // slate-50
    '/reports': '#f1f5f9', // slate-100
    '/inquiries': '#f1f5f9', // slate-100
    '/attendance': '#f8fafc', // slate-50
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
