import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notesStore } from "@/lib/notes-store";
import type { Note } from "@/types/note";

const NOTES_QUERY_KEY = ["notes"] as const;

export function useNotes() {
  return useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: async () => notesStore.getNotes(),
    initialData: () => notesStore.getNotes(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string | null) =>
      notesStore.createNote(categoryId),
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
    }) => notesStore.updateNote(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useDeleteNotePermanently() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => notesStore.deleteNotePermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}

export function useEmptyTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => notesStore.emptyTrash(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
    },
  });
}
