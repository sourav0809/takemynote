"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useAppState } from "@/hooks/use-app-state";
import { useCreateNote, useNotes, useUpdateNote } from "@/hooks/use-notes";

export const NOTE_SEARCH_INPUT_ID = "note-search-input";

export function useGlobalShortcuts(): void {
  const { activeCategoryId, selectedNoteId, setActiveFolder, setSelectedNoteId } =
    useAppState();
  const { data: notes } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (!isModifierPressed || !event.altKey) return;

      const key = event.key.toLowerCase();
      const activeNote = notes.find((note) => note.id === selectedNoteId);

      switch (key) {
        case "n": {
          event.preventDefault();
          createNote.mutate(activeCategoryId, {
            onSuccess: (note) => {
              setActiveFolder("notes");
              setSelectedNoteId(note.id);
            },
          });
          break;
        }
        case "f": {
          event.preventDefault();
          document.getElementById(NOTE_SEARCH_INPUT_ID)?.focus();
          break;
        }
        case "l": {
          event.preventDefault();
          setTheme(theme === "dark" ? "light" : "dark");
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
    activeCategoryId,
    theme,
    createNote,
    updateNote,
    setTheme,
    setActiveFolder,
    setSelectedNoteId,
  ]);
}
