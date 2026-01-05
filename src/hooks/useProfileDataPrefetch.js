import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getValidToken } from '../api/getValidToken';
import { getProfile } from '../api/getProfile';
import { getCustomers } from '../api/getCustomers';
import { getEmployees } from '../api/getEmployees';
import { getDistributorCredentials } from '../api/getDistributorCredentials';
import { getUserKitPrices } from '../api/userKitPrices';
import { getTaxRates } from '../api/taxRateApi';
import { getAllSmtpConfigs } from '../api/getAllSmtpConfigs';

export const useProfileDataPrefetch = (isAuthed) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthed) return;

        const token = getValidToken();
        if (!token) return;

        const prefetch = async () => {
            try {
                // Profile
                await queryClient.prefetchQuery({
                    queryKey: ['profile'],
                    queryFn: async () => {
                        const res = await getProfile(token);
                        localStorage.setItem("agp_profile_data", JSON.stringify(res));
                        return res;
                    }
                });

                // Customers - PREFETCH REMOVED PER USER REQUEST
                // await queryClient.prefetchQuery({
                //     queryKey: ['customers'],
                //     queryFn: async () => {
                //         const res = await getCustomers(token);
                //         return Array.isArray(res) ? res : [];
                //     }
                // });

                // Employees
                await queryClient.prefetchQuery({
                    queryKey: ['employees'],
                    queryFn: async () => {
                        const res = await getEmployees(token);
                        return Array.isArray(res) ? res : [];
                    }
                });

                // Distributor Credentials
                await queryClient.prefetchQuery({
                    queryKey: ['distributorCredentials'],
                    queryFn: () => getDistributorCredentials(token)
                });

                // User Kit Prices
                await queryClient.prefetchQuery({
                    queryKey: ['userKitPrices'],
                    queryFn: async () => {
                        const res = await getUserKitPrices();
                        localStorage.setItem("user_kit_prices", JSON.stringify(res));
                        return res;
                    }
                });

                // Tax Rates
                await queryClient.prefetchQuery({
                    queryKey: ['taxRates'],
                    queryFn: async () => {
                        const data = await getTaxRates();
                        return Array.isArray(data) ? data : [];
                    }
                });

                // SMTP Configs
                await queryClient.prefetchQuery({
                    queryKey: ['smtpConfigs'],
                    queryFn: async () => {
                        const data = await getAllSmtpConfigs();
                        return Array.isArray(data) ? data : [];
                    }
                });

                console.log("Profile data prefetching initiated.");
            } catch (err) {
                console.error("Error prefetching profile data:", err);
            }
        };

        prefetch();

    }, [isAuthed, queryClient]);
};
