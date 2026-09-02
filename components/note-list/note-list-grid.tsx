import type { Category, Note } from "@/types/note";
import { NoteGridCard } from "@/components/note-list/note-grid-card";

interface NoteActions {
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string, favorited: boolean) => void;
  onTogglePinned: (id: string, pinned: boolean) => void;
  onMoveToTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onDeletePermanently: (id: string) => void;
}

interface NoteListGridProps {
  notes: Note[];
  categoryById: Map<string, Category>;
  selectedNoteId: string | null;
  actions: NoteActions;
}

export function NoteListGrid({
  notes,
  categoryById,
  selectedNoteId,
  actions,
}: NoteListGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
      {notes.map((note) => (
        <NoteGridCard
          key={note.id}
          note={note}
          category={note.categoryId ? categoryById.get(note.categoryId) : undefined}
          isSelected={selectedNoteId === note.id}
          onSelect={() => actions.onSelect(note.id)}
          onToggleFavorite={() => actions.onToggleFavorite(note.id, note.favorited)}
          onTogglePinned={() => actions.onTogglePinned(note.id, note.pinned)}
          onMoveToTrash={() => actions.onMoveToTrash(note.id)}
          onRestore={() => actions.onRestore(note.id)}
          onDeletePermanently={() => actions.onDeletePermanently(note.id)}
        />
      ))}
    </div>
  );
}
