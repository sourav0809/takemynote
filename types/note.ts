import type { Block } from "@blocknote/core";

export interface Category {
  id: string;
  name: string;
}

export type FolderId = "scratchpad" | "notes" | "favorites" | "trash";

/** Rich-text note body, stored as BlockNote's JSON block document. */
export type NoteContent = Block[];

export interface Note {
  id: string;
  title: string;
  content: NoteContent;
  categoryId: string | null;
  favorited: boolean;
  pinned: boolean;
  trashed: boolean;
  scratchpad: boolean;
  createdAt: string;
  updatedAt: string;
}
