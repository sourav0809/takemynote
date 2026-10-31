"use client";

import { useMemo } from "react";
import { toast } from "sonner";

import { useAppState } from "@/hooks/use-app-state";
import { useDeleteNotePermanently, useUpdateNote } from "@/hooks/use-notes";
import { downloadNoteAsMarkdown } from "@/lib/download-note";
import type { Note } from "@/types/note";

export interface NoteActions {
  toggleFavorite: (note: Note) => void;
  togglePinned: (note: Note) => void;
  moveToTrash: (note: Note) => void;
  restore: (note: Note) => void;
  deletePermanently: (note: Note) => void;
  moveToCategory: (note: Note, categoryId: string | null) => void;
  exportMarkdown: (note: Note) => Promise<void>;
}

/** Every per-note action, shared by the list rows, the right-click menu and the Page. */
export function useNoteActions(): NoteActions {
  const { selectedNoteId, setSelectedNoteId } = useAppState();
  const { mutate: updateNote } = useUpdateNote();
  const { mutate: deleteNote } = useDeleteNotePermanently();

  return useMemo<NoteActions>(
    () => ({
      toggleFavorite: (note) =>
        updateNote({ id: note.id, changes: { favorited: !note.favorited } }),
      togglePinned: (note) => updateNote({ id: note.id, changes: { pinned: !note.pinned } }),
      moveToTrash: (note) => {
        updateNote({ id: note.id, changes: { trashed: true } });
        if (note.id === selectedNoteId) setSelectedNoteId(null);
        toast.success("Moved to trash");
      },
      restore: (note) => updateNote({ id: note.id, changes: { trashed: false } }),
      deletePermanently: (note) => {
        deleteNote(note.id);
        if (note.id === selectedNoteId) setSelectedNoteId(null);
      },
      moveToCategory: (note, categoryId) => updateNote({ id: note.id, changes: { categoryId } }),
      exportMarkdown: async (note) => {
        try {
          await downloadNoteAsMarkdown(note);
        } catch {
          toast.error("Could not export this note");
        }
      },
    }),
    [updateNote, deleteNote, selectedNoteId, setSelectedNoteId]
  );
}
