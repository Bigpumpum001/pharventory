import React from "react";
import { create } from "zustand";
import { Medicine, MedicineBatch, UpdateMedicineBatchPayload } from "@/types/medicines";

// Types for modal payloads
interface ViewBatchesPayload {
  medicine: Medicine;
  batches: MedicineBatch[] | undefined;
  showExpired?: boolean;
}

interface EditMedicinePayload {
  medicine: Medicine;
}

interface EditBatchPayload {
  medicine: Medicine | undefined;
  batch: MedicineBatch;
}

interface AdjustStockPayload {
  medicine: Medicine;
  batch?: MedicineBatch;
}

interface InventoryUIState {
  search: string;
  setSearch: (v: string) => void;

  selectedId: number | null;
  setSelectedId: (id: number | null) => void;

  // View Batches Modal
  viewBatchesOpen: boolean;
  viewBatchesPayload: ViewBatchesPayload | null;
  openViewBatches: (payload: ViewBatchesPayload) => void;
  closeViewBatches: () => void;

  // Edit Medicine Modal
  editMedicineOpen: boolean;
  editMedicinePayload: EditMedicinePayload | null;
  openEditMedicine: (payload: EditMedicinePayload) => void;
  closeEditMedicine: () => void;

  // Edit Batch Modal
  editBatchOpen: boolean;
  editBatchPayload: EditBatchPayload | null;
  openEditBatch: (payload: EditBatchPayload) => void;
  closeEditBatch: () => void;

  // Update a batch inside currently viewed batches payload
  updateBatchInView: (updatedBatch: UpdateMedicineBatchPayload) => void;

  // Update medicine in the currently viewed batches modal
  updateMedicineInView: (updatedMedicine: Partial<Medicine>) => void;

  // Adjust Stock Modal
  adjustStockOpen: boolean;
  adjustStockPayload: AdjustStockPayload | null;
  openAdjustStock: (payload: AdjustStockPayload) => void;
  closeAdjustStock: () => void;

  // Delete confirmation modal
  deleteMedicineOpen: boolean;
  deleteMedicineId: number | null;
  openDeleteMedicine: (id: number) => void;
  closeDeleteMedicine: () => void;

  // Trigger refetch medicines
  shouldRefetchMedicines: boolean;
  triggerRefetchMedicines: () => void;
  resetRefetchMedicinesTrigger: () => void;
}
export const useInventoryUI = create<InventoryUIState>((set) => ({
  search: "",
  setSearch: (v) => set({ search: v }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  viewBatchesOpen: false,
  viewBatchesPayload: null,
  openViewBatches: (payload) =>
    set({ viewBatchesOpen: true, viewBatchesPayload: payload }),
  closeViewBatches: () =>
    set({ viewBatchesOpen: false, viewBatchesPayload: null }),

  editMedicineOpen: false,
  editMedicinePayload: null,
  openEditMedicine: (payload) =>
    set({ editMedicineOpen: true, editMedicinePayload: payload }),
  closeEditMedicine: () =>
    set({ editMedicineOpen: false, editMedicinePayload: null }),

  editBatchOpen: false,
  editBatchPayload: null,
  openEditBatch: (payload) =>
    set({ editBatchOpen: true, editBatchPayload: payload }),
  closeEditBatch: () => set({ editBatchOpen: false, editBatchPayload: null }),

  // Update a batch inside currently viewed batches payload
  updateBatchInView: (updatedBatch: UpdateMedicineBatchPayload) =>
    set((prev) => {
      const payload = prev.viewBatchesPayload;
      if (!payload || !Array.isArray(payload.batches)) return {};

      const newBatches = payload.batches.map((b: MedicineBatch) => {
        // match by batch number since UpdateMedicineBatchPayload doesn't have id
        if (
          (b.batchNumber) &&
          (updatedBatch.batchNumber)
        ) {
          const bNum = b.batchNumber;
          const uNum = updatedBatch.batchNumber;
          if (bNum === uNum) return { ...b, ...updatedBatch };
        }
        return b;
      });

      return { viewBatchesPayload: { ...payload, batches: newBatches } };
    }),

  // Update medicine in the currently viewed batches modal
  updateMedicineInView: (updatedMedicine: Partial<Medicine>) =>
    set((prev) => {
      const payload = prev.viewBatchesPayload;
      if (!payload || !payload.medicine) return {};

      return {
        viewBatchesPayload: {
          ...payload,
          medicine: { ...payload.medicine, ...updatedMedicine },
        },
      };
    }),

  adjustStockOpen: false,
  adjustStockPayload: null,
  openAdjustStock: (payload) =>
    set({ adjustStockOpen: true, adjustStockPayload: payload }),
  closeAdjustStock: () =>
    set({ adjustStockOpen: false, adjustStockPayload: null }),

  deleteMedicineOpen: false,
  deleteMedicineId: null,
  openDeleteMedicine: (id) =>
    set({ deleteMedicineOpen: true, deleteMedicineId: id }),
  closeDeleteMedicine: () =>
    set({ deleteMedicineOpen: false, deleteMedicineId: null }),

  // Trigger refetch medicines
  shouldRefetchMedicines: false,
  triggerRefetchMedicines: () =>
    set({ shouldRefetchMedicines: true }),
  resetRefetchMedicinesTrigger: () =>
    set({ shouldRefetchMedicines: false }),
}));
