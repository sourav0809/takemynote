"use client";

import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useGetOrCreateScratchpadNote, useNotes } from "@/hooks/use-notes";
import { FOLDER_LABELS } from "@/lib/constants";
import type { FolderId } from "@/types/note";

/** Folder counts, the current folder/category label and folder switching, shared by both layouts. */
export function useFolderNavigation() {
  const { activeFolder, activeCategoryId, setActiveFolder, openNote } = useAppState();
  const { data: notes } = useNotes();
  const { data: categories } = useCategories();
  const getOrCreateScratchpadNote = useGetOrCreateScratchpadNote();

  const counts: Partial<Record<FolderId, number>> = {
    notes: notes.filter((note) => !note.trashed && !note.scratchpad).length,
    favorites: notes.filter((note) => note.favorited && !note.trashed).length,
    trash: notes.filter((note) => note.trashed).length,
  };

  const activeCategory = categories.find((category) => category.id === activeCategoryId);
  const activeLabel = activeCategory?.name ?? FOLDER_LABELS[activeFolder];

  const selectFolder = (folder: FolderId) => {
    setActiveFolder(folder);
    if (folder === "scratchpad") {
      getOrCreateScratchpadNote.mutate(undefined, {
        onSuccess: (note) => openNote(note.id),
      });
    }
  };

  return { counts, activeLabel, selectFolder };
}
