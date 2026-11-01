"use client";

import { TextSelection, type EditorState } from "prosemirror-state";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { useAi } from "@/components/ai/ai-provider";
import { useAiStream } from "@/hooks/use-ai-stream";
import { AI_MAX_INPUT_CHARS, type AiTask } from "@/lib/ai/prompts";
import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

/** Edit the selected text, or write something new at the cursor. */
export type InlineAiMode = "selection" | "write";

interface InlineAiSession {
  mode: InlineAiMode;
  /** ProseMirror range that gets replaced (equal for "write"). */
  from: number;
  to: number;
  /** The document when the panel opened; if it changes, positions are stale. */
  doc: EditorState["doc"];
  /** Markdown of just the selected part. */
  selection: string;
  /** Markdown of the note before the selection or cursor, for context. */
  context: string;
  /** Top-level block after which "Insert below" adds the result. */
  anchorBlockId: string;
}

/** CSS Custom Highlight name. */
const HIGHLIGHT_NAME = "ai-selection";
const HIGHLIGHT_STYLE_ID = "ai-selection-highlight";

function supportsHighlights(): boolean {
  return typeof CSS !== "undefined" && "highlights" in CSS;
}

/**
 * Adds the highlight colour once. It lives here, not in globals.css, because
 * Next's CSS parser doesn't know `::highlight()` yet: it warns on every build
 * and adds a solid-blue fallback.
 */
