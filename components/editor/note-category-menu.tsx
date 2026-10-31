import { Check, ChevronDown, Folder, FolderMinus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from "@/hooks/use-categories";
import { useNoteActions } from "@/hooks/use-note-actions";
import type { Note } from "@/types/note";

/** Breadcrumb that names the note's category and moves it to another one. */
export function NoteCategoryMenu({ note }: { note: Note }) {
  const { data: categories } = useCategories();
  const actions = useNoteActions();
  const category = categories.find((item) => item.id === note.categoryId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="min-w-0 gap-1 px-2 font-medium text-muted-foreground"
          />
        }
      >
        <span className="truncate">{category?.name ?? "No category"}</span>
        <ChevronDown className="size-3.5 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {categories.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => actions.moveToCategory(note, item.id)}>
              <Folder className="text-muted-foreground" />
              <span className="flex-1 truncate">{item.name}</span>
              <Check className={item.id === note.categoryId ? "text-primary" : "invisible"} />
            </DropdownMenuItem>
          ))}
          {categories.length === 0 && (
            <DropdownMenuItem disabled>Add categories from the folder menu</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        {note.categoryId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.moveToCategory(note, null)}>
              <FolderMinus className="text-muted-foreground" />
              Remove from category
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
