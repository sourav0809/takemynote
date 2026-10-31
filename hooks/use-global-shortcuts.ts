"use client";

import { useEffect } from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useCreateAndOpenNote } from "@/hooks/use-create-and-open-note";
import { useNotes, useUpdateNote } from "@/hooks/use-notes";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export const NOTE_SEARCH_INPUT_ID = "note-search-input";

export function useGlobalShortcuts(): void {
  const { selectedNoteId, setSelectedNoteId } = useAppState();
  const { data: notes } = useNotes();
  const createAndOpenNote = useCreateAndOpenNote();
  const updateNote = useUpdateNote();
  const { toggleTheme } = useThemeToggle();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (!isModifierPressed || !event.altKey) return;

      const key = event.key.toLowerCase();
      const activeNote = notes.find((note) => note.id === selectedNoteId);

      switch (key) {
        case "n": {
          event.preventDefault();
          createAndOpenNote();
          break;
        }
        case "f": {
          event.preventDefault();
          document.getElementById(NOTE_SEARCH_INPUT_ID)?.focus();
          break;
        }
        case "l": {
          event.preventDefault();
          toggleTheme();
          break;
        }
        case "s": {
          if (!activeNote) return;
          event.preventDefault();
          updateNote.mutate({
            id: activeNote.id,
            changes: { favorited: !activeNote.favorited },
          });
          break;
        }
        case "d": {
          if (!activeNote || activeNote.trashed) return;
          event.preventDefault();
          updateNote.mutate({ id: activeNote.id, changes: { trashed: true } });
          setSelectedNoteId(null);
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    notes,
    selectedNoteId,
    createAndOpenNote,
    updateNote,
    toggleTheme,
    setSelectedNoteId,
  ]);
}
