"use client";

import { filterSuggestionItems } from "@blocknote/core";
import { SuggestionMenuController } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";

import { AiMenuButton } from "@/components/editor/ai/ai-menu-button";
import { AiSuggestionPanel } from "@/components/editor/ai/ai-suggestion-panel";
import { NoteFormattingToolbarController } from "@/components/editor/note-formatting-toolbar";
import { RichTextToolbar } from "@/components/editor/rich-text-toolbar";
import { SlashMenu } from "@/components/editor/slash-menu/slash-menu";
import { getSlashMenuItems } from "@/components/editor/slash-menu/slash-menu-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAiAssist } from "@/hooks/use-ai-assist";
import { useNoteEditor } from "@/hooks/use-note-editor";
import { usePreferences } from "@/hooks/use-preferences";
import type { WritingPosition } from "@/lib/data/preferences-storage";
import { cn } from "@/lib/utils";
import type { NoteContent } from "@/types/note";

const DARK_THEME = "dark";
const SCROLL_VIEWPORT_SELECTOR = '[data-slot="scroll-area-viewport"]';

/** Note column width and placement for each "Writing area" preference. */
const WRITING_COLUMN_CLASS: Record<WritingPosition, string> = {
  start: "max-w-[820px]",
  center: "mx-auto max-w-[760px]",
  full: "max-w-none",
};

export interface NoteEditorProps {
  initialContent: NoteContent;
  onContentChange: (content: NoteContent) => void;
  /** Sent with AI requests for context. */
  noteTitle: string;
  /** Rendered above the document inside the scroll area (title and meta line). */
  header?: React.ReactNode;
}

/**
 * The BlockNote-powered body editor: toolbar, "/" menu, AI suggestions and the
 * document. Client-only: load it through `DynamicNoteEditor`, keyed by note id.
 */
export function NoteEditor({
  initialContent,
  onContentChange,
  noteTitle,
  header,
}: NoteEditorProps) {
  const { resolvedTheme } = useTheme();
  const { textDirection, scrollPastEnd, writingPosition } = usePreferences();
  const editor = useNoteEditor(initialContent);
  const ai = useAiAssist(editor, noteTitle);
  const [scrollViewport, setScrollViewport] = useState<HTMLElement | null>(null);

  const editorContainerRef = useCallback((node: HTMLDivElement | null) => {
    setScrollViewport(node?.closest<HTMLElement>(SCROLL_VIEWPORT_SELECTOR) ?? null);
  }, []);

  const { run: runAi } = ai;
  const getSlashItems = useCallback(
    async (query: string) =>
      filterSuggestionItems(getSlashMenuItems(editor, (action) => void runAi(action)), query),
    [editor, runAi]
  );

  return (
    <>
      <RichTextToolbar
        editor={editor}
        trailing={
          <AiMenuButton isBusy={ai.state.status === "loading"} onRun={(action) => void ai.run(action)} />
        }
      />

      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div
            ref={editorContainerRef}
            className={cn(
              "w-full",
              WRITING_COLUMN_CLASS[writingPosition],
              scrollPastEnd ? "pb-[60vh]" : "pb-40"
            )}
          >
            {header}
            <div className="note-editor pt-3" dir={textDirection}>
              <BlockNoteView
                editor={editor}
                theme={resolvedTheme === DARK_THEME ? "dark" : "light"}
                formattingToolbar={false}
                slashMenu={false}
                onChange={(currentEditor) =>
                  onContentChange(currentEditor.document as NoteContent)
                }
              >
                <NoteFormattingToolbarController boundary={scrollViewport} />
                <SuggestionMenuController
                  triggerCharacter="/"
                  getItems={getSlashItems}
                  suggestionMenuComponent={SlashMenu}
                />
              </BlockNoteView>
            </div>
          </div>
        </ScrollArea>

        <AiSuggestionPanel
          state={ai.state}
          onApply={ai.apply}
          onRun={(action) => void ai.run(action)}
          onDismiss={ai.dismiss}
        />
      </div>
    </>
  );
}
