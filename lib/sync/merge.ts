import type { NoteInput, RemoteCategory, RemoteNote } from "@/lib/sync/schemas";
import type { Category, Note, NoteContent } from "@/types/note";

/**
 * Conversions between local notes and the sync format, and the conflict
 * rules (plan §7.4). Pure functions: no storage, no network.
 */

export function toNoteInput(note: Note): NoteInput {
  return {
    title: note.title,
    content: note.content as unknown as NoteInput["content"],
    categoryId: note.categoryId,
    favorited: note.favorited,
    pinned: note.pinned,
    trashed: note.trashed,
    scratchpad: note.scratchpad,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}

export function toLocalNote(remote: RemoteNote): Note {
  return {
    id: remote.id,
    title: remote.title,
    content: remote.content as unknown as NoteContent,
    categoryId: remote.categoryId,
    favorited: remote.favorited,
    pinned: remote.pinned,
    trashed: remote.trashed,
    scratchpad: remote.scratchpad,
    createdAt: remote.createdAt,
    updatedAt: remote.updatedAt,
  };
}

export function toLocalCategory(remote: RemoteCategory): Category {
  return { id: remote.id, name: remote.name };
}

function hasSameText(a: Note, b: Note): boolean {
  return a.title === b.title && JSON.stringify(a.content) === JSON.stringify(b.content);
}

/** A separate note holding the version that didn't win, so no writing is lost. */
function conflictCopy(note: Note, newId: string): Note {
  const now = new Date().toISOString();
  return {
    ...note,
    id: newId,
    title: `${note.title.trim() || "Untitled"} (copy from another device)`,
    // There is only one scratchpad; its other version becomes a normal note.
    scratchpad: false,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

export type NoteConflictDecision =
  /** Send this device's note again on top of the server's version. */
  | { action: "keep-local"; copy: Note | null }
  /** Use the server's note here. */
  | { action: "take-server"; copy: Note | null };

/**
 * Both this device and another one changed a note.
 * - Deleted on the server, edited here → keep the edit (the note comes back).
 * - Same text, only flags differ → keep this device's flags.
 * - Different text → the newest edit wins; the other text becomes a copy.
 */
export function resolveNoteConflict(local: Note, server: RemoteNote, newId: () => string): NoteConflictDecision {
  if (server.deleted) return { action: "keep-local", copy: null };
  const serverNote = toLocalNote(server);
  if (hasSameText(local, serverNote)) return { action: "keep-local", copy: null };
  if (Date.parse(local.updatedAt) >= Date.parse(serverNote.updatedAt)) {
    return { action: "keep-local", copy: conflictCopy(serverNote, newId()) };
  }
  return { action: "take-server", copy: conflictCopy(local, newId()) };
}
