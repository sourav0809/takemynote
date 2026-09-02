import { Book, Edit, Plus, Star, Trash2 } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import { CategoryList } from "@/components/sidebar/category-list";
import { SidebarNavItem } from "@/components/sidebar/sidebar-nav-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppState } from "@/hooks/use-app-state";
import { useCreateNote, useGetOrCreateScratchpadNote, useNotes } from "@/hooks/use-notes";
import { APP_NAME } from "@/lib/constants";

export function AppSidebar() {
  const { activeFolder, activeCategoryId, setActiveFolder, setSelectedNoteId } =
    useAppState();
  const { data: notes } = useNotes();
  const createNote = useCreateNote();
  const getOrCreateScratchpadNote = useGetOrCreateScratchpadNote();

  const favoritesCount = notes.filter((note) => note.favorited && !note.trashed).length;
  const notesCount = notes.filter((note) => !note.trashed && !note.scratchpad).length;
  const trashCount = notes.filter((note) => note.trashed).length;

  const handleCreateNote = () => {
    createNote.mutate(activeCategoryId, {
      onSuccess: (note) => {
        setActiveFolder("notes");
        setSelectedNoteId(note.id);
      },
    });
  };

  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <LogoMark />
        <span className="text-base font-semibold tracking-tight italic">{APP_NAME}</span>
      </div>

      <div className="px-3">
        <Button className="w-full justify-start gap-2" onClick={handleCreateNote}>
          <Plus />
          New Note
        </Button>
      </div>

      <Separator className="my-3 bg-sidebar-border" />

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-0.5 px-2">
          <SidebarNavItem
            icon={Edit}
            label="Scratchpad"
            isActive={activeFolder === "scratchpad"}
            onClick={() => {
              setActiveFolder("scratchpad");
              getOrCreateScratchpadNote.mutate(undefined, {
                onSuccess: (note) => setSelectedNoteId(note.id),
              });
            }}
          />
          <SidebarNavItem
            icon={Book}
            label="Notes"
            count={notesCount}
            isActive={activeFolder === "notes" && !activeCategoryId}
            onClick={() => setActiveFolder("notes")}
          />
          <SidebarNavItem
            icon={Star}
            label="Favorites"
            count={favoritesCount}
            isActive={activeFolder === "favorites"}
            onClick={() => setActiveFolder("favorites")}
          />
          <SidebarNavItem
            icon={Trash2}
            label="Trash"
            count={trashCount}
            isActive={activeFolder === "trash"}
            onClick={() => setActiveFolder("trash")}
          />
        </nav>

        <Separator className="my-3 bg-sidebar-border" />

        <CategoryList />
      </ScrollArea>
    </aside>
  );
}
