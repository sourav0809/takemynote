import type { jsPDF } from "jspdf";

import { APP_NAME } from "@/lib/constants";
import { formatFullDate, getNoteDisplayTitle } from "@/lib/note-utils";
import type { Note } from "@/types/note";

/** Layout in PDF points (A4: 595 × 842). */
const PAGE_MARGIN = 56;
const LINE_HEIGHT_RATIO = 1.45;
const LIST_INDENT = 18;
const NESTED_INDENT = 16;
const TEXT_COLOR: [number, number, number] = [20, 20, 20];
const MUTED_COLOR: [number, number, number] = [110, 110, 110];
const BRAND_COLOR: [number, number, number] = [0, 105, 168];
const RULE_COLOR: [number, number, number] = [220, 220, 220];
const CODE_BACKGROUND: [number, number, number] = [245, 245, 245];

const FONT_SIZE = { title: 22, meta: 9, h1: 18, h2: 15, h3: 13, body: 11, code: 9.5 } as const;

/** The built-in PDF fonts cover Latin-1; swap other symbols for readable stand-ins. */
const SYMBOL_FALLBACKS: Record<string, string> = {
  "→": "->", "←": "<-", "☆": "*", "★": "*", "✓": "v", "✔": "v", "☐": "[ ]", "☑": "[x]",
  "≈": "~", "≤": "<=", "≥": ">=",
};

function toPdfText(text: string): string {
  return text.replace(/[^\x00-\xFF–—‘’“”•…€]/gu, (char) => SYMBOL_FALLBACKS[char] ?? "");
}

type InlineNode = { type: string; text?: string; href?: string; content?: InlineNode[] };
type TableCellNode = { type: "tableCell"; content: InlineNode[] };
type TableContentNode = { type: "tableContent"; rows: { cells: (InlineNode[] | TableCellNode)[] }[] };
type BlockNode = {
  type: string;
  props?: Record<string, unknown>;
  content?: InlineNode[] | TableContentNode | string;
  children?: BlockNode[];
};

function inlineText(nodes: InlineNode[] | string | undefined): string {
  if (!nodes) return "";
  if (typeof nodes === "string") return nodes;
  return nodes
    .map((node) => {
      if (node.type === "link") {
        const label = inlineText(node.content);
        return node.href && node.href !== label ? `${label} (${node.href})` : label;
      }
      return node.text ?? "";
    })
    .join("");
}

/** Writes a note into a jsPDF document, flowing across pages. */
class PdfWriter {
  private y = PAGE_MARGIN;
  private readonly width: number;
  private readonly bottom: number;

  constructor(
    private readonly doc: jsPDF,
    private readonly autoTable: (doc: jsPDF, options: Record<string, unknown>) => void
  ) {
    this.width = doc.internal.pageSize.getWidth() - PAGE_MARGIN * 2;
    this.bottom = doc.internal.pageSize.getHeight() - PAGE_MARGIN;
  }

  private ensureSpace(height: number) {
    if (this.y + height <= this.bottom) return;
    this.doc.addPage();
    this.y = PAGE_MARGIN;
  }

  private lines(text: string, size: number, indent: number): string[] {
    this.doc.setFontSize(size);
    return this.doc.splitTextToSize(toPdfText(text) || " ", this.width - indent) as string[];
  }

  text(text: string, options: { size?: number; style?: string; indent?: number; color?: [number, number, number]; font?: string } = {}) {
    const { size = FONT_SIZE.body, style = "normal", indent = 0, color = TEXT_COLOR, font = "helvetica" } = options;
    this.doc.setFont(font, style);
    this.doc.setTextColor(...color);
    const lineHeight = size * LINE_HEIGHT_RATIO;
    for (const line of this.lines(text, size, indent)) {
      this.ensureSpace(lineHeight);
      this.doc.text(line, PAGE_MARGIN + indent, this.y + size);
      this.y += lineHeight;
    }
  }

  gap(points: number) {
    this.y += points;
  }

  header(note: Note) {
    this.text(getNoteDisplayTitle(note.title), { size: FONT_SIZE.title, style: "bold" });
    this.text(`Updated ${formatFullDate(note.updatedAt)} · ${APP_NAME}`, { size: FONT_SIZE.meta, color: MUTED_COLOR });
    this.gap(14);
  }

  /** A list marker (bullet, number or checkbox) followed by wrapped text. */
  private listItem(marker: "bullet" | "check" | string, text: string, depth: number, checked = false) {
    const indent = depth * NESTED_INDENT + LIST_INDENT;
    const markerX = PAGE_MARGIN + indent - 13;
    this.ensureSpace(FONT_SIZE.body * LINE_HEIGHT_RATIO);
    const top = this.y;
    this.doc.setTextColor(...TEXT_COLOR);
    if (marker === "check") {
      this.doc.setDrawColor(...MUTED_COLOR);
      this.doc.setLineWidth(0.8);
      this.doc.rect(markerX, top + 4, 8.5, 8.5);
      if (checked) {
        this.doc.setDrawColor(...BRAND_COLOR);
        this.doc.setLineWidth(1.3);
        this.doc.line(markerX + 1.8, top + 8.5, markerX + 3.8, top + 10.6);
        this.doc.line(markerX + 3.8, top + 10.6, markerX + 7.2, top + 5.6);
      }
    } else {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(FONT_SIZE.body);
      this.doc.text(marker === "bullet" ? "•" : marker, markerX, top + FONT_SIZE.body);
    }
    this.text(text, { indent, color: checked ? MUTED_COLOR : TEXT_COLOR });
  }

