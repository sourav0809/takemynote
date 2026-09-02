import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { dataAdapter } from "@/lib/data";
import type { Category } from "@/types/note";

const CATEGORIES_QUERY_KEY = ["categories"] as const;
const NOTES_QUERY_KEY = ["notes"] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => dataAdapter.getCategories(),
    initialData: [] as Category[],
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => dataAdapter.createCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useRenameCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      dataAdapter.renameCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => dataAdapter.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
