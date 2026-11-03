import "server-only";

import sanitizeHtml from "sanitize-html";

import type { NoteDoc } from "@/lib/server/documents";

/**
 * Turns a note's BlockNote JSON into read-only HTML for shared pages.
 *
 * This is a small renderer of its own rather than BlockNote's server editor:
 * that one needs a simulated browser (jsdom), which is heavy on serverless and
 * crashed the shared pages on Vercel. Every text is escaped here, and the
 * result still goes through an HTML allow-list as a second line of defence.
 */

/* ---------- Loose shapes of BlockNote's JSON (stored as-is, so never trusted) ---------- */

interface StyledText {
  type: "text";
  text: string;
  styles?: Record<string, unknown>;
}

interface LinkNode {
  type: "link";
  href: string;
  content: StyledText[];
}

type InlineNode = StyledText | LinkNode | { type: string };

interface TableCellNode {
  type: "tableCell";
  content?: InlineNode[];
  props?: { colspan?: number; rowspan?: number };
}

interface TableContent {
  type: "tableContent";
  headerRows?: number;
  rows?: { cells?: (TableCellNode | InlineNode[])[] }[];
}

interface Block {
  type: string;
  props?: Record<string, unknown>;
  content?: InlineNode[] | TableContent;
  children?: Block[];
}

/* ---------- Helpers ---------- */

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const str = (value: unknown): string => (typeof value === "string" ? value : "");

function renderText({ text, styles = {} }: StyledText): string {
  let html = escapeHtml(text).replace(/\n/g, "<br>");
  if (styles.code) html = `<code>${html}</code>`;
  if (styles.bold) html = `<strong>${html}</strong>`;
  if (styles.italic) html = `<em>${html}</em>`;
  if (styles.underline) html = `<u>${html}</u>`;
  if (styles.strike) html = `<s>${html}</s>`;
  return html;
}

function renderInline(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .map((node: InlineNode) => {
      if (!isObject(node)) return "";
      if (node.type === "text" && typeof (node as StyledText).text === "string") return renderText(node as StyledText);
      if (node.type === "link") {
        const link = node as LinkNode;
        return `<a href="${escapeHtml(str(link.href))}">${renderInline(link.content)}</a>`;
      }
      return "";
    })
    .join("");
}

/** Plain text of a code block (styles don't apply inside code). */
function plainText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content.map((node) => (isObject(node) && typeof node.text === "string" ? node.text : "")).join("");
}

function renderTable(content: unknown): string {
  if (!isObject(content) || !Array.isArray(content.rows)) return "";
  const table = content as unknown as TableContent;
  const headerRows = typeof table.headerRows === "number" ? table.headerRows : 0;
  const rows = (table.rows ?? []).map((row, rowIndex) => {
    const tag = rowIndex < headerRows ? "th" : "td";
    const cells = (row.cells ?? []).map((cell) => {
      const node: TableCellNode = Array.isArray(cell) ? { type: "tableCell", content: cell } : (cell as TableCellNode);
      const colspan = Number(node.props?.colspan) > 1 ? ` colspan="${Number(node.props?.colspan)}"` : "";
      const rowspan = Number(node.props?.rowspan) > 1 ? ` rowspan="${Number(node.props?.rowspan)}"` : "";
      return `<${tag}${colspan}${rowspan}>${renderInline(node.content)}</${tag}>`;
    });
    return `<tr>${cells.join("")}</tr>`;
  });
  return `<table><tbody>${rows.join("")}</tbody></table>`;
}

/** A file, video or audio block can't play on a static page: show it as a link. */
function renderFileLink(props: Record<string, unknown>, fallback: string): string {
  const url = str(props.url);
  if (!url) return "";
  const label = escapeHtml(str(props.caption) || str(props.name) || fallback);
  return `<p><a href="${escapeHtml(url)}">${label}</a></p>`;
}

/* ---------- Blocks ---------- */

const LIST_TAGS: Record<string, "ul" | "ol"> = { bulletListItem: "ul", numberedListItem: "ol", checkListItem: "ul" };

