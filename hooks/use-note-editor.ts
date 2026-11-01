"use client";

import { syntaxHighlighter } from "@blocknote/code-block";
import type { PartialBlock } from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";

import { EDITOR_PLACEHOLDER } from "@/lib/constants";
import { noteEditorSchema, type NoteBlockEditor } from "@/lib/editor/note-editor-schema";
import { typographyExtension } from "@/lib/editor/typography-extension";
import type { NoteContent } from "@/types/note";

const NOTE_EDITOR_DICTIONARY = {
  ...en,
  placeholders: { ...en.placeholders, emptyDocument: EDITOR_PLACEHOLDER },
};

/**
 * Creates the BlockNote editor for one note. The instance is created once per
 * mount, so callers key the editor component by note id: switching notes
 * builds a fresh editor while typing never resets cursor or undo history.
 */
export function useNoteEditor(
  initialContent: NoteContent,
  /** Enables uploading images (Upload tab, paste and drop). Without it, images come from links. */
  uploadFile?: (file: File) => Promise<string>
): NoteBlockEditor {
  return useCreateBlockNote({
    schema: noteEditorSchema,
    // BlockNote rejects an empty array; `undefined` gives one empty paragraph.
    initialContent:
      initialContent.length > 0 ? (initialContent as PartialBlock[]) : undefined,
    extensions: [syntaxHighlighter, typographyExtension],
    dictionary: NOTE_EDITOR_DICTIONARY,
    uploadFile,
  });
}
