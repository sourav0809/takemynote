import { Pin, Star } from "lucide-react";

import { NoteContextMenuItems } from "@/components/note-list/note-context-menu-items";
import { NoteRowMenu } from "@/components/note-list/note-row-menu";
import { RelativeTime } from "@/components/note-list/relative-time";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getNoteDisplayTitle, getNoteExcerpt } from "@/lib/note-utils";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}

export function NoteListItem({ note, isSelected, onSelect }: NoteListItemProps) {
  const excerpt = getNoteExcerpt(note.content);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          data-selected={isSelected}
          className={cn(
            "group/row relative rounded-xl transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted/70"
          )}
        >
          <button
            type="button"
            onClick={onSelect}
            aria-current={isSelected ? "true" : undefined}
            className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-2">
              <span className="flex min-w-0 flex-1 items-center gap-1.5">
                {note.pinned && (
                  <Pin
                    aria-label="Pinned"
                    className={cn("size-3 shrink-0", !isSelected && "text-primary")}
                  />
                )}
                {note.favorited && (
                  <Star
                    aria-label="Favorite"
                    className={cn("size-3 shrink-0 fill-current", !isSelected && "text-amber-500")}
                  />
                )}
                <span className="truncate text-sm font-semibold">
                  {getNoteDisplayTitle(note.title)}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-xs tabular-nums",
                  isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
                )}
              >
                <RelativeTime isoDate={note.updatedAt} />
              </span>
            </span>
            <span
              className={cn(
                "line-clamp-2 pr-8 text-[13px] leading-snug",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {excerpt || "No additional text"}
            </span>
          </button>

          <NoteRowMenu
            note={note}
            isSelected={isSelected}
            className="absolute right-1.5 bottom-1.5"
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <NoteContextMenuItems note={note} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
