import { getNoteDisplayTitle, getNotePlainText } from "@/lib/note-utils";
import type { Note } from "@/types/note";

export function downloadNoteAsMarkdown(note: Note): void {
  const title = getNoteDisplayTitle(note.title);
  const safeFileName = title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "note";
  const body = getNotePlainText(note.content);
  const fileContent = `# ${title}\n\n${body}`;

  const blob = new Blob([fileContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${safeFileName}.md`;
  link.click();

  URL.revokeObjectURL(url);
}
