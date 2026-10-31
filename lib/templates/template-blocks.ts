import type { NoteContent } from "@/types/note";

/**
 * Markdown parsers turn list items with no text ("-", "1.", "- [ ]") into the
 * literal characters. Templates mark those items before parsing and the marker
 * is removed afterwards, leaving real empty list items ready to type into.
 */
const EMPTY_ITEM_MARKER = "TMN_EMPTY_ITEM";
const EMPTY_ITEM_LINE = /^(\s*)(- \[ \]|- \[x\]|[-*]|\d+\.|>)\s*$/;

function markEmptyItems(markdown: string): string {
  return markdown
    .split("\n")
    .map((line) => (EMPTY_ITEM_LINE.test(line) ? `${line.trimEnd()} ${EMPTY_ITEM_MARKER}` : line))
    .join("\n");
}

type InlineNode = { type: string; text?: string };
type BlockNode = { content?: unknown; children?: BlockNode[] };

function stripMarkers(blocks: BlockNode[]): void {
  for (const block of blocks) {
    if (Array.isArray(block.content)) {
      block.content = (block.content as InlineNode[])
        .map((node) =>
          node.type === "text" && node.text?.includes(EMPTY_ITEM_MARKER)
            ? { ...node, text: node.text.replace(EMPTY_ITEM_MARKER, "").trimEnd() }
            : node
        )
        .filter((node) => node.type !== "text" || node.text !== "");
    }
    if (block.children?.length) stripMarkers(block.children);
  }
}

/** Converts template Markdown to editor blocks with any Markdown → blocks parser. */
export function templateMarkdownToBlocks(
  markdown: string,
  parse: (markdown: string) => unknown[]
): NoteContent {
  const blocks = parse(markEmptyItems(markdown)) as BlockNode[];
  stripMarkers(blocks);
  return blocks as NoteContent;
}
