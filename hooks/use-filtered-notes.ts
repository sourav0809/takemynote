import { useMemo } from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useNotes } from "@/hooks/use-notes";
import { RECENT_NOTE_WINDOW_DAYS } from "@/lib/constants";
import { getNotePlainText, sortNotesByUpdatedAt } from "@/lib/note-utils";
import type { Note } from "@/types/note";

function isWithinRecentWindow(isoDate: string): boolean {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= RECENT_NOTE_WINDOW_DAYS;
}

export function useFilteredNotes(): Note[] {
  const { activeFolder, activeCategoryId, searchQuery, listFilter } = useAppState();
  const { data: notes } = useNotes();

  return useMemo(() => {
    let filtered = notes.filter((note) => {
      if (activeFolder === "trash") return note.trashed;
      if (note.trashed) return false;
      if (activeFolder === "scratchpad") return note.scratchpad;
      if (note.scratchpad) return false;
      if (activeFolder === "favorites") return note.favorited;
      if (activeCategoryId) return note.categoryId === activeCategoryId;
      return true;
    });

    if (listFilter === "recent") {
      filtered = filtered.filter((note) => isWithinRecentWindow(note.updatedAt));
    } else if (listFilter === "pinned") {
      filtered = filtered.filter((note) => note.pinned);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          getNotePlainText(note.content).toLowerCase().includes(query)
      );
    }

    const sorted = sortNotesByUpdatedAt(filtered);
    return [...sorted].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, activeFolder, activeCategoryId, searchQuery, listFilter]);
}
