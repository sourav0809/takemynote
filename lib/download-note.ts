import { APP_NAME } from "@/lib/constants";
import { downloadNoteAsPdf } from "@/lib/export/note-pdf";
import { formatFullDate, getNoteDisplayTitle } from "@/lib/note-utils";
import type { Note } from "@/types/note";

export type NoteExportFormat = "pdf" | "markdown" | "text" | "html" | "json";

export const NOTE_EXPORT_FORMATS: { format: NoteExportFormat; label: string; hint: string }[] = [
  { format: "pdf", label: "PDF", hint: ".pdf" },
  { format: "markdown", label: "Markdown", hint: ".md" },
  { format: "text", label: "Plain text", hint: ".txt" },
  { format: "html", label: "Web page", hint: ".html" },
  { format: "json", label: "JSON", hint: ".json" },
];

const FALLBACK_FILE_NAME = "note";
/** Gives the print dialog a moment to lay out the page before it opens. */
const PRINT_DELAY_MS = 250;
const PRINT_CLEANUP_DELAY_MS = 60_000;

/** Styles for the HTML export and the PDF print page. */
const DOCUMENT_STYLES = `
  body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif; color: #111; line-height: 1.6; max-width: 720px; margin: 40px auto; padding: 0 24px; }
  h1 { font-size: 28px; line-height: 1.2; margin: 0 0 4px; }
  .meta { color: #6b6b6b; font-size: 13px; margin: 0 0 28px; }
  h2 { font-size: 22px; margin: 28px 0 8px; } h3 { font-size: 18px; margin: 22px 0 6px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 14px; }
  th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  blockquote { border-left: 3px solid #0069a8; margin: 12px 0; padding-left: 14px; color: #555; }
  pre { background: #f5f5f5; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
  ul, ol { padding-left: 22px; } li { margin: 2px 0; }
  @page { margin: 18mm; } @media print { body { margin: 0 auto; } }
`;

function safeFileName(note: Note): string {
  return getNoteDisplayTitle(note.title).replace(/[^a-z0-9-_ ]/gi, "").trim() || FALLBACK_FILE_NAME;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function downloadFile(content: string, fileName: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Markdown → readable plain text: no #, ** or link syntax; lists and tasks stay legible. */
function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|\W)[*_](.+?)[*_](?=\W|$)/g, "$1$2")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^(\s*)[-*] \[ \]/gm, "$1[ ]")
    .replace(/^(\s*)[-*] \[x\]/gim, "$1[x]")
    .replace(/^(\s*)[-*] /gm, "$1• ")
    .replace(/^>\s?/gm, "")
    .replace(/`{1,3}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function loadConverter() {
  // The converter pulls in the BlockNote engine, so load it only on demand.
  return import("@/lib/editor/note-content-converter");
}

async function buildHtmlDocument(note: Note): Promise<string> {
  const { noteContentToHtml } = await loadConverter();
  const title = escapeHtml(getNoteDisplayTitle(note.title));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><style>${DOCUMENT_STYLES}</style></head>
<body><h1>${title}</h1><p class="meta">Updated ${formatFullDate(note.updatedAt)} · ${APP_NAME}</p>
${noteContentToHtml(note.content)}</body></html>`;
}

/** Opens the print dialog on a clean, print-friendly page. */
function printDocument(html: string): void {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const frameDocument = frame.contentDocument;
  if (!frameDocument || !frame.contentWindow) {
    frame.remove();
    throw new Error("Printing is not available");
  }
  frameDocument.open();
  frameDocument.write(html);
  frameDocument.close();
  window.setTimeout(() => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), PRINT_CLEANUP_DELAY_MS);
  }, PRINT_DELAY_MS);
}

export async function downloadNoteAsMarkdown(note: Note): Promise<void> {
  const { noteContentToMarkdown } = await loadConverter();
  const title = getNoteDisplayTitle(note.title);
  const body = noteContentToMarkdown(note.content).trim();
  const fileContent = body ? `# ${title}\n\n${body}\n` : `# ${title}\n`;
  downloadFile(fileContent, `${safeFileName(note)}.md`, "text/markdown");
}

/** Opens the browser's print dialog for one note. */
export async function printNote(note: Note): Promise<void> {
  printDocument(await buildHtmlDocument(note));
}

/** Downloads one note in the chosen format. */
export async function exportNote(note: Note, format: NoteExportFormat, categoryName?: string): Promise<void> {
  const fileName = safeFileName(note);

  switch (format) {
    case "markdown":
      return downloadNoteAsMarkdown(note);
    case "text": {
      const { noteContentToMarkdown } = await loadConverter();
      const body = markdownToPlainText(noteContentToMarkdown(note.content));
      const title = getNoteDisplayTitle(note.title);
      downloadFile(`${title}\n${"=".repeat(title.length)}\n\n${body}\n`, `${fileName}.txt`, "text/plain");
      return;
    }
    case "html":
      downloadFile(await buildHtmlDocument(note), `${fileName}.html`, "text/html");
      return;
    case "json": {
      const payload = {
        title: getNoteDisplayTitle(note.title),
        category: categoryName ?? null,
        favorited: note.favorited,
        pinned: note.pinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        content: note.content,
      };
      downloadFile(`${JSON.stringify(payload, null, 2)}\n`, `${fileName}.json`, "application/json");
      return;
    }
    case "pdf":
      return downloadNoteAsPdf(note, fileName);
  }
}
