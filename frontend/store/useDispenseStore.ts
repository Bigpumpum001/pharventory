import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DispenseItemState = {
  id: number;
  name: string;
  genericName: string;
  unitId?: number;
  unitName?: string;
  price: number;
  totalStock?: number;
  quantity: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
  imageUrl?: string;
};

type AddItemPayload = {
  id: number;
  name: string;
  genericName: string;
  unitId?: number;
  unitName?: string;
  price: number;
  totalStock?: number;
  imageUrl?: string;
};

interface DispenseUIState {
  selectedItems: DispenseItemState[];
  addItem: (payload: AddItemPayload) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateInstruction: (
    id: number,
    field: "dosage" | "frequency" | "duration",
    value: string
  ) => void;
  removeItem: (id: number) => void;
  resetItems: () => void;
}

export const useDispenseStore = create<DispenseUIState>()(
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
                dosage: "",
                frequency: "",
                duration: "",
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

      updateInstruction: (id, field, value) =>
        set((state) => ({
          selectedItems: state.selectedItems.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({
          selectedItems: state.selectedItems.filter((item) => item.id !== id),
        })),

      resetItems: () => set({ selectedItems: [] }),
    }),
    {
      name: "dispense-store",
    }
  )
);
