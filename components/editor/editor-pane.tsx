import { EditorContent } from "@tiptap/react";
import { toast } from "sonner";

import { EditorBottomBar } from "@/components/editor/editor-bottom-bar";
import { EditorEmptyState } from "@/components/editor/editor-empty-state";
import { EditorHeader } from "@/components/editor/editor-header";
import { RichTextToolbar } from "@/components/editor/rich-text-toolbar";
import { SelectionBubbleMenu } from "@/components/editor/selection-bubble-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { useNoteEditor } from "@/hooks/use-note-editor";
import { useNotes, useUpdateNote } from "@/hooks/use-notes";
import { downloadNoteAsMarkdown } from "@/lib/download-note";

export function EditorPane() {
  const { selectedNoteId, setSelectedNoteId } = useAppState();
  const { data: notes } = useNotes();
  const { data: categories } = useCategories();
  const updateNote = useUpdateNote();

  const activeNote = notes.find((note) => note.id === selectedNoteId);

  const editor = useNoteEditor({
    noteId: activeNote?.id ?? "empty",
    content: activeNote?.content ?? "",
    onUpdateContent: (content) => {
      if (activeNote) {
        updateNote.mutate({ id: activeNote.id, changes: { content } });
      }
    },
  });

  if (!activeNote || !editor) {
    return <EditorEmptyState />;
  }

  const category = activeNote.categoryId
    ? categories.find((item) => item.id === activeNote.categoryId)
    : undefined;

  return (
    <div className="flex h-full flex-col">
      <EditorHeader
        note={activeNote}
        category={category}
        onTitleChange={(title) =>
          updateNote.mutate({ id: activeNote.id, changes: { title } })
        }
      />
      <RichTextToolbar editor={editor} />

      <ScrollArea className="flex-1">
        <div className="px-4 pt-4 pb-24 sm:px-6">
          <SelectionBubbleMenu editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </ScrollArea>

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
        onDownload={() => downloadNoteAsMarkdown(activeNote)}
      />
    </div>
  );
}
