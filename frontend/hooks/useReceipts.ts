import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { Receipt } from "@/types/receipts";

const RECEIPTS_QUERY_KEY = ["receipts"];

interface UseReceiptsResult {
  receiptsQuery: UseQueryResult<Receipt[], unknown>;
  findReceiptById: (id: number) => Promise<Receipt | null>;
}

export default function useReceipts(): UseReceiptsResult {
  const receiptsQuery = useQuery<Receipt[]>({
    queryKey: RECEIPTS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<Receipt[]>("/receipts");
      return response.data;
    },
  });

  // Find receipt by id (fetches /api/receipts/:id)
  const findReceiptById = async (id: number): Promise<Receipt | null> => {
    try {
      const response = await api.get<Receipt>(`/receipts/${id}`);
      return response.data ?? null;
    } catch (err) {
      // log error for debugging
      console.error("findReceiptById error:", err);
      return null;
    }
  };

  return {
    receiptsQuery,
    findReceiptById,
  };
}
