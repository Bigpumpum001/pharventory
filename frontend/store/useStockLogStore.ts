import { create } from "zustand";

interface StockLogUIState {
  search: string;
  selectedActions: string[];
  setSearch: (value: string) => void;
  toggleAction: (action: string) => void;
  clearFilters: () => void;
}

export const useStockLogStore = create<StockLogUIState>((set) => ({
  search: "",
  selectedActions: [],
  setSearch: (value) => set({ search: value }),
  toggleAction: (action) =>
    set((state) => ({
      selectedActions: state.selectedActions.includes(action)
        ? state.selectedActions.filter((item) => item !== action)
        : [...state.selectedActions, action],
    })),
  clearFilters: () => set({ search: "", selectedActions: [] }),
}));
