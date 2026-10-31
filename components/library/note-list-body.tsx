import { Fragment, useEffect } from "react";

import { LibraryEmptyMessage } from "@/components/library/library-empty-message";
import { NoteListGrid } from "@/components/note-list/note-list-grid";
import { NoteListItem } from "@/components/note-list/note-list-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/hooks/use-app-state";
import { useFilteredNotes } from "@/hooks/use-filtered-notes";
import type { Note } from "@/types/note";

interface NoteGroup {
  label: string | null;
  notes: Note[];
}

/** Splits pinned notes into their own group when the list mixes both. */
function groupNotes(notes: Note[], canGroup: boolean): NoteGroup[] {
  const pinned = notes.filter((note) => note.pinned);
  if (!canGroup || pinned.length === 0 || pinned.length === notes.length) {
    return [{ label: null, notes }];
  }
  return [
    { label: "Pinned", notes: pinned },
    { label: "Notes", notes: notes.filter((note) => !note.pinned) },
  ];
}

/** The scrolling list of notes (rows or cards), shared by both layouts. */
export function NoteListBody({ className }: { className?: string }) {
  const { activeFolder, searchQuery, selectedNoteId, setSelectedNoteId, openNote, listView, listFilter } =
    useAppState();
  const notes = useFilteredNotes();

  useEffect(() => {
    if (selectedNoteId || activeFolder === "trash" || notes.length === 0) return;
    setSelectedNoteId(notes[0].id);
  }, [selectedNoteId, activeFolder, notes, setSelectedNoteId]);

  const groups = groupNotes(notes, listFilter === "all" && !searchQuery.trim());

  return (
    <ScrollArea className={className}>
      <div className="flex flex-col gap-0.5 p-2">
        {notes.length === 0 ? (
          <LibraryEmptyMessage />
        ) : (
          groups.map((group) => (
            <Fragment key={group.label ?? "all"}>
              {group.label && (
                <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase first:pt-1">
                  {group.label}
                </p>
              )}
              {listView === "grid" ? (
                <NoteListGrid notes={group.notes} selectedNoteId={selectedNoteId} onSelect={openNote} />
              ) : (
                group.notes.map((note) => (
                  <NoteListItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelect={() => openNote(note.id)}
                  />
                ))
              )}
            </Fragment>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
