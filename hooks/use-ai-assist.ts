"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useAi } from "@/components/ai/ai-provider";
import { useAiStream } from "@/hooks/use-ai-stream";
import { AI_ACTION_CONFIG, type AiAction } from "@/lib/ai/ai-actions";
import { AI_MAX_INPUT_CHARS } from "@/lib/ai/prompts";
import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

/** Runs a whole-note AI action and applies the accepted result to the editor. */
export function useAiAssist(editor: NoteBlockEditor, noteTitle: string) {
  const { requireAi } = useAi();
  const { state, start, stop, reset } = useAiStream();
  const [action, setAction] = useState<AiAction | null>(null);

  const run = useCallback(
    (next: AiAction) => {
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      if (!markdown.trim() && !noteTitle.trim()) {
        toast("Write something first, then ask AI.");
        return;
      }
      if (markdown.length > AI_MAX_INPUT_CHARS) {
        toast.error("This note is too long for AI. Select a part of it and press Ask AI instead.");
        return;
      }
      requireAi(() => {
        setAction(next);
        void start({ kind: "note", action: next, title: noteTitle, markdown });
      });
    },
    [editor, noteTitle, requireAi, start]
  );

  const dismiss = useCallback(() => {
    reset();
    setAction(null);
  }, [reset]);

  const apply = useCallback(() => {
    if (!action || state.status !== "done") return;
    const blocks = editor.tryParseMarkdownToBlocks(state.text);
    const { document } = editor;
    const mode = AI_ACTION_CONFIG[action].applyMode;

    if (mode === "replace") {
      editor.replaceBlocks(document, blocks);
    } else if (mode === "prepend") {
      editor.insertBlocks(blocks, document[0], "before");
    } else {
      editor.insertBlocks(blocks, document[document.length - 1], "after");
    }
    dismiss();
  }, [editor, action, state.status, state.text, dismiss]);

  return { action, state, run, apply, stop, dismiss };
}