function ensureHighlightStyle(): void {
  if (document.getElementById(HIGHLIGHT_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = HIGHLIGHT_STYLE_ID;
  style.textContent = `::highlight(${HIGHLIGHT_NAME}) { background-color: color-mix(in oklch, var(--primary) 20%, transparent); }`;
  document.head.append(style);
}

/** Keeps the selection visibly marked while focus is in the AI panel. */
function highlightRange(editor: NoteBlockEditor, from: number, to: number): void {
  const view = editor.prosemirrorView;
  if (!view || !supportsHighlights() || from === to) return;
  try {
    const start = view.domAtPos(from);
    const end = view.domAtPos(to);
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    ensureHighlightStyle();
    CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(range));
  } catch {
    // A missing highlight is cosmetic only.
  }
}

function clearHighlight(): void {
  if (supportsHighlights()) CSS.highlights.delete(HIGHLIGHT_NAME);
}

/** Index in `editor.document` of the top-level block containing `blockId`. */
function topLevelIndex(editor: NoteBlockEditor, blockId: string): number {
  let id = blockId;
  for (let parent = editor.getParentBlock(id); parent; parent = editor.getParentBlock(id)) {
    id = parent.id;
  }
  return editor.document.findIndex((block) => block.id === id);
}

function captureSession(editor: NoteBlockEditor): InlineAiSession | null {
  if (!editor.prosemirrorView) return null;
  const { doc, selection } = editor.prosemirrorState;
  const { document } = editor;

  if (!selection.empty) {
    const cut = editor.getSelectionCutBlocks();
    // Cut blocks come back loosely typed; they are blocks of this editor's schema.
    const markdown = editor.blocksToMarkdownLossy(cut.blocks as typeof document).trim();
    const spanned = editor.getSelection()?.blocks ?? cut.blocks;
    if (markdown && spanned.length > 0) {
      const firstIndex = topLevelIndex(editor, spanned[0].id);
      const lastIndex = topLevelIndex(editor, spanned[spanned.length - 1].id);
      return {
        mode: "selection",
        from: selection.from,
        to: selection.to,
        doc,
        selection: markdown,
        context: editor.blocksToMarkdownLossy(document.slice(0, Math.max(firstIndex, 0))),
        anchorBlockId: document[lastIndex]?.id ?? document[document.length - 1].id,
      };
    }
  }

  const index = topLevelIndex(editor, editor.getTextCursorPosition().block.id);
  return {
    mode: "write",
    from: selection.from,
    to: selection.from,
    doc,
    selection: "",
    context: editor.blocksToMarkdownLossy(document.slice(0, index + 1)),
    anchorBlockId: document[index]?.id ?? document[document.length - 1].id,
  };
}

/**
 * The inline AI panel's logic: capture the selection (or cursor), stream a
 * rewrite, then replace exactly that range or insert the result below.
 * Nothing in the note changes until the user accepts.
 */
export function useInlineAi(editor: NoteBlockEditor, noteTitle: string) {
  const { requireAi } = useAi();
  const { state, start, stop, reset } = useAiStream();
  const [session, setSession] = useState<InlineAiSession | null>(null);
  const lastTaskRef = useRef<AiTask | null>(null);

  const open = useCallback(() => {
    const captured = captureSession(editor);
    if (!captured) return;
    if (captured.selection.length > AI_MAX_INPUT_CHARS) {
      toast.error("This selection is very long. Try a smaller part.");
      return;
    }
    requireAi(() => {
      reset();
      lastTaskRef.current = null;
      setSession(captured);
      highlightRange(editor, captured.from, captured.to);
    });
  }, [editor, requireAi, reset]);

  const close = useCallback(() => {
    reset();
    clearHighlight();
    setSession(null);
    editor.focus();
  }, [editor, reset]);

  /** Runs an instruction. Once there is a result, further instructions refine it. */
  const run = useCallback(
    (instruction: string) => {
      if (!session || !instruction.trim()) return;
      const draft = state.status === "done" ? state.text : "";
      const task: AiTask =
        draft || session.mode === "selection"
          ? { kind: "selection", instruction, title: noteTitle, selection: draft || session.selection, context: session.context }
          : { kind: "write", instruction, title: noteTitle, context: session.context };
      lastTaskRef.current = task;
      void start(task);
    },
    [session, state.status, state.text, noteTitle, start]
  );

  const retry = useCallback(() => {
    if (lastTaskRef.current) void start(lastTaskRef.current);
  }, [start]);

  const insertBelow = useCallback(() => {
    if (!session || state.status !== "done") return;
    const blocks = editor.tryParseMarkdownToBlocks(state.text);
    if (editor.getBlock(session.anchorBlockId)) {
      editor.insertBlocks(blocks, session.anchorBlockId, "after");
    } else {
      editor.insertBlocks(blocks, editor.document[editor.document.length - 1], "after");
    }
    close();
  }, [editor, session, state.status, state.text, close]);

  /** Replaces the selection (or inserts at the cursor) with the result. One undo reverts it. */
  const accept = useCallback(() => {
    if (!session || state.status !== "done") return;
    if (editor.prosemirrorState.doc !== session.doc) {
      // The note was edited meanwhile, so the saved range may point elsewhere.
      toast("The note changed, so the result was added below instead.");
      insertBelow();
      return;
    }
    clearHighlight();
    editor.focus();
    editor.transact((tr) => tr.setSelection(TextSelection.create(tr.doc, session.from, session.to)));
    editor.pasteMarkdown(state.text);
    reset();
    setSession(null);
  }, [editor, session, state.status, state.text, insertBelow, reset]);

  /** Where the panel anchors: the selected lines, across the full editor width. */
  const getAnchorRect = useCallback((): DOMRect => {
    const view = editor.prosemirrorView;
    if (!view || !session) return new DOMRect();
    const box = view.dom.getBoundingClientRect();
    try {
      const startCoords = view.coordsAtPos(session.from);
      const endCoords = view.coordsAtPos(session.to);
      return new DOMRect(box.left, startCoords.top, box.width, Math.max(endCoords.bottom - startCoords.top, 0));
    } catch {
      return box;
    }
  }, [editor, session]);

  /** The editor element, so the panel can follow it while scrolling. Call only once mounted. */
  const getEditorElement = useCallback((): HTMLElement | undefined => {
    try {
      return editor.prosemirrorView?.dom;
    } catch {
      return undefined;
    }
  }, [editor]);

  return {
    mode: session?.mode ?? null,
    isOpen: session !== null,
    state,
    open,
    close,
    run,
    retry,
    stop,
    accept,
    insertBelow,
    getAnchorRect,
    getEditorElement,
  };
}

export type InlineAi = ReturnType<typeof useInlineAi>;
