import { api } from "@/lib/api/axios";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";

const CATEGORIES_QUERY_KEY = ["categories"];

interface UseCategoriesResult {
  categoriesQuery: UseQueryResult<Category[], unknown>;
  createCategory: UseMutationResult<
    Category,
    unknown,
    CreateCategoryPayload,
    unknown
  >;
  // updateCategory: UseMutationResult<typeof useMutation>;
  // deleteCategory: ReturnType<typeof useMutation>;
}

export default function useCategories(): UseCategoriesResult {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<Category[]>("/category");
      return response.data;
    },
  });

  const createCategory = useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const response = await api.post<Category>("/category", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });

  // const updateCategory = useMutation({
  //   mutationFn: async ({
  //     id,
  //     payload,
  //   }: {
  //     id: number;
  //     payload: UpdateCategoryPayload;
  //   }) => {
  //     const response = await api.patch<Category>(`/category/${id}`, payload);
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
  //   },
  // });

  // const deleteCategory = useMutation({
  //   mutationFn: async (id: number) => {
  //     await api.delete(`/category/${id}`);
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
  //   },
  // });

  return {
    categoriesQuery,
    createCategory,
    // updateCategory,
    // deleteCategory,
  };
}
