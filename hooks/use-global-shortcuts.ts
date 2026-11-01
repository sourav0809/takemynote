"use client";

import { useEffect } from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useCreateAndOpenNote } from "@/hooks/use-create-and-open-note";
import { useNoteActions } from "@/hooks/use-note-actions";
import { useNotes } from "@/hooks/use-notes";
import { useSidePanes } from "@/hooks/use-side-panes";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { DESKTOP_MEDIA_QUERY } from "@/lib/constants";
import { findShortcut } from "@/lib/shortcuts";

export const NOTE_SEARCH_INPUT_ID = "note-search-input";

/** Wires the shortcuts defined in lib/shortcuts.ts to their actions. */
export function useGlobalShortcuts(): void {
  const { selectedNoteId } = useAppState();
  const { data: notes } = useNotes();
  const createAndOpenNote = useCreateAndOpenNote();
  const actions = useNoteActions();
  const { toggleTheme } = useThemeToggle();
  const { toggleAll: toggleSidePanes } = useSidePanes();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = findShortcut(event);
      if (!shortcut) return;
      const activeNote = notes.find((note) => note.id === selectedNoteId);

      switch (shortcut.id) {
        case "newNote":
          event.preventDefault();
          createAndOpenNote();
          break;
        case "search": {
          const searchInput = document.getElementById(NOTE_SEARCH_INPUT_ID);
          if (!searchInput) return;
          event.preventDefault();
          searchInput.focus();
          break;
        }
        case "favorite":
          if (!activeNote || activeNote.trashed) return;
          event.preventDefault();
          actions.toggleFavorite(activeNote);
          break;
        case "trash":
          if (!activeNote || activeNote.trashed || activeNote.scratchpad) return;
          event.preventDefault();
          actions.moveToTrash(activeNote);
          break;
        case "theme":
          event.preventDefault();
          toggleTheme();
          break;
        case "sidebars":
          // Phones show one pane at a time, so there is nothing to collapse.
          if (!window.matchMedia(DESKTOP_MEDIA_QUERY).matches) return;
          event.preventDefault();
          toggleSidePanes();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [notes, selectedNoteId, createAndOpenNote, actions, toggleTheme, toggleSidePanes]);
}
