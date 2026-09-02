export interface Category {
  id: string;
  name: string;
}

export type FolderId = "scratchpad" | "notes" | "favorites" | "trash";

export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  favorited: boolean;
  pinned: boolean;
  trashed: boolean;
  scratchpad: boolean;
  createdAt: string;
  updatedAt: string;
}
