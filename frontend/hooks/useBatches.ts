import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { MedicineBatch, UpdateMedicineBatchPayload } from "@/types/medicines";

export function useBatches() {
  const queryClient = useQueryClient();

  const batchesQuery = useQuery<MedicineBatch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const res = await api.get<MedicineBatch[]>("/medicine-batches");
      return res.data;
    },
  });

  const updateBatchMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMedicineBatchPayload;
    }) => {
      const res = await api.patch(`/medicine-batches/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      // alert("Batch updated successfully2");
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });

  const adjustBatchQuantityMutation = useMutation({
    mutationFn: async ({
      id,
      quantity,
      note,
    }: {
      id: number;
      quantity: number;
      note?: string;
    }) => {
      const res = await api.patch(`/medicine-batches/${id}`, {
        quantity,
        note,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });

  // const deleteBatchMutation = useMutation({
  //   mutationFn: async (id: number) => {
  //     await api.delete(`/medicine-batches/${id}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["batches"] });
  //   },
  // });

  return {
    batchesQuery,
    updateBatchMutation,
    adjustBatchQuantityMutation,
    // deleteBatchMutation,
  };
}

// Keep individual exports for backward compatibility
export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMedicineBatchPayload;
    }) => {
      const res = await api.patch(`/medicine-batches/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useAdjustBatchQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      quantity,
      note,
    }: {
      id: number;
      quantity: number;
      note?: string;
    }) => {
      const res = await api.patch(`/medicine-batches/${id}`, {
        quantity,
        note,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

// export function useDeleteBatch() {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (id: number) => {
//       await api.delete(`/medicine-batches/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["batches"] });
//     },
//   });
// }

// New hooks for enhanced batch operations
export function useAddBatchToMedicine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      medicineId,
      batchNumber,
      quantity,
      expiryDate,
    }: {
      medicineId: number;
      batchNumber: string;
      quantity: number;
      expiryDate: string;
    }) => {
      const res = await api.post(`/medicine-batches`, {
        medicineId,
        batchNumber,
        quantity,
        expiryDate,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useAddQuantityToBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      batchId,
      quantity,
      note,
    }: {
      batchId: number;
      quantity: number;
      note?: string;
    }) => {
      const res = await api.patch(`/medicine-batches/${batchId}/add-quantity`, {
        quantity,
        note,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },
  });
}

export function useGetBatchesByMedicine(medicineId?: number) {
  return useQuery({
    queryKey: ["batches", "medicine", medicineId],
    queryFn: async () => {
      if (!medicineId) return [];
      const res = await api.get(`/medicine-batches/medicine/${medicineId}`);
      return res.data;
    },
    enabled: !!medicineId, // Only fetch when medicineId is provided
  });
}

// Hook for Excel import operations
// export function useImportExcel() {
//   const queryClient = useQueryClient();

//   const parseExcelMutation = useMutation({
//     mutationFn: async ({ file, importType }: {
//       file: File;
//       importType: "medicine_batch" | "medicine_only" | "batch_only";
//     }) => {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("importType", importType);

//       const res = await api.post(`/import-excel/parse`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       return res.data;
//     },
//   });

//   const confirmImportMutation = useMutation({
//     mutationFn: async ({ cacheKey, importType, selectedRows }: {
//       cacheKey: string;
//       importType: "medicine_batch" | "medicine_only" | "batch_only";
//       selectedRows: number[];
//     }) => {
//       const res = await api.post(`/import-excel/confirm`, {
//         cacheKey,
//         importType,
//         selectedRows,
//       });
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["medicines"] });
//       queryClient.invalidateQueries({ queryKey: ["batches"] });
//     },
//   });

//   return {
//     parseExcelMutation,
//     confirmImportMutation,
//   };
// }
