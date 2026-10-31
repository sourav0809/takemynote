import { toast } from "sonner";

import { DynamicNoteEditor } from "@/components/editor/dynamic-note-editor";
import { EditorBottomBar } from "@/components/editor/editor-bottom-bar";
import { EditorEmptyState } from "@/components/editor/editor-empty-state";
import { EditorHeader } from "@/components/editor/editor-header";
import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useNotes, useUpdateNote } from "@/hooks/use-notes";
import { downloadNoteAsMarkdown } from "@/lib/download-note";

export function EditorPane() {
  const { selectedNoteId, setSelectedNoteId } = useAppState();
  const { data: notes } = useNotes();
  const { data: categories } = useCategories();
  const updateNote = useUpdateNote();

  const activeNote = notes.find((note) => note.id === selectedNoteId);

  if (!activeNote) {
    return <EditorEmptyState />;
  }

  const category = activeNote.categoryId
    ? categories.find((item) => item.id === activeNote.categoryId)
    : undefined;

  const handleDownload = async () => {
    try {
      await downloadNoteAsMarkdown(activeNote);
    } catch {
      toast.error("Could not export this note");
    }
  };

  return (
    <div className="flex h-full flex-col">
      <EditorHeader
        note={activeNote}
        category={category}
        onTitleChange={(title) =>
          updateNote.mutate({ id: activeNote.id, changes: { title } })
        }
      />

      {/* Keyed by note id: switching notes mounts a fresh editor, while typing
          in the current note never resets cursor position or undo history. */}
      <DynamicNoteEditor
        key={activeNote.id}
        initialContent={activeNote.content}
        onContentChange={(content) =>
          updateNote.mutate({ id: activeNote.id, changes: { content } })
        }
      />

      <EditorBottomBar
        note={activeNote}
        onToggleFavorite={() =>
          updateNote.mutate({
            id: activeNote.id,
            changes: { favorited: !activeNote.favorited },
          })
        }
        onMoveToTrash={() => {
          updateNote.mutate({ id: activeNote.id, changes: { trashed: true } });
          setSelectedNoteId(null);
          toast.success("Note moved to trash");
        }}
        onDownload={() => void handleDownload()}
      />
    </div>
  );
}
