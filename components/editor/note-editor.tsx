"use client";

import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";

import { NoteFormattingToolbarController } from "@/components/editor/note-formatting-toolbar";
import { RichTextToolbar } from "@/components/editor/rich-text-toolbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoteEditor } from "@/hooks/use-note-editor";
import type { NoteContent } from "@/types/note";

const DARK_THEME = "dark";
const SCROLL_VIEWPORT_SELECTOR = '[data-slot="scroll-area-viewport"]';

export interface NoteEditorProps {
  initialContent: NoteContent;
  onContentChange: (content: NoteContent) => void;
}

/**
 * The BlockNote-powered body editor (fixed toolbar + document). Client-only:
 * load it through `DynamicNoteEditor`, keyed by note id.
 */
export function NoteEditor({ initialContent, onContentChange }: NoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const editor = useNoteEditor(initialContent);
  const [scrollViewport, setScrollViewport] = useState<HTMLElement | null>(null);

  const editorContainerRef = useCallback((node: HTMLDivElement | null) => {
    setScrollViewport(node?.closest<HTMLElement>(SCROLL_VIEWPORT_SELECTOR) ?? null);
  }, []);

  return (
    <>
      <RichTextToolbar editor={editor} />

      <ScrollArea className="min-h-0 flex-1">
        <div ref={editorContainerRef} className="note-editor pt-4 pb-24">
          <BlockNoteView
            editor={editor}
            theme={resolvedTheme === DARK_THEME ? "dark" : "light"}
            formattingToolbar={false}
            onChange={(currentEditor) =>
              onContentChange(currentEditor.document as NoteContent)
            }
          >
            <NoteFormattingToolbarController boundary={scrollViewport} />
          </BlockNoteView>
        </div>
      </ScrollArea>
    </>
  );
}
