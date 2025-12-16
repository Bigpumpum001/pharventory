import { api } from "@/lib/api/axios";
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  CreateMedicinePayload,
  Medicine,
  UpdateMedicinePayload,
} from "@/types/medicines";

const MEDICINES_QUERY_KEY = ["medicines"];

// type CreateMutation = UseMutationResult<
//   Medicine,
//   unknown,
//   CreateMedicinePayload
// >;

// type UpdateMutation = UseMutationResult<
//   Medicine,
//   unknown,
//   { id: number; payload: UpdateMedicinePayload }
// >;

// type DeleteMutation = UseMutationResult<void, unknown, number>;

interface UseMedicinesResult {
  medicinesQuery: UseQueryResult<Medicine[], unknown>;
  createMedicine: UseMutationResult<
    Medicine,
    unknown,
    CreateMedicinePayload,
    unknown
  >;
  updateMedicine: UseMutationResult<
    Medicine,
    unknown,
    { id: number; payload: UpdateMedicinePayload },
    unknown
  >;
}

export default function useMedicines(
  showExpired?: boolean
): UseMedicinesResult {
  const queryClient = useQueryClient();

  const medicinesQuery = useQuery<Medicine[]>({
    queryKey: [MEDICINES_QUERY_KEY, showExpired],
    queryFn: async () => {
      const response = await api.get<Medicine[]>("/medicines", {
        params: { expired: showExpired },
      });
      return response.data;
    },
    // keepPreviousData: true,
  });

  const createMedicine = useMutation({
    mutationFn: async (payload: CreateMedicinePayload) => {
      const response = await api.post<Medicine>("/medicines", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
    },
  });

  const updateMedicine = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMedicinePayload;
    }) => {
      const response = await api.patch<Medicine>(`/medicines/${id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
    },
  });

  // const deleteMedicine = useMutation({
  //   mutationFn: async (id: number) => {
  //     await api.delete(`/medicines/${id}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: MEDICINES_QUERY_KEY });
  //   },
  // });

  return {
    medicinesQuery,
    createMedicine,
    updateMedicine,
  };
}
