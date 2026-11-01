import { useState } from "react";
import { Plus } from "lucide-react";

import { PaneToggleButton } from "@/components/app-shell/pane-toggle-button";
import { BrandHomeLink } from "@/components/brand/brand-home-link";
import { CategoryManagerDialog } from "@/components/library/category-manager-dialog";
import { FOLDER_ICONS, FOLDER_ORDER } from "@/components/library/folder-icons";
import { LibraryFooter } from "@/components/library/library-footer";
import { NewNoteButton } from "@/components/library/new-note-button";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useFolderNavigation } from "@/hooks/use-folder-navigation";
import { FOLDER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEM_CLASS =
  "flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors lg:h-9";

interface ClassicSidebarProps {
  /** Called after any navigation, so the phone drawer can close itself. */
  onNavigate?: () => void;
  /** Desktop: hides this column. */
  onCollapse?: () => void;
}

/** Classic layout's first column: folders with counts, categories, settings. */
export function ClassicSidebar({ onNavigate, onCollapse }: ClassicSidebarProps) {
  const { activeFolder, activeCategoryId, setActiveCategory } = useAppState();
  const { data: categories } = useCategories();
  const { counts, selectFolder } = useFolderNavigation();
  const [isManagerOpen, setManagerOpen] = useState(false);

  const navItemState = (isActive: boolean) =>
    isActive
      ? "bg-sidebar-accent text-sidebar-accent-foreground"
      : "text-sidebar-foreground/75 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground";

  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 pr-2.5 pl-4">
        <BrandHomeLink />
        {onCollapse && <PaneToggleButton action="hide" label="Collapse sidebar" onClick={onCollapse} />}
      </div>

      <div className="px-3 pb-3" onClickCapture={onNavigate}>
        <NewNoteButton variant="full" />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Folders" className="flex flex-col gap-0.5 px-3">
          {FOLDER_ORDER.map((folder) => {
            const Icon = FOLDER_ICONS[folder];
            const isActive = activeFolder === folder && !activeCategoryId;
            return (
              <button
                key={folder}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={cn(NAV_ITEM_CLASS, navItemState(isActive))}
                onClick={() => {
                  selectFolder(folder);
                  onNavigate?.();
                }}
              >
                <Icon className={cn("size-4 shrink-0", isActive ? "text-primary" : "opacity-70")} />
                <span className="flex-1 truncate text-left">{FOLDER_LABELS[folder]}</span>
                {Boolean(counts[folder]) && (
                  <span className="text-xs tabular-nums opacity-60">{counts[folder]}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 px-3 pb-4">
          <div className="flex items-center justify-between pr-1 pl-3">
            <p className="text-[11px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              Categories
            </p>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Manage categories"
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={() => setManagerOpen(true)}
            >
              <Plus />
            </Button>
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            {categories.map((category) => {
              const isActive = activeCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  className={cn(NAV_ITEM_CLASS, navItemState(isActive))}
                  onClick={() => {
                    setActiveCategory(category.id);
                    onNavigate?.();
                  }}
                >
                  <span className="mx-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="flex-1 truncate text-left">{category.name}</span>
                </button>
              );
            })}
            {categories.length === 0 && (
              <p className="px-3 py-1.5 text-[13px] text-sidebar-foreground/50">
                Use + to group notes by topic.
              </p>
            )}
          </div>
        </div>
      </ScrollArea>

      <LibraryFooter />
      <CategoryManagerDialog open={isManagerOpen} onOpenChange={setManagerOpen} />
    </aside>
  );
}
