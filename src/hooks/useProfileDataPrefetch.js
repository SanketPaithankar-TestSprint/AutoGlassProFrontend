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
import { getUserAdasPrices } from '../api/userAdasPrices';
import { getSpecialInstructions } from '../api/specialInstructions';

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
                        const data = Array.isArray(res) ? res : [];
                        localStorage.setItem("agp_employees", JSON.stringify(data));
                        return data;
                    }
                });

                // Distributor Credentials
                await queryClient.prefetchQuery({
                    queryKey: ['distributorCredentials'],
                    queryFn: async () => {
                        const res = await getDistributorCredentials(token);
                        localStorage.setItem("agp_distributor_creds", JSON.stringify(res));
                        return res;
                    }
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
                        const rates = Array.isArray(data) ? data : [];
                        localStorage.setItem("agp_tax_rates", JSON.stringify(rates));
                        return rates;
                    }
                });

                // SMTP Configs
                await queryClient.prefetchQuery({
                    queryKey: ['smtpConfigs'],
                    queryFn: async () => {
                        const data = await getAllSmtpConfigs();
                        const configs = Array.isArray(data) ? data : [];
                        localStorage.setItem("agp_smtp_configs", JSON.stringify(configs));
                        return configs;
                    }
                });

                // User ADAS Prices
                await queryClient.prefetchQuery({
                    queryKey: ['userAdasPrices'],
                    queryFn: async () => {
                        const res = await getUserAdasPrices();
                        localStorage.setItem("user_adas_prices", JSON.stringify(res));
                        return res;
                    }
                });

                // Special Instructions
                await queryClient.prefetchQuery({
                    queryKey: ['specialInstructions'],
                    queryFn: async () => {
                        try {
                            const res = await getSpecialInstructions(token);
                            localStorage.setItem("user_special_instructions", res || "");
                            return res;
                        } catch (e) {
                            console.error("Failed to prefetch special instructions", e);
                            return "";
                        }
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
