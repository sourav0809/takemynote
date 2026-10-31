import type { LucideIcon } from "lucide-react";
import { Book, NotebookPen, Star, Trash2 } from "lucide-react";

import type { FolderId } from "@/types/note";

export const FOLDER_ICONS: Record<FolderId, LucideIcon> = {
  notes: Book,
  favorites: Star,
  scratchpad: NotebookPen,
  trash: Trash2,
};

export const FOLDER_ORDER: FolderId[] = ["notes", "favorites", "scratchpad", "trash"];
