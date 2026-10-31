"use client";

import dynamic from "next/dynamic";

// BlockNote touches browser APIs, so the editor must never be server-rendered.
export const DynamicNoteEditor = dynamic(
  async () => {
    const { NoteEditor } = await import("@/components/editor/note-editor");
    return NoteEditor;
  },
  {
    ssr: false,
    loading: () => <div className="min-h-0 flex-1" aria-busy="true" />,
  }
);