  private table(content: TableContentNode) {
    const rows = content.rows.map((row) =>
      row.cells.map((cell) => toPdfText(inlineText(Array.isArray(cell) ? cell : cell.content)))
    );
    if (rows.length === 0) return;
    const [head, ...body] = rows;
    this.ensureSpace(40);
    this.autoTable(this.doc, {
      startY: this.y,
      head: [head],
      body,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
      styles: { font: "helvetica", fontSize: 9.5, cellPadding: 5, textColor: TEXT_COLOR, lineColor: RULE_COLOR, lineWidth: 0.5 },
      headStyles: { fillColor: CODE_BACKGROUND, textColor: TEXT_COLOR, fontStyle: "bold" },
      theme: "grid",
    });
    const finalY = (this.doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY;
    this.y = (finalY ?? this.y) + 10;
  }

  blocks(blocks: BlockNode[], depth = 0) {
    let number = 0;
    for (const block of blocks) {
      number = block.type === "numberedListItem" ? number + 1 : 0;
      const text = typeof block.content === "object" && !Array.isArray(block.content) ? "" : inlineText(block.content);

      switch (block.type) {
        case "heading": {
          const level = Number(block.props?.level ?? 1);
          const size = level === 1 ? FONT_SIZE.h1 : level === 2 ? FONT_SIZE.h2 : FONT_SIZE.h3;
          this.gap(level === 1 ? 10 : 8);
          this.text(text, { size, style: "bold", indent: depth * NESTED_INDENT });
          this.gap(2);
          break;
        }
        case "bulletListItem":
        case "toggleListItem":
          this.listItem("bullet", text, depth);
          break;
        case "numberedListItem":
          this.listItem(`${number}.`, text, depth);
          break;
        case "checkListItem":
          this.listItem("check", text, depth, Boolean(block.props?.checked));
          break;
        case "quote": {
          const start = this.y;
          this.text(text, { style: "italic", indent: 14, color: MUTED_COLOR });
          this.doc.setDrawColor(...BRAND_COLOR);
          this.doc.setLineWidth(2);
          this.doc.line(PAGE_MARGIN + 3, start + 3, PAGE_MARGIN + 3, this.y - 2);
          this.gap(4);
          break;
        }
        case "codeBlock": {
          const codeLines = this.lines(text, FONT_SIZE.code, 20);
          const height = codeLines.length * FONT_SIZE.code * LINE_HEIGHT_RATIO + 16;
          this.ensureSpace(Math.min(height, this.bottom - PAGE_MARGIN));
          this.doc.setFillColor(...CODE_BACKGROUND);
          this.doc.roundedRect(PAGE_MARGIN, this.y, this.width, height, 4, 4, "F");
          this.gap(8);
          this.text(text, { font: "courier", size: FONT_SIZE.code, indent: 10 });
          this.gap(14);
          break;
        }
        case "table":
          if (block.content && typeof block.content === "object" && !Array.isArray(block.content)) {
            this.table(block.content as TableContentNode);
          }
          break;
        case "divider":
          this.gap(6);
          this.ensureSpace(10);
          this.doc.setDrawColor(...RULE_COLOR);
          this.doc.setLineWidth(0.8);
          this.doc.line(PAGE_MARGIN, this.y, PAGE_MARGIN + this.width, this.y);
          this.gap(10);
          break;
        case "image":
          this.text(`[Image${block.props?.url ? `: ${String(block.props.url)}` : ""}]`, { color: MUTED_COLOR });
          break;
        default:
          if (text.trim()) this.text(text, { indent: depth * NESTED_INDENT });
          else this.gap(FONT_SIZE.body * 0.8);
      }

      if (block.children?.length) this.blocks(block.children, depth + 1);
    }
  }
}

/** Builds a real, text-based PDF of the note and downloads it. */
export async function downloadNoteAsPdf(note: Note, fileName: string): Promise<void> {
  // Loaded on demand: the PDF library is only needed when someone downloads one.
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({ title: getNoteDisplayTitle(note.title), creator: APP_NAME });
  const writer = new PdfWriter(doc, autoTable as unknown as (doc: jsPDF, options: Record<string, unknown>) => void);
  writer.header(note);
  writer.blocks(note.content as unknown as BlockNode[]);
  doc.save(`${fileName}.pdf`);
}
