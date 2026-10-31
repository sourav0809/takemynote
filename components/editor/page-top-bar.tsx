import { ChevronLeft, MoreHorizontal, Star } from "lucide-react";

import { NoteCategoryMenu } from "@/components/editor/note-category-menu";
import { NoteDropdownMenuItems } from "@/components/note-list/note-context-menu-items";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNoteActions } from "@/hooks/use-note-actions";
import { FOLDER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

interface PageTopBarProps {
  note: Note;
  /** Phone/tablet only: returns to the Library. */
  onBack?: () => void;
  backLabel?: string;
}

export function PageTopBar({ note, onBack, backLabel }: PageTopBarProps) {
  const actions = useNoteActions();
  const folderLabel = note.trashed
    ? FOLDER_LABELS.trash
    : note.scratchpad
      ? FOLDER_LABELS.scratchpad
      : FOLDER_LABELS.notes;
  const canChangeCategory = !note.trashed && !note.scratchpad;

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 px-2 lg:h-14 lg:px-4">
      {onBack ? (
        <Button
          variant="ghost"
          className="h-10 shrink-0 gap-0.5 pr-2.5 pl-1 text-primary hover:text-primary"
          onClick={onBack}
        >
          <ChevronLeft className="size-5" />
          {backLabel}
        </Button>
      ) : (
        <span className="px-2 text-sm text-muted-foreground">{folderLabel}</span>
      )}

      {canChangeCategory && (
        <>
          <span aria-hidden className="text-muted-foreground/50">
            /
          </span>
          <NoteCategoryMenu note={note} />
        </>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {!note.trashed && (
          <Button
            variant="ghost"
            size="icon"
            className="size-10 lg:size-9"
            aria-label={note.favorited ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={note.favorited}
            onClick={() => actions.toggleFavorite(note)}
          >
            <Star
              className={cn(
                note.favorited ? "fill-current text-amber-500" : "text-muted-foreground"
              )}
            />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-muted-foreground lg:size-9"
                aria-label="More actions"
              />
            }
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <NoteDropdownMenuItems note={note} showExport />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
