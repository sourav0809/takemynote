import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/hooks/use-app-state";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/types/note";

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Add, rename and delete categories in one place. */
export function CategoryManagerDialog({ open, onOpenChange }: CategoryManagerDialogProps) {
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const [draftName, setDraftName] = useState("");

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    createCategory.mutate(name);
    setDraftName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
          <DialogDescription>
            Group notes by topic. Deleting a category keeps its notes.
          </DialogDescription>
        </DialogHeader>

        {categories.length > 0 && (
          <ul className="-mx-1 flex max-h-64 flex-col gap-1 overflow-y-auto px-1">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}

        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="New category"
            aria-label="New category name"
          />
          <Button type="submit" disabled={!draftName.trim()}>
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const { activeCategoryId, setActiveFolder } = useAppState();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();
  const [name, setName] = useState(category.name);

  const commitRename = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(category.name);
      return;
    }
    if (trimmed !== category.name) renameCategory.mutate({ id: category.id, name: trimmed });
  };

  const handleDelete = () => {
    if (activeCategoryId === category.id) setActiveFolder("notes");
    deleteCategory.mutate(category.id);
  };

  return (
    <li className="flex items-center gap-1">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={commitRename}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") setName(category.name);
        }}
        aria-label={`Rename ${category.name}`}
        className="bg-transparent hover:bg-input/50 focus-visible:bg-input/50"
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${category.name}`}
        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 />
      </Button>
    </li>
  );
}
