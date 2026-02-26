import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
    activeTabBg: '#F1F5F9', // Default background
    setActiveTabBg: (color) => set({ activeTabBg: color }),
}));
