import { api } from "@/lib/api/axios";
import { CreateUnitPayload, Unit } from "@/types/unit";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";

const UNITS_QUERY_KEY = ["units"];

interface UseUnitsResult {
  unitsQuery: UseQueryResult<Unit[], unknown>;
  createUnit: UseMutationResult<Unit, unknown, CreateUnitPayload, unknown>;
  // updateUnit: ReturnType<typeof useMutation>;
  // deleteUnit: ReturnType<typeof useMutation>;
}

export default function useUnits(): UseUnitsResult {
  const queryClient = useQueryClient();

  const unitsQuery = useQuery<Unit[]>({
    queryKey: UNITS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<Unit[]>("/units");
      return res.data;
    },
  });

  const createUnit = useMutation({
    mutationFn: async (payload: CreateUnitPayload) => {
      const res = await api.post<Unit>("/units", payload);
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY }),
  });

  // const updateUnit = useMutation({
  //   mutationFn: async ({
  //     id,
  //     payload,
  //   }: {
  //     id: number;
  //     payload: { name: string };
  //   }) => {
  //     const res = await api.patch<Unit>(`/units/${id}`, payload);
  //     return res.data;
  //   },
  //   onSuccess: () =>
  //     queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY }),
  // });

  // const deleteUnit = useMutation({
  //   mutationFn: async (id: number) => {
  //     await api.delete(`/units/${id}`);
  //   },
  //   onSuccess: () =>
  //     queryClient.invalidateQueries({ queryKey: UNITS_QUERY_KEY }),
  // });

  return {
    unitsQuery,
    createUnit,
    //  updateUnit, deleteUnit
  };
}
