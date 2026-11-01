import "server-only";

import { ServerBlockNoteEditor } from "@blocknote/server-util";
import { getDocument } from "@blocknote/server-util/dom";
import sanitizeHtml from "sanitize-html";

import type { NoteDoc } from "@/lib/server/documents";

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
    a: ["href", "title"],
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

/** One server-side DOM (jsdom) for all renders, created on first use. */
let serverDocument: Document | null = null;

/** A shared note's body as safe, read-only HTML. */
export async function renderNoteHtml(content: NoteDoc["content"]): Promise<string> {
  serverDocument ??= getDocument();
  const editor = ServerBlockNoteEditor.create(undefined, serverDocument);
  const html = await editor.blocksToHTMLLossy(content as Parameters<typeof editor.blocksToHTMLLossy>[0]);
  return sanitizeHtml(html, SANITIZE_OPTIONS);
}
