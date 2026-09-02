import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { dataAdapter } from "@/lib/data";
import type { Note } from "@/types/note";

const NOTES_QUERY_KEY = ["notes"] as const;

export function useNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => dataAdapter.getNotes(),
    initialData: [] as Note[],
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string | null) =>
      dataAdapter.createNote(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      changes,
    }: {
      id: string;
      changes: Partial<Note>;
    }) => dataAdapter.updateNote(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useDeleteNotePermanently() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => dataAdapter.deleteNotePermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => dataAdapter.emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useGetOrCreateScratchpadNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => dataAdapter.getOrCreateScratchpadNote(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
