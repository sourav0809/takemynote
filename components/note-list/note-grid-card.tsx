import { Star } from "lucide-react";

import { NoteContextMenuItems } from "@/components/note-list/note-context-menu-items";
import { RelativeTime } from "@/components/note-list/relative-time";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { getNoteDisplayTitle, getNoteExcerpt } from "@/lib/note-utils";
import { cn } from "@/lib/utils";
import type { Category, Note } from "@/types/note";

interface NoteGridCardProps {
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

export function NoteGridCard({
  note,
  category,
  isSelected,
  onSelect,
  onToggleFavorite,
  onTogglePinned,
  onMoveToTrash,
  onRestore,
  onDeletePermanently,
}: NoteGridCardProps) {
  const excerpt = getNoteExcerpt(note.content);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          type="button"
          onClick={onSelect}
          data-selected={isSelected}
          className={cn(
            "flex h-full min-h-40 w-full flex-col gap-2 rounded-2xl border border-border bg-background p-3.5 text-left transition-colors",
            "hover:border-primary/40",
            "data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:hover:border-primary"
          )}
        >
          <div className="flex items-center gap-1.5">
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

          <p
            className={cn(
              "line-clamp-3 min-h-12 text-xs text-muted-foreground",
              isSelected && "text-primary-foreground/70"
            )}
          >
            {excerpt}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            {category ? (
              <Badge
                variant="secondary"
                className={cn(
                  isSelected && "bg-primary-foreground/15 text-primary-foreground"
                )}
              >
                {category.name}
              </Badge>
            ) : (
              <span />
            )}
            <span
              className={cn(
                "text-xs text-muted-foreground",
                isSelected && "text-primary-foreground/70"
              )}
            >
              <RelativeTime isoDate={note.updatedAt} />
            </span>
          </div>
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
