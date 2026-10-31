import type { ComponentType, ReactNode } from "react";
import { ArchiveRestore, Download, Pin, PinOff, Star, StarOff, Trash2, X } from "lucide-react";

import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNoteActions } from "@/hooks/use-note-actions";
import type { Note } from "@/types/note";

interface MenuItemProps {
  onClick?: () => void;
  variant?: "default" | "destructive";
  children: ReactNode;
}

interface NoteMenuItemsProps {
  note: Note;
  Item: ComponentType<MenuItemProps>;
  Separator: ComponentType;
  /** The Page's ⋯ menu also offers export; the list's menus don't. */
  showExport?: boolean;
}

/** The same note actions for the right-click menu and the ⋯ dropdown. */
function NoteMenuItems({ note, Item, Separator, showExport }: NoteMenuItemsProps) {
  const actions = useNoteActions();

  if (note.trashed) {
    return (
      <>
        <Item onClick={() => actions.restore(note)}>
          <ArchiveRestore />
          Restore
        </Item>
        <Item variant="destructive" onClick={() => actions.deletePermanently(note)}>
          <X />
          Delete forever
        </Item>
      </>
    );
  }

  return (
    <>
      <Item onClick={() => actions.toggleFavorite(note)}>
        {note.favorited ? <StarOff /> : <Star />}
        {note.favorited ? "Remove from favorites" : "Add to favorites"}
      </Item>
      {!note.scratchpad && (
        <Item onClick={() => actions.togglePinned(note)}>
          {note.pinned ? <PinOff /> : <Pin />}
          {note.pinned ? "Unpin" : "Pin to top"}
        </Item>
      )}
      {showExport && (
        <Item onClick={() => void actions.exportMarkdown(note)}>
          <Download />
          Export as Markdown
        </Item>
      )}
      {!note.scratchpad && (
        <>
          <Separator />
          <Item variant="destructive" onClick={() => actions.moveToTrash(note)}>
            <Trash2 />
            Move to trash
          </Item>
        </>
      )}
    </>
  );
}

export function NoteContextMenuItems({ note }: { note: Note }) {
  return <NoteMenuItems note={note} Item={ContextMenuItem} Separator={ContextMenuSeparator} />;
}

export function NoteDropdownMenuItems({ note, showExport }: { note: Note; showExport?: boolean }) {
  return (
    <NoteMenuItems
      note={note}
      Item={DropdownMenuItem}
      Separator={DropdownMenuSeparator}
      showExport={showExport}
    />
  );
}
