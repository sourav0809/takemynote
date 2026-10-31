import { NoteGridCard } from "@/components/note-list/note-grid-card";
import type { Note } from "@/types/note";

interface NoteListGridProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelect: (id: string) => void;
}

export function NoteListGrid({ notes, selectedNoteId, onSelect }: NoteListGridProps) {
  return (
    // Columns follow the Library's own width, not the screen's.
    <div className="@container">
      <div className="grid grid-cols-1 gap-2 @xs:grid-cols-2">
        {notes.map((note) => (
          <NoteGridCard
            key={note.id}
            note={note}
            isSelected={selectedNoteId === note.id}
            onSelect={() => onSelect(note.id)}
          />
        ))}
      </div>
    </div>
  );
}
