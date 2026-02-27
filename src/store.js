import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useQuoteStore = create(
    persist(
        (set) => ({
            vinData: null,
            vehicleInfo: null,
            selectedParts: [],
            quoteItems: [], // To replace local state in QuotePanel
            quoteItemsVersion: 0, // Cheap dirty-state counter

            // Actions
            setVinData: (data) => set({ vinData: data }),
            setVehicleInfo: (info) => set({ vehicleInfo: info }),

            addPart: (part) => set((state) => ({
                selectedParts: [...state.selectedParts, part],
                quoteItemsVersion: state.quoteItemsVersion + 1,
            })),

            removePart: (partId) => set((state) => ({
                selectedParts: state.selectedParts.filter(p => p.id !== partId),
                quoteItemsVersion: state.quoteItemsVersion + 1,
            })),

            setQuoteItems: (updater) => set((state) => ({
                quoteItems: typeof updater === 'function' ? updater(state.quoteItems) : updater,
                quoteItemsVersion: state.quoteItemsVersion + 1,
            })),

            updateQuoteItem: (index, updatedItem) => set((state) => {
                const newItems = [...state.quoteItems];
                newItems[index] = { ...newItems[index], ...updatedItem };
                return { quoteItems: newItems, quoteItemsVersion: state.quoteItemsVersion + 1 };
            }),

            resetStore: () => set({
                vinData: null,
                vehicleInfo: null,
                selectedParts: [],
                quoteItems: [],
                quoteItemsVersion: 0,
            })
        }),
        {
            name: 'agp_quote_store', // unique name
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
            partialize: (state) => ({
                vinData: state.vinData,
                vehicleInfo: state.vehicleInfo,
                selectedParts: state.selectedParts,
                quoteItems: state.quoteItems
            }),
        }
    )
);
