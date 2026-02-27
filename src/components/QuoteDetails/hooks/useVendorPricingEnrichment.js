import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getPilkingtonPrice } from "../../../api/getVendorPrices";

/**
 * Hook to automatically enrich items with vendor (Pilkington) pricing.
 * Runs when items change, finds parts with nagsId but without vendor prices,
 * and fetches pricing via react-query with 1h cache.
 *
 * @param {Array} items - current quote items
 * @param {Function} setItems - setter for quote items
 * @param {Function} modal - Ant Design modal instance (for warnings)
 */
export function useVendorPricingEnrichment(items, setItems, modal) {
    const queryClient = useQueryClient();
    const lastVendorWarningRef = useRef(0);

    useEffect(() => {
        const fetchVendorPricingForParts = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            // Find parts that have nags_id but haven't been enriched with vendor pricing yet
            const partsNeedingPricing = items.filter(item =>
                item.type === 'Part' &&
                item.nagsId &&
                !item.vendorPriceFetched && // Flag to prevent re-fetching
                !item.isManual // Ignore manual items (fetched on Enter)
            );

            if (partsNeedingPricing.length === 0) return;

            console.log('[useVendorPricingEnrichment] Fetching vendor pricing for', partsNeedingPricing.length, 'parts');

            const pricingPromises = partsNeedingPricing.map(async (item) => {
                try {
                    let vendorPrice = null;
                    const nagsId = item.nagsId;

                    if (userId && nagsId) {
                        let partNumber = item.nagsId.trim().replace(/N$/, '');

                        vendorPrice = await queryClient.fetchQuery({
                            queryKey: ['pilkingtonPrice', userId, partNumber],
                            queryFn: () => getPilkingtonPrice(userId, partNumber),
                            staleTime: 1000 * 60 * 60
                        });
                    }

                    if (vendorPrice) {
                        const qualifiers = item.glassData?.qualifiers || [];
                        const isAftermarket = qualifiers.includes('Aftermarket');
                        const rawNags = item.glassData?.nags_id || item.nagsId;
                        const span = item.glassData?.feature_span || '';
                        const fullId = span ? `${rawNags} ${span.trim()}` : rawNags;
                        const qualifiersStr = qualifiers.join(', ');

                        return {
                            id: item.id,
                            vendorPriceFetched: true,
                            unitPrice: parseFloat(vendorPrice.UnitPrice) || item.unitPrice,
                            description: isAftermarket
                                ? `${fullId} (${qualifiersStr})`
                                : (vendorPrice.Description || item.description)
                        };
                    }

                    return { id: item.id, vendorPriceFetched: true };
                } catch (e) {
                    console.error("Vendor price fetch failed for", item.nagsId, e);
                    if (e.message && e.message.includes("No vendor credentials found")) {
                        const now = Date.now();
                        if (now - lastVendorWarningRef.current > 5000) {
                            lastVendorWarningRef.current = now;
                            modal?.warning?.({
                                title: 'Missing Vendor Credentials',
                                content: 'No vendor credentials found for Your Account. Please configure credentials first.',
                            });
                        }
                    }
                    return { id: item.id, vendorPriceFetched: true };
                }
            });

            const pricingResults = await Promise.all(pricingPromises);

            setItems(prev => prev.map(item => {
                const pricingUpdate = pricingResults.find(p => p.id === item.id);
                if (pricingUpdate) {
                    const updatedItem = {
                        ...item,
                        ...pricingUpdate
                    };
                    if (pricingUpdate.unitPrice) {
                        updatedItem.amount = (Number(updatedItem.qty) || 0) * pricingUpdate.unitPrice;
                    }
                    return updatedItem;
                }
                return item;
            }));
        };

        fetchVendorPricingForParts();
    }, [items]); // Run when items change
}
