import { create } from 'zustand';

export const useQuoteStore = create((set) => ({
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
}));
