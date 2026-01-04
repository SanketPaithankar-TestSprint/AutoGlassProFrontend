import { useQuery } from '@tanstack/react-query';
import { getPilkingtonPrice } from '../api/getVendorPrices';
import { getUserKitPrices } from '../api/userKitPrices';

/**
 * Hook to fetch Pilkington vendor price for a part.
 * @param {string|number} userId - The user ID.
 * @param {string} partNumber - The part number.
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export const usePilkingtonPrice = (userId, partNumber) => {
    return useQuery({
        queryKey: ['pilkingtonPrice', userId, partNumber],
        queryFn: () => getPilkingtonPrice(userId, partNumber),
        enabled: !!userId && !!partNumber,
        staleTime: 1000 * 60 * 60, // 1 hour
        retry: 1,
    });
};

/**
 * Hook to fetch all kit prices for the authenticated user.
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export const useKitPrices = () => {
    return useQuery({
        queryKey: ['kitPrices'],
        queryFn: getUserKitPrices,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