function renderListItem(block: Block): string {
  const text = renderInline(block.content);
  const checkbox =
    block.type === "checkListItem" ? `<input type="checkbox"${block.props?.checked ? " checked" : ""}> ` : "";
  return `<li>${checkbox}${text}${renderBlocks(block.children)}</li>`;
}

function renderBlock(block: Block): string {
  const props = isObject(block.props) ? block.props : {};
  const text = () => renderInline(block.content);
  const children = renderBlocks(block.children);

  switch (block.type) {
    case "heading": {
      const level = Math.min(Math.max(Number(props.level) || 1, 1), 6);
      const heading = `<h${level}>${text()}</h${level}>`;
      return props.isToggleable && children ? `<details><summary>${heading}</summary>${children}</details>` : heading + children;
    }
    case "toggleListItem":
      return `<details><summary>${text()}</summary>${children}</details>`;
    case "quote":
      return `<blockquote>${text()}</blockquote>${children}`;
    case "codeBlock": {
      const language = str(props.language).replace(/[^a-z0-9+#-]/gi, "");
      const attr = language ? ` class="language-${language}"` : "";
      return `<pre><code${attr}>${escapeHtml(plainText(block.content))}</code></pre>${children}`;
    }
    case "table":
      return renderTable(block.content) + children;
    case "image": {
      const url = str(props.url);
      // Only secure images load on the page (the allow-list drops anything else).
      if (!url.startsWith("https://")) return children;
      const caption = str(props.caption);
      const img = `<img src="${escapeHtml(url)}" alt="${escapeHtml(caption || str(props.name))}">`;
      return `<figure>${img}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>${children}`;
    }
    case "video":
      return renderFileLink(props, "Video") + children;
    case "audio":
      return renderFileLink(props, "Audio") + children;
    case "file":
      return renderFileLink(props, "File") + children;
    case "divider":
      return "<hr>";
    case "paragraph":
    default: {
      // Unknown blocks still show their text rather than vanishing.
      const inner = text();
      return (inner ? `<p>${inner}</p>` : "") + (children ? `<div>${children}</div>` : "");
    }
  }
}

/** Renders blocks, grouping neighbouring list items into one list. */
function renderBlocks(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  let html = "";
  let index = 0;
  while (index < blocks.length) {
    const block = blocks[index] as Block;
    if (!isObject(block)) {
      index++;
      continue;
    }
    const listTag = LIST_TAGS[block.type];
    if (!listTag) {
      html += renderBlock(block);
      index++;
      continue;
    }
    const start = block.type === "numberedListItem" && Number(block.props?.start) > 1 ? ` start="${Number(block.props?.start)}"` : "";
    let items = "";
    while (index < blocks.length && isObject(blocks[index]) && (blocks[index] as Block).type === block.type) {
      items += renderListItem(blocks[index] as Block);
      index++;
    }
    html += `<${listTag}${start}>${items}</${listTag}>`;
  }
  return html;
}

/* ---------- Sanitizing ---------- */

/**
 * Only plain document markup survives: no scripts, styles, event handlers or
 * `javascript:` links, whatever a note contains.
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h1", "h2", "h3", "h4", "h5", "h6", "strong", "b", "em", "i", "u", "s", "del", "code", "pre",
    "blockquote", "ul", "ol", "li", "a", "hr", "img", "table", "thead", "tbody", "tr", "th", "td", "input", "label",
    "figure", "figcaption", "span", "div", "details", "summary",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "width"],
    input: ["type", "checked", "disabled"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    ol: ["start"],
    code: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  transformTags: {
    // Links leave the page safely; checkboxes are read-only.
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
    input: sanitizeHtml.simpleTransform("input", { disabled: "" }),
  },
  exclusiveFilter: (frame) => frame.tag === "input" && frame.attribs.type !== "checkbox",
};

/** A shared note's body as safe, read-only HTML. */
export function renderNoteHtml(content: NoteDoc["content"]): string {
  return sanitizeHtml(renderBlocks(content), SANITIZE_OPTIONS);
}
