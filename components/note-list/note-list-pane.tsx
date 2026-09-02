import { useEffect } from "react";

import { NoteListFilterTabs } from "@/components/note-list/note-list-filter-tabs";
import { NoteListGrid } from "@/components/note-list/note-list-grid";
import { NoteListItem } from "@/components/note-list/note-list-item";
import { NoteListViewToggle } from "@/components/note-list/note-list-view-toggle";
import { NoteSearchBar } from "@/components/note-list/note-search-bar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useFilteredNotes } from "@/hooks/use-filtered-notes";
import { useEmptyTrash, useDeleteNotePermanently, useUpdateNote } from "@/hooks/use-notes";

export function NoteListPane() {
  const {
    activeFolder,
    searchQuery,
    setSearchQuery,
    selectedNoteId,
    setSelectedNoteId,
    listView,
    setListView,
    listFilter,
    setListFilter,
  } = useAppState();
  const notes = useFilteredNotes();
  const { data: categories } = useCategories();
  const updateNote = useUpdateNote();
  const deleteNotePermanently = useDeleteNotePermanently();
  const emptyTrash = useEmptyTrash();

  useEffect(() => {
    if (selectedNoteId || activeFolder === "trash" || notes.length === 0) return;
    setSelectedNoteId(notes[0].id);
  }, [selectedNoteId, activeFolder, notes, setSelectedNoteId]);

  const categoryById = new Map(categories.map((category) => [category.id, category]));

  const noteActions = {
    onSelect: (id: string) => setSelectedNoteId(id),
    onToggleFavorite: (id: string, favorited: boolean) =>
      updateNote.mutate({ id, changes: { favorited: !favorited } }),
    onTogglePinned: (id: string, pinned: boolean) =>
      updateNote.mutate({ id, changes: { pinned: !pinned } }),
    onMoveToTrash: (id: string) =>
      updateNote.mutate({ id, changes: { trashed: true } }),
    onRestore: (id: string) =>
      updateNote.mutate({ id, changes: { trashed: false } }),
    onDeletePermanently: (id: string) => deleteNotePermanently.mutate(id),
  };

  return (
    <aside className="flex h-full flex-col bg-muted/40">
      <div className="flex flex-col gap-2.5 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-2">
          <NoteSearchBar value={searchQuery} onChange={setSearchQuery} />
          <NoteListViewToggle value={listView} onValueChange={setListView} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <NoteListFilterTabs value={listFilter} onValueChange={setListFilter} />
          {activeFolder === "trash" && notes.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => emptyTrash.mutate()}>
              Empty Trash
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {notes.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No notes here yet.
          </p>
        ) : listView === "grid" ? (
          <NoteListGrid
            notes={notes}
            categoryById={categoryById}
            selectedNoteId={selectedNoteId}
            actions={noteActions}
          />
        ) : (
          notes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              category={note.categoryId ? categoryById.get(note.categoryId) : undefined}
              isSelected={selectedNoteId === note.id}
              onSelect={() => noteActions.onSelect(note.id)}
              onToggleFavorite={() => noteActions.onToggleFavorite(note.id, note.favorited)}
              onTogglePinned={() => noteActions.onTogglePinned(note.id, note.pinned)}
              onMoveToTrash={() => noteActions.onMoveToTrash(note.id)}
              onRestore={() => noteActions.onRestore(note.id)}
              onDeletePermanently={() => noteActions.onDeletePermanently(note.id)}
            />
          ))
        )}
      </ScrollArea>
    </aside>
  );
}
