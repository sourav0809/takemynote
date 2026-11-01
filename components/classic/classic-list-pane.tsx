import { NoteListBody } from "@/components/library/note-list-body";
import { NoteListControls } from "@/components/library/note-list-controls";
import { NoteListViewToggle } from "@/components/note-list/note-list-view-toggle";
import { NoteSearchBar } from "@/components/note-list/note-search-bar";
import { useAppState } from "@/hooks/use-app-state";
import { useFilteredNotes } from "@/hooks/use-filtered-notes";
import { useFolderNavigation } from "@/hooks/use-folder-navigation";

interface ClassicListPaneProps {
  /** Phone only: a header row with the menu and new-note buttons around the title. */
  leadingAction?: React.ReactNode;
  trailingAction?: React.ReactNode;
}

/** Classic layout's middle column: search, filters and the notes. */
export function ClassicListPane({
  leadingAction,
  trailingAction,
}: ClassicListPaneProps) {
  const { activeFolder, searchQuery, setSearchQuery, listView, setListView } = useAppState();
  const { activeLabel } = useFolderNavigation();
  const notes = useFilteredNotes();
  const isScratchpad = activeFolder === "scratchpad";
  const hasHeader = Boolean(leadingAction || trailingAction);

  return (
    <section aria-label={activeLabel} className="flex h-full flex-col bg-background">
      {hasHeader && (
        <div className="flex h-14 shrink-0 items-center gap-1 px-2">
          {leadingAction}
          <h1 className="flex min-w-0 flex-1 items-baseline gap-2 px-1">
            <span className="truncate text-lg font-semibold tracking-tight">{activeLabel}</span>
            <span className="text-sm text-muted-foreground tabular-nums">{notes.length}</span>
          </h1>
          {trailingAction}
        </div>
      )}

      <div className={hasHeader ? "flex flex-col gap-2 px-3 pb-2" : "flex flex-col gap-2 px-3 pt-3 pb-2"}>
        <div className="flex items-center gap-2">
          <NoteSearchBar value={searchQuery} onChange={setSearchQuery} />
          {!isScratchpad && <NoteListViewToggle value={listView} onValueChange={setListView} />}
        </div>
        {!isScratchpad && <NoteListControls />}
      </div>

      <NoteListBody className="min-h-0 flex-1 border-t border-border" />
    </section>
  );
}
