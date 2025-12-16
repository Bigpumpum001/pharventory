import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ReorderItemState = {
  id: number;
  name: string;
  genericName: string;
  unitId?: number;
  unitName?: string;
  price: number;
  totalStock?: number;
  quantity: number;
};

type AddItemPayload = {
  id: number;
  name: string;
  genericName: string;
  unitId?: number;
  unitName?: string;
  price: number;
  totalStock?: number;
};

interface ReorderUIState {
  selectedItems: ReorderItemState[];
  addItem: (payload: AddItemPayload) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  resetItems: () => void;
}

export const useMedicineStore = create<ReorderUIState>()(
  persist(
    (set) => ({
      selectedItems: [],

      addItem: (payload) =>
        set((state) => {
          const exists = state.selectedItems.find(
            (item) => item.id === payload.id
          );
          if (exists) {
            return {
              selectedItems: state.selectedItems.map((item) =>
                item.id === payload.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        (item.totalStock ?? Infinity),
                        item.quantity + 1
                      ),
                    }
                  : item
              ),
            };
          }

          return {
            selectedItems: [
              ...state.selectedItems,
              {
                ...payload,
                quantity: Math.max(1, Math.min(payload.totalStock ?? Infinity, 1)),
              },
            ],
          };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          selectedItems: state.selectedItems.map((item) => {
            if (item.id !== id) return item;
            const minQ = 1;
            const maxQ = item.totalStock ?? Infinity;
            const q = Math.max(minQ, Math.min(quantity, maxQ));
            return { ...item, quantity: q };
          }),
        })),

      removeItem: (id) =>
        set((state) => ({
          selectedItems: state.selectedItems.filter((item) => item.id !== id),
        })),

      resetItems: () => set({ selectedItems: [] }),
    }),
    {
      name: "reorder-store",
    }
  )
);
