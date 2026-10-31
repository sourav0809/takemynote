import { MoreHorizontal } from "lucide-react";

import { NoteDropdownMenuItems } from "@/components/note-list/note-context-menu-items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

interface NoteRowMenuProps {
  note: Note;
  isSelected: boolean;
  className?: string;
}

/** On the blue selected row: white tints instead of the ghost button's greys. */
const SELECTED_ROW_BUTTON_CLASS = cn(
  "text-primary-foreground/80",
  "hover:bg-primary-foreground/15 hover:text-primary-foreground dark:hover:bg-primary-foreground/15",
  "aria-expanded:bg-primary-foreground/20 aria-expanded:text-primary-foreground",
  "focus-visible:bg-primary-foreground/20 focus-visible:text-primary-foreground"
);

const IDLE_ROW_BUTTON_CLASS = cn(
  "text-muted-foreground",
  "aria-expanded:bg-muted aria-expanded:text-foreground",
  "focus-visible:bg-muted focus-visible:text-foreground"
);

/** The ⋯ button on a note row: hover-revealed with a mouse, always shown on touch. */
export function NoteRowMenu({ note, isSelected, className }: NoteRowMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Note actions"
            className={cn(
              "size-7 opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100 [@media(hover:none)]:opacity-100",
              // Keyboard focus shows as a soft tint (like hover) instead of a ring,
              // which would crowd the time above it.
              "focus-visible:border-transparent focus-visible:ring-0",
              isSelected ? SELECTED_ROW_BUTTON_CLASS : IDLE_ROW_BUTTON_CLASS,
              className
            )}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <NoteDropdownMenuItems note={note} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
