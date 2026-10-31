import { DynamicNoteEditor } from "@/components/editor/dynamic-note-editor";
import { EditorEmptyState } from "@/components/editor/editor-empty-state";
import { EditorHeader } from "@/components/editor/editor-header";
import { PageTopBar } from "@/components/editor/page-top-bar";
import { useAppState } from "@/hooks/use-app-state";
import { useNotes, useUpdateNote } from "@/hooks/use-notes";

interface EditorPaneProps {
  /** Phone/tablet only: shows a back link to the Library. */
  onBack?: () => void;
  backLabel?: string;
}

/** The Page: top bar, formatting toolbar, then the note in a reading column. */
export function EditorPane({ onBack, backLabel }: EditorPaneProps) {
  const { selectedNoteId } = useAppState();
  const { data: notes } = useNotes();
  const updateNote = useUpdateNote();

  const activeNote = notes.find((note) => note.id === selectedNoteId);

  if (!activeNote) {
    return <EditorEmptyState />;
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <PageTopBar note={activeNote} onBack={onBack} backLabel={backLabel} />

      {/* Keyed by note id: switching notes mounts a fresh editor, while typing
          in the current note never resets cursor position or undo history. */}
      <DynamicNoteEditor
        key={activeNote.id}
        initialContent={activeNote.content}
        noteTitle={activeNote.title}
        onContentChange={(content) =>
          updateNote.mutate({ id: activeNote.id, changes: { content } })
        }
        header={
          <EditorHeader
            note={activeNote}
            onTitleChange={(title) =>
              updateNote.mutate({ id: activeNote.id, changes: { title } })
            }
          />
        }
      />
    </div>
  );
}
