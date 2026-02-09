import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useQuoteStore = create(
    persist(
        (set) => ({
            vinData: null,
            vehicleInfo: null,
            selectedParts: [],
            quoteItems: [], // To replace local state in QuotePanel

            // Actions
            setVinData: (data) => set({ vinData: data }),
            setVehicleInfo: (info) => set({ vehicleInfo: info }),

            addPart: (part) => set((state) => ({
                selectedParts: [...state.selectedParts, part]
            })),

            removePart: (partId) => set((state) => ({
                selectedParts: state.selectedParts.filter(p => p.id !== partId)
            })),

            setQuoteItems: (updater) => set((state) => ({
                quoteItems: typeof updater === 'function' ? updater(state.quoteItems) : updater
            })),

            updateQuoteItem: (index, updatedItem) => set((state) => {
                const newItems = [...state.quoteItems];
                newItems[index] = { ...newItems[index], ...updatedItem };
                return { quoteItems: newItems };
            }),

            resetStore: () => set({
                vinData: null,
                vehicleInfo: null,
                selectedParts: [],
                quoteItems: []
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
