"use client";

import { useCallback } from "react";

import { useAppState } from "@/hooks/use-app-state";
import { useCreateNote } from "@/hooks/use-notes";

/** Creates a note in the active category, switches to Notes and opens it. */
export function useCreateAndOpenNote(): () => void {
  const { activeCategoryId, setActiveFolder, openNote } = useAppState();
  const { mutate } = useCreateNote();

  return useCallback(() => {
    mutate(activeCategoryId, {
      onSuccess: (note) => {
        setActiveFolder("notes");
        openNote(note.id);
      },
    });
  }, [mutate, activeCategoryId, setActiveFolder, openNote]);
}
