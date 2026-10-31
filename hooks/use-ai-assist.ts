"use client";

import { useCallback, useRef, useState } from "react";

import {
  AI_ACTION_CONFIG,
  type AiAction,
  type AiRequestBody,
  type AiResponseBody,
} from "@/lib/ai/ai-actions";
import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

const AI_ENDPOINT = "/api/ai";

export type AiStatus = "idle" | "loading" | "done" | "error";

export interface AiAssistState {
  action: AiAction | null;
  status: AiStatus;
  text: string;
  error: string;
}

const IDLE_STATE: AiAssistState = { action: null, status: "idle", text: "", error: "" };

/** Runs an AI action on the open note and applies the accepted result to the editor. */
export function useAiAssist(editor: NoteBlockEditor, noteTitle: string) {
  const [state, setState] = useState<AiAssistState>(IDLE_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (action: AiAction) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ action, status: "loading", text: "", error: "" });

      const body: AiRequestBody = {
        action,
        title: noteTitle,
        markdown: editor.blocksToMarkdownLossy(editor.document),
      };

      try {
        const response = await fetch(AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = (await response.json()) as AiResponseBody;
        if (!response.ok || !data.text) {
          setState({ action, status: "error", text: "", error: data.error ?? "Something went wrong." });
          return;
        }
        setState({ action, status: "done", text: data.text, error: "" });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          action,
          status: "error",
          text: "",
          error: error instanceof Error ? "Could not reach AI. Check your connection." : "Something went wrong.",
        });
      }
    },
    [editor, noteTitle]
  );

  const dismiss = useCallback(() => {
    abortRef.current?.abort();
    setState(IDLE_STATE);
  }, []);

  const apply = useCallback(() => {
    if (!state.action || !state.text) return;
    const blocks = editor.tryParseMarkdownToBlocks(state.text);
    const { document } = editor;
    const mode = AI_ACTION_CONFIG[state.action].applyMode;

    if (mode === "replace") {
      editor.replaceBlocks(document, blocks);
    } else if (mode === "prepend") {
      editor.insertBlocks(blocks, document[0], "before");
    } else {
      editor.insertBlocks(blocks, document[document.length - 1], "after");
    }
    setState(IDLE_STATE);
  }, [editor, state.action, state.text]);

  return { state, run, apply, dismiss };
}
