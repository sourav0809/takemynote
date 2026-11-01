import { PaneToggleButton } from "@/components/app-shell/pane-toggle-button";
import { BrandHomeLink } from "@/components/brand/brand-home-link";
import { FolderSwitcher } from "@/components/library/folder-switcher";
import { LibraryFooter } from "@/components/library/library-footer";
import { NewNoteButton } from "@/components/library/new-note-button";
import { NoteListBody } from "@/components/library/note-list-body";
import { NoteListControls } from "@/components/library/note-list-controls";
import { NoteListViewToggle } from "@/components/note-list/note-list-view-toggle";
import { NoteSearchBar } from "@/components/note-list/note-search-bar";
import { useAppState } from "@/hooks/use-app-state";

/** Library layout's left column: folder switcher, search, filters and notes. */
interface LibraryPaneProps {
  /** Desktop: hides this column. */
  onCollapse?: () => void;
}

export function LibraryPane({ onCollapse }: LibraryPaneProps) {
  const { activeFolder, searchQuery, setSearchQuery, listView, setListView } = useAppState();
  const isScratchpad = activeFolder === "scratchpad";

  return (
    <aside className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 pr-3 pl-4">
        <BrandHomeLink />
        <div className="flex items-center gap-1">
          <NewNoteButton />
          {onCollapse && <PaneToggleButton action="hide" label="Collapse sidebar" onClick={onCollapse} />}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 px-3 pb-2">
        <NoteSearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="flex h-9 items-center justify-between gap-2 pl-1">
          <FolderSwitcher />
          {!isScratchpad && <NoteListViewToggle value={listView} onValueChange={setListView} />}
        </div>
        {!isScratchpad && <NoteListControls />}
      </div>

      <NoteListBody className="min-h-0 flex-1 border-t border-border" />

      <LibraryFooter />
    </aside>
  );
}
