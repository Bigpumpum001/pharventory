import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Receipt } from "@/types/receipts";

type DispensePayload = {
  patientName: string;
  items: { medicineId: number; quantity: number }[];
};

export default function useCompleteDispense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DispensePayload) => {
      const resp = await api.post<Receipt>("/dispense/complete", payload);
      return resp.data;
    },
    onSuccess: () => {
      // invalidate queries so UI updates
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
}
