import { useState } from "react";
import { Menu } from "lucide-react";

import { ClassicListPane } from "@/components/classic/classic-list-pane";
import { ClassicSidebar } from "@/components/classic/classic-sidebar";
import { EditorPane } from "@/components/editor/editor-pane";
import { LibraryPane } from "@/components/library/library-pane";
import { NewNoteButton } from "@/components/library/new-note-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useNotes } from "@/hooks/use-notes";
import { FOLDER_LABELS } from "@/lib/constants";
import type { AppLayout } from "@/lib/data/preferences-storage";

/** Phones and tablets: one screen at a time, the list or the open Page. */
export function MobileShell({ layout }: { layout: AppLayout }) {
  const { activeFolder, activeCategoryId, selectedNoteId, isNoteOpen, closeNote, setActiveFolder } =
    useAppState();
  const { data: notes } = useNotes();
  const { data: categories } = useCategories();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const isScratchpad = activeFolder === "scratchpad";
  const hasSelectedNote = notes.some((note) => note.id === selectedNoteId);
  const backLabel =
    categories.find((category) => category.id === activeCategoryId)?.name ??
    FOLDER_LABELS[isScratchpad ? "notes" : activeFolder];

  const handleBack = () => {
    // The scratchpad is a single page, so "back" returns to all notes.
    if (isScratchpad) setActiveFolder("notes");
    closeNote();
  };

  if (isNoteOpen && hasSelectedNote) {
    return (
      <div className="h-dvh">
        <EditorPane onBack={handleBack} backLabel={backLabel} />
      </div>
    );
  }

  if (layout === "library") {
    return (
      <div className="h-dvh">
        <LibraryPane />
      </div>
    );
  }

  return (
    <div className="h-dvh">
      <ClassicListPane
        leadingAction={
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        }
        trailingAction={<NewNoteButton />}
      />
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <ClassicSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
