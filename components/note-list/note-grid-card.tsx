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

interface NoteGridCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}

export function NoteGridCard({ note, isSelected, onSelect }: NoteGridCardProps) {
  const excerpt = getNoteExcerpt(note.content);

  return (
    <ContextMenu>
      <ContextMenuTrigger className="h-full">
        <div
          data-selected={isSelected}
          className={cn(
            "group/row relative h-full rounded-xl border transition-colors",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-foreground/20"
          )}
        >
          <button
            type="button"
            onClick={onSelect}
            aria-current={isSelected ? "true" : undefined}
            className="flex h-full min-h-36 w-full flex-col gap-1.5 rounded-xl p-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-1.5">
              {note.pinned && (
                <Pin className={cn("size-3 shrink-0", !isSelected && "text-primary")} />
              )}
              {note.favorited && (
                <Star
                  className={cn("size-3 shrink-0 fill-current", !isSelected && "text-amber-500")}
                />
              )}
              <span className="truncate text-sm font-semibold">
                {getNoteDisplayTitle(note.title)}
              </span>
            </span>
            <span
              className={cn(
                "line-clamp-4 text-[13px] leading-snug",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              {excerpt}
            </span>
            <span
              className={cn(
                "mt-auto pt-1 text-xs tabular-nums",
                isSelected ? "text-primary-foreground/75" : "text-muted-foreground"
              )}
            >
              <RelativeTime isoDate={note.updatedAt} />
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
