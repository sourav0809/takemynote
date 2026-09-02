import { MoreHorizontal, Star } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { NoteContextMenuItems } from "@/components/note-list/note-context-menu-items";
import { RelativeTime } from "@/components/note-list/relative-time";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getNoteDisplayTitle, getNoteExcerpt } from "@/lib/note-utils";
import type { Category, Note } from "@/types/note";

interface NoteListItemProps {
  note: Note;
  category: Category | undefined;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onTogglePinned: () => void;
  onMoveToTrash: () => void;
  onRestore: () => void;
  onDeletePermanently: () => void;
}

export function NoteListItem({
  note,
  category,
  isSelected,
  onSelect,
  onToggleFavorite,
  onTogglePinned,
  onMoveToTrash,
  onRestore,
  onDeletePermanently,
}: NoteListItemProps) {
  const excerpt = getNoteExcerpt(note.content);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          type="button"
          onClick={onSelect}
          data-selected={isSelected}
          className={cn(
            "group flex w-full min-h-27 flex-col gap-1 border-b border-border px-4 py-3.5 text-left transition-colors",
            "hover:bg-muted",
            "data-[selected=true]:bg-primary data-[selected=true]:hover:bg-primary"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {note.favorited && (
                <Star
                  className={cn(
                    "size-3 shrink-0 fill-current text-amber-500",
                    isSelected && "text-primary-foreground"
                  )}
                />
              )}
              <span
                className={cn(
                  "truncate text-sm font-semibold text-foreground",
                  isSelected && "text-primary-foreground"
                )}
              >
                {getNoteDisplayTitle(note.title)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "text-xs text-muted-foreground",
                  isSelected && "text-primary-foreground/70"
                )}
              >
                <RelativeTime isoDate={note.updatedAt} />
              </span>
              <MoreHorizontal
                className={cn(
                  "size-4 text-muted-foreground opacity-0 group-hover:opacity-100",
                  isSelected && "text-primary-foreground/80"
                )}
              />
            </div>
          </div>

          <p
            className={cn(
              "line-clamp-2 min-h-8 text-xs text-muted-foreground",
              isSelected && "text-primary-foreground/70"
            )}
          >
            {excerpt}
          </p>

          {category && (
            <Badge
              variant="secondary"
              className={cn(
                "mt-0.5 w-fit",
                isSelected && "bg-primary-foreground/15 text-primary-foreground"
              )}
            >
              {category.name}
            </Badge>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <NoteContextMenuItems
          note={note}
          onToggleFavorite={onToggleFavorite}
          onTogglePinned={onTogglePinned}
          onMoveToTrash={onMoveToTrash}
          onRestore={onRestore}
          onDeletePermanently={onDeletePermanently}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}
