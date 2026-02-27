import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSpecialInstructions } from "../../../api/specialInstructions";
import { getValidToken } from "../../../api/getValidToken";

/**
 * Hook to fetch and cache user special instructions.
 * Uses react-query with 24h stale time and localStorage caching.
 */
export function useSpecialInstructions() {
    const token = getValidToken();

    const { data: specialInstructions } = useQuery({
        queryKey: ['specialInstructions'],
        queryFn: async () => {
            if (!token) return "";
            try {
                const cached = localStorage.getItem("user_special_instructions");
                if (cached) return cached;

                const res = await getSpecialInstructions(token);
                if (res) localStorage.setItem("user_special_instructions", res);
                return res || "";
            } catch (e) {
                console.error("Failed to fetch special instructions", e);
                return "";
            }
        },
        initialData: () => localStorage.getItem("user_special_instructions") || "",
        staleTime: 1000 * 60 * 60 * 24 // 24 hours stale time
    });

    return specialInstructions;
}
