"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { readAiConfig } from "@/lib/ai/ai-config";
import { isAbortError, toFriendlyAiError, type FriendlyAiError } from "@/lib/ai/ai-errors";
import type { AiTask } from "@/lib/ai/prompts";
import { streamWritingTask } from "@/lib/ai/writing-agent";

export type AiStreamStatus = "idle" | "streaming" | "done" | "error";

export interface AiStreamState {
  status: AiStreamStatus;
  /** Markdown written so far; complete once status is "done". */
  text: string;
  error: FriendlyAiError | null;
}

const IDLE_STATE: AiStreamState = { status: "idle", text: "", error: null };
const EMPTY_ANSWER: FriendlyAiError = { message: "AI returned nothing. Try again.", needsSetup: false };

/** Models sometimes wrap the whole answer in a ```markdown fence despite the rules. */
function stripWrappingFence(markdown: string): string {
  const match = markdown.trim().match(/^```(?:markdown|md)?\n([\s\S]*?)\n```$/);
  return match ? match[1] : markdown.trim();
}

/** Runs one writing task at a time and streams its text. Starting again cancels the last run. */
export function useAiStream() {
  const [state, setState] = useState<AiStreamState>(IDLE_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (task: AiTask) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ status: "streaming", text: "", error: null });

    try {
      let text = "";
      for await (const delta of await streamWritingTask(task, controller.signal)) {
        if (controller.signal.aborted) return;
        text += delta;
        setState({ status: "streaming", text, error: null });
      }
      if (controller.signal.aborted) return;
      const result = stripWrappingFence(text);
      setState(result ? { status: "done", text: result, error: null } : { status: "error", text: "", error: EMPTY_ANSWER });
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return;
      setState({ status: "error", text: "", error: toFriendlyAiError(error, readAiConfig().provider) });
    }
  }, []);

  /** Stops writing and keeps what has arrived so far. */
  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((current) => {
      if (current.status !== "streaming") return current;
      const text = stripWrappingFence(current.text);
      return text ? { status: "done", text, error: null } : IDLE_STATE;
    });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(IDLE_STATE);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { state, start, stop, reset };
}
