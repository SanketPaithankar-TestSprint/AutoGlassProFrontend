import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to load and sync user profile data from localStorage.
 * Listens for 'storage' and 'focus' events to pick up cross-tab changes.
 * Also syncs special instructions into react-query cache.
 */
export function useUserProfileSync() {
    const queryClient = useQueryClient();

    const [userProfile, setUserProfile] = useState(() => {
        try {
            const saved = localStorage.getItem("agp_profile_data");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to parse user profile", e);
            return null;
        }
    });

    useEffect(() => {
        const loadProfile = () => {
            try {
                // Update Special Instructions if changed in another tab
                const instructions = localStorage.getItem("user_special_instructions");
                if (instructions !== null) {
                    queryClient.setQueryData(['specialInstructions'], instructions);
                }

                const saved = localStorage.getItem("agp_profile_data");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setUserProfile(prev => {
                        // Deep comparison to prevent unnecessary re-renders
                        if (JSON.stringify(prev) === JSON.stringify(parsed)) {
                            return prev;
                        }
                        return parsed;
                    });
                }
            } catch (e) {
                console.error("Failed to load profile/instructions update", e);
            }
        };

        window.addEventListener('storage', loadProfile);
        window.addEventListener('focus', loadProfile);
        loadProfile();

        return () => {
            window.removeEventListener('storage', loadProfile);
            window.removeEventListener('focus', loadProfile);
        };
    }, [queryClient]);

    return userProfile;
}
