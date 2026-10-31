import { getNoteDisplayTitle } from "@/lib/note-utils";
import type { Note } from "@/types/note";

const FALLBACK_FILE_NAME = "note";

export async function downloadNoteAsMarkdown(note: Note): Promise<void> {
  // The converter pulls in the BlockNote engine, so load it only on demand.
  const { noteContentToMarkdown } = await import("@/lib/editor/note-content-converter");

  const title = getNoteDisplayTitle(note.title);
  const safeFileName = title.replace(/[^a-z0-9-_ ]/gi, "").trim() || FALLBACK_FILE_NAME;
  const body = noteContentToMarkdown(note.content).trim();
  const fileContent = body ? `# ${title}\n\n${body}\n` : `# ${title}\n`;

  const blob = new Blob([fileContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName}.md`;
  link.click();

  URL.revokeObjectURL(url);
}
