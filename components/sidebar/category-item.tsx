import { useState } from "react";
import { Folder } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/note";
import { Edit2, X } from "lucide-react";

interface CategoryItemProps {
  category: Category;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function CategoryItem({
  category,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(category.name);

  const commitRename = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== category.name) onRename(trimmed);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={commitRename}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitRename();
          if (event.key === "Escape") setIsEditing(false);
        }}
        className="h-8 bg-sidebar-accent text-sm text-sidebar-accent-foreground"
      />
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={() => setIsEditing(true)}
          data-active={isActive}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
          )}
        >
          <Folder className="size-4 shrink-0" />
          <span className="flex-1 truncate text-left">{category.name}</span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setIsEditing(true)}>
          <Edit2 />
          Rename
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={onDelete}>
          <X />
          Delete permanently
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
