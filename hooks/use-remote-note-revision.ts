"use client";

import { useEffect, useState } from "react";

import { onRemoteNoteChanges } from "@/lib/sync/remote-events";

/** Wait this long after the last keystroke before reloading a note under the cursor. */
const TYPING_PAUSE_MS = 3_000;
const CHECK_INTERVAL_MS = 1_000;

function isEditingNote(): boolean {
  return Boolean(document.activeElement?.closest(".note-editor"));
}

/**
 * A number that goes up when sync brings a newer version of the open note
 * from another device. Use it in the editor's key to reload the content.
 * While someone is typing, the reload waits for a pause.
 */
export function useRemoteNoteRevision(noteId: string | undefined): number {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!noteId) return;
    let lastKeyAt = 0;
    let waitTimer = 0;
    const onKeyDown = () => {
      lastKeyAt = Date.now();
    };
    const reload = () => {
      window.clearInterval(waitTimer);
      waitTimer = 0;
      setRevision((current) => current + 1);
    };

    document.addEventListener("keydown", onKeyDown, true);
    const unsubscribe = onRemoteNoteChanges((ids) => {
      if (!ids.has(noteId)) return;
      if (!isEditingNote()) return reload();
      if (waitTimer) return;
      waitTimer = window.setInterval(() => {
        if (!isEditingNote() || Date.now() - lastKeyAt >= TYPING_PAUSE_MS) reload();
      }, CHECK_INTERVAL_MS);
    });

    return () => {
      unsubscribe();
      document.removeEventListener("keydown", onKeyDown, true);
      window.clearInterval(waitTimer);
    };
  }, [noteId]);

  return revision;
}
