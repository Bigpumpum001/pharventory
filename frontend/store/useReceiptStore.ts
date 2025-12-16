import { create } from "zustand";

export type ReceiptRange = "all" | "today" | "7days" | "30days";

interface ReceiptUIState {
  search: string;
  range: ReceiptRange;
  setSearch: (value: string) => void;
  setRange: (value: ReceiptRange) => void;
}

export const useReceiptStore = create<ReceiptUIState>((set) => ({
  search: "",
  range: "all",
  setSearch: (value) => set({ search: value }),
  setRange: (value) => set({ range: value }),
}));
