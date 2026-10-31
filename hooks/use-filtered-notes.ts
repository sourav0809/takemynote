import { useMemo } from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useNotes } from "@/hooks/use-notes";
import { usePreferences } from "@/hooks/use-preferences";
import { RECENT_NOTE_WINDOW_DAYS } from "@/lib/constants";
import type { StoredPreferences } from "@/lib/data/preferences-storage";
import { getNoteDisplayTitle, getNotePlainText } from "@/lib/note-utils";
import type { Note } from "@/types/note";

const NOTE_COMPARATORS: Record<StoredPreferences["sortBy"], (a: Note, b: Note) => number> = {
  updated: (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  created: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  title: (a, b) => getNoteDisplayTitle(a.title).localeCompare(getNoteDisplayTitle(b.title)),
};

function isWithinRecentWindow(isoDate: string): boolean {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= RECENT_NOTE_WINDOW_DAYS;
}

export function useFilteredNotes(): Note[] {
  const { activeFolder, activeCategoryId, searchQuery, listFilter } = useAppState();
  const { data: notes } = useNotes();
  const { sortBy } = usePreferences();

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

    // Pinned notes stay on top; the user's "Sort by" preference orders the rest.
    return [...filtered].sort(
      (a, b) => Number(b.pinned) - Number(a.pinned) || NOTE_COMPARATORS[sortBy](a, b)
    );
  }, [notes, activeFolder, activeCategoryId, searchQuery, listFilter, sortBy]);
}
