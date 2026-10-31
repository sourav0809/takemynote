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
              "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100 [@media(hover:none)]:opacity-100",
              isSelected
                ? "text-primary-foreground/80 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                : "text-muted-foreground",
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
