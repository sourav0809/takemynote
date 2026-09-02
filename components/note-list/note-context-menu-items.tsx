import { ArrowUp, Pin, Star, Trash2, X } from "lucide-react";

import { ContextMenuItem } from "@/components/ui/context-menu";
import type { Note } from "@/types/note";

interface NoteContextMenuItemsProps {
  note: Note;
  onToggleFavorite: () => void;
  onTogglePinned: () => void;
  onMoveToTrash: () => void;
  onRestore: () => void;
  onDeletePermanently: () => void;
}

export function NoteContextMenuItems({
  note,
  onToggleFavorite,
  onTogglePinned,
  onMoveToTrash,
  onRestore,
  onDeletePermanently,
}: NoteContextMenuItemsProps) {
  if (note.trashed) {
    return (
      <>
        <ContextMenuItem onClick={onRestore}>
          <ArrowUp />
          Restore from Trash
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={onDeletePermanently}>
          <X />
          Delete Permanently
        </ContextMenuItem>
      </>
    );
  }

  return (
    <>
      <ContextMenuItem onClick={onToggleFavorite}>
        <Star />
        {note.favorited ? "Remove Favorite" : "Mark as Favorite"}
      </ContextMenuItem>
      {!note.scratchpad && (
        <>
          <ContextMenuItem onClick={onTogglePinned}>
            <Pin />
            {note.pinned ? "Unpin note" : "Pin note"}
          </ContextMenuItem>
          <ContextMenuItem variant="destructive" onClick={onMoveToTrash}>
            <Trash2 />
            Move to Trash
          </ContextMenuItem>
        </>
      )}
    </>
  );
}
