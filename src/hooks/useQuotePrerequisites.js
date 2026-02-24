import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';

/**
 * Tracks the readiness of all prerequisite API data needed for the Quote page.
 * It monitors the React Query cache for the query keys populated by useProfileDataPrefetch.
 * Returns { isLoading, loadingItems } where loadingItems is a list of human-readable labels
 * for the APIs that are still in-flight.
 */

const PREREQUISITE_QUERIES = [
    { key: 'profile', label: 'Loading your profile...' },
    { key: 'employees', label: 'Loading employee list...' },
    { key: 'distributorCredentials', label: 'Loading distributor settings...' },
    { key: 'userKitPrices', label: 'Loading kit pricing...' },
    { key: 'taxRates', label: 'Loading tax rates...' },
    { key: 'smtpConfigs', label: 'Loading email configuration...' },
    { key: 'userAdasPrices', label: 'Loading ADAS pricing...' },
    { key: 'specialInstructions', label: 'Loading special instructions...' },
];

export const useQuotePrerequisites = () => {
    const queryClient = useQueryClient();
    const [loadingItems, setLoadingItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        const checkQueries = () => {
            const stillLoading = [];

            for (const q of PREREQUISITE_QUERIES) {
                const state = queryClient.getQueryState([q.key]);
                // Consider it "still loading" if:
                //  - no cached state yet (prefetch hasn't started/finished)
                //  - OR the query is currently fetching
                if (!state || state.status === 'pending') {
                    stillLoading.push(q.label);
                }
            }

            setLoadingItems(stillLoading);

            if (stillLoading.length === 0) {
                setIsLoading(false);
                // Stop polling once everything is resolved
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        };

        // Run immediately
        checkQueries();

        // Poll the query cache every 300ms until all queries are resolved
        if (!intervalRef.current) {
            intervalRef.current = setInterval(checkQueries, 300);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [queryClient]);

    return { isLoading, loadingItems };
};
