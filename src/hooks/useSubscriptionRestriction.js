import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSubscriptionRestriction = () => {
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkRestriction = () => {
            // 1. Get User Profile
            const profileStr = localStorage.getItem("agp_profile_data");
            if (!profileStr) return;

            try {
                const profile = JSON.parse(profileStr);

                // Only apply valid restriction if plan is specifically TEST
                if (profile.subscriptionPlan === "TEST") {

                    // 2. Define Allowed Paths
                    // QuoteDetails is a child of SearchByRoot, so allowing search-by-root covers it.
                    // Also allow basic auth/home paths.
                    const allowedPaths = [
                        '/search-by-root',
                        '/auth',
                        '/',
                        '/login',
                        '/set-password'
                    ];

                    // Check if current path is allowed
                    const isAllowed = allowedPaths.some(path =>
                        location.pathname === path || location.pathname.startsWith(path + '/')
                    );

                    if (!isAllowed) {
                        setShowModal(true);
                    } else {
                        setShowModal(false);
                    }
                } else {
                    setShowModal(false);
                }
            } catch (e) {
                console.error("Failed to parse user profile for restriction check", e);
            }
        };

        checkRestriction();
    }, [location.pathname]);

    return { showModal };
};
