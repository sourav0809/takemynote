import { NoteListFilterTabs } from "@/components/note-list/note-list-filter-tabs";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { useFilteredNotes } from "@/hooks/use-filtered-notes";
import { useEmptyTrash } from "@/hooks/use-notes";

/** All / Recent / Pinned filters, plus "Empty trash" while viewing Trash. */
export function NoteListControls() {
  const { activeFolder, listFilter, setListFilter } = useAppState();
  const notes = useFilteredNotes();
  const emptyTrash = useEmptyTrash();

  return (
    <div className="flex items-center justify-between gap-2">
      <NoteListFilterTabs value={listFilter} onValueChange={setListFilter} />
      {activeFolder === "trash" && notes.length > 0 && (
        <Button variant="destructive" size="sm" onClick={() => emptyTrash.mutate()}>
          Empty trash
        </Button>
      )}
    </div>
  );
}
