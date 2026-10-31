import { BlockNoteEditor } from "@blocknote/core";

import { noteEditorSchema } from "@/lib/editor/note-editor-schema";
import type { Note, NoteContent } from "@/types/note";

function createHeadlessEditor() {
  return BlockNoteEditor.create({ schema: noteEditorSchema });
}

type HeadlessNoteEditor = ReturnType<typeof createHeadlessEditor>;

let headlessEditor: HeadlessNoteEditor | null = null;

// A single never-mounted editor instance, used only for format conversion
// (HTML -> blocks for legacy notes, blocks -> Markdown for exports).
function getHeadlessEditor(): HeadlessNoteEditor {
  headlessEditor ??= createHeadlessEditor();
  return headlessEditor;
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function htmlToNoteContent(html: string): NoteContent {
  if (!html.trim()) return [];
  const editor = getHeadlessEditor();
  try {
    return editor.tryParseHTMLToBlocks(html) as NoteContent;
  } catch {
    // Never drop a legacy note: if its HTML can't be parsed into blocks,
    // keep the text as plain paragraphs instead.
    return editor.tryParseMarkdownToBlocks(stripHtmlTags(html)) as NoteContent;
  }
}

export function markdownToNoteContent(markdown: string): NoteContent {
  if (!markdown.trim()) return [];
  return getHeadlessEditor().tryParseMarkdownToBlocks(markdown) as NoteContent;
}

export function noteContentToHtml(content: NoteContent): string {
  if (content.length === 0) return "";
  return getHeadlessEditor().blocksToHTMLLossy(content);
}

export function noteContentToMarkdown(content: NoteContent): string {
  if (content.length === 0) return "";
  return getHeadlessEditor().blocksToMarkdownLossy(content);
}

/**
 * Accepts note content in any format this app has ever stored — the legacy
 * Tiptap HTML string or the current BlockNote block array — and returns
 * BlockNote blocks.
 */
export function normalizeNoteContent(content: unknown): NoteContent {
  if (Array.isArray(content)) return content as NoteContent;
  if (typeof content === "string") return htmlToNoteContent(content);
  return [];
}

export function normalizeNotesContent(notes: Note[]): Note[] {
  return notes.map((note) => ({ ...note, content: normalizeNoteContent(note.content) }));
}
