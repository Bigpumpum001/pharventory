import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { StockLog } from "@/types/stock-log";

const STOCK_LOGS_QUERY_KEY = ["stockLogs"];

interface UseStockLogsResult {
  stockLogsQuery: UseQueryResult<StockLog[], unknown>;
}

export default function useStockLogs(): UseStockLogsResult {
  const stockLogsQuery = useQuery<StockLog[]>({
    queryKey: STOCK_LOGS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<StockLog[]>("/stock-logs");
      return response.data;
    },
  });
  return { stockLogsQuery };
}
