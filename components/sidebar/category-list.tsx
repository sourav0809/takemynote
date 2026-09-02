import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

import { AddCategoryInput } from "@/components/sidebar/add-category-input";
import { CategoryItem } from "@/components/sidebar/category-item";
import { Button } from "@/components/ui/button";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRenameCategory,
} from "@/hooks/use-categories";
import { useAppState } from "@/hooks/use-app-state";

export function CategoryList() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();
  const { activeCategoryId, setActiveCategory } = useAppState();

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-1.5">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-sidebar-foreground/50 uppercase"
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
          Categories
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => {
            setIsExpanded(true);
            setIsAdding(true);
          }}
        >
          <Plus />
        </Button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-0.5 px-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isActive={activeCategoryId === category.id}
              onSelect={() => setActiveCategory(category.id)}
              onRename={(name) =>
                renameCategory.mutate({ id: category.id, name })
              }
              onDelete={() => deleteCategory.mutate(category.id)}
            />
          ))}
          {isAdding && (
            <div className="px-1 py-0.5">
              <AddCategoryInput
                onSubmit={(name) => {
                  createCategory.mutate(name);
                  setIsAdding(false);
                }}
                onCancel={() => setIsAdding(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
