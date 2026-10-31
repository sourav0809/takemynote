import { useState } from "react";
import { Check, ChevronDown, Folder, Tags } from "lucide-react";

import { CategoryManagerDialog } from "@/components/library/category-manager-dialog";
import { FOLDER_ICONS, FOLDER_ORDER } from "@/components/library/folder-icons";
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
import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useFolderNavigation } from "@/hooks/use-folder-navigation";
import { FOLDER_LABELS } from "@/lib/constants";

/** "Notes ▾" — the one place to switch folder or category. */
export function FolderSwitcher() {
  const { activeFolder, activeCategoryId, setActiveCategory } = useAppState();
  const { data: categories } = useCategories();
  const { counts, activeLabel, selectFolder } = useFolderNavigation();
  const [isManagerOpen, setManagerOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="-ml-2 h-9 max-w-full min-w-0 gap-1 px-2 text-[15px] font-semibold"
            />
          }
        >
          <span className="truncate">{activeLabel}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
          <DropdownMenuGroup>
            {FOLDER_ORDER.map((folder) => {
              const Icon = FOLDER_ICONS[folder];
              const isActive = activeFolder === folder && !activeCategoryId;
              return (
                <DropdownMenuItem key={folder} onClick={() => selectFolder(folder)}>
                  <Icon className="text-muted-foreground" />
                  <span className="flex-1">{FOLDER_LABELS[folder]}</span>
                  {Boolean(counts[folder]) && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {counts[folder]}
                    </span>
                  )}
                  <Check className={isActive ? "text-primary" : "invisible"} />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            {categories.map((category) => (
              <DropdownMenuItem key={category.id} onClick={() => setActiveCategory(category.id)}>
                <Folder className="text-muted-foreground" />
                <span className="flex-1 truncate">{category.name}</span>
                <Check
                  className={activeCategoryId === category.id ? "text-primary" : "invisible"}
                />
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => setManagerOpen(true)}>
              <Tags className="text-muted-foreground" />
              {categories.length > 0 ? "Manage categories…" : "New category…"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryManagerDialog open={isManagerOpen} onOpenChange={setManagerOpen} />
    </>
  );
}
