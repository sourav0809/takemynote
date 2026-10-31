"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { useAppState } from "@/hooks/use-app-state";
import { useCreateNoteWithContent } from "@/hooks/use-notes";
import { renderTemplate, type NoteTemplate } from "@/lib/templates/note-templates";
import { templateMarkdownToBlocks } from "@/lib/templates/template-blocks";

/** Creates a new note filled from a template (in the active category) and opens it. */
export function useCreateNoteFromTemplate(): (template: NoteTemplate) => Promise<void> {
  const { activeCategoryId, setActiveFolder, openNote } = useAppState();
  const { mutateAsync } = useCreateNoteWithContent();

  return useCallback(
    async (template: NoteTemplate) => {
      try {
        const { title, markdown } = renderTemplate(template);
        // Loaded on demand so the editor library stays out of the first page load.
        const { markdownToNoteContent } = await import("@/lib/editor/note-content-converter");
        const note = await mutateAsync({
          categoryId: activeCategoryId,
          initial: { title, content: templateMarkdownToBlocks(markdown, markdownToNoteContent) },
        });
        setActiveFolder("notes");
        openNote(note.id);
      } catch {
        toast.error("Could not create a note from this template");
      }
    },
    [mutateAsync, activeCategoryId, setActiveFolder, openNote]
  );
}
