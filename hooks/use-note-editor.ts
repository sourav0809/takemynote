import { useEditor } from "@tiptap/react";

import { createNoteEditorExtensions } from "@/lib/tiptap-extensions";

interface UseNoteEditorOptions {
  noteId: string;
  content: string;
  onUpdateContent: (html: string) => void;
  placeholder?: string;
}

export function useNoteEditor({
  noteId,
  content,
  onUpdateContent,
  placeholder = "Start writing...",
}: UseNoteEditorOptions) {
  return useEditor(
    {
      extensions: createNoteEditorExtensions(placeholder),
      content,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            "tiptap prose prose-neutral dark:prose-invert max-w-none focus:outline-none " +
            "prose-lg leading-relaxed prose-p:my-1.5 prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-2 " +
            "prose-code:rounded-md prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 " +
            "prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground " +
            "prose-blockquote:border-l-primary prose-a:text-primary prose-li:my-1",
        },
      },
      onUpdate: ({ editor }) => {
        onUpdateContent(editor.getHTML());
      },
    },
    // Recreate the editor only when switching to a different note, so typing
    // in the current note never resets cursor position or undo history.
    [noteId]
  );
}
