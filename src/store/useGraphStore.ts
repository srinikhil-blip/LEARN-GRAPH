import { create } from "zustand";

interface GraphStoreState {
  selectedConcept: string;
  searchQuery: string;
  zoomLevel: number;
  filterStatus: string | null;
  sidebarOpen: boolean;
  setSelectedConcept: (name: string) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: string | null) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useGraphStore = create<GraphStoreState>((set) => ({
  selectedConcept: "Limits",
  searchQuery: "",
  zoomLevel: 1,
  filterStatus: null,
  sidebarOpen: true,
  setSelectedConcept: (name) => set({ selectedConcept: name, sidebarOpen: true }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  zoomIn: () => set((s) => ({ zoomLevel: Math.min(s.zoomLevel + 0.15, 2.0) })),
  zoomOut: () => set((s) => ({ zoomLevel: Math.max(s.zoomLevel - 0.15, 0.6) })),
  resetZoom: () => set({ zoomLevel: 1.0 }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),
}));
