import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

const LINK_MARK = "link";

// Returns the full text of the link the (collapsed) cursor sits in, joining
// adjacent text nodes that share the same link even if styled differently.
function getLinkTextAtCursor(editor: NoteBlockEditor, href: string): string {
  return editor.transact((tr) => {
    const { $from } = tr.selection;
    const cursorOffset = $from.parentOffset;
    let runText = "";
    let runContainsCursor = false;
    let result = "";

    $from.parent.forEach((node, offset) => {
      if (result) return;
      const isSameLink = node.marks.some(
        (mark) => mark.type.name === LINK_MARK && mark.attrs.href === href
      );
      if (!isSameLink) {
        if (runContainsCursor) result = runText;
        runText = "";
        runContainsCursor = false;
        return;
      }
      runText += node.text ?? "";
      if (offset <= cursorOffset && cursorOffset <= offset + node.nodeSize) {
        runContainsCursor = true;
      }
    });

    return result || (runContainsCursor ? runText : "");
  });
}

/**
 * Applies `url` as a link to the current selection. An empty URL removes the
 * link; with a collapsed cursor outside a link, the URL itself is inserted.
 */
export function applyLink(editor: NoteBlockEditor, url: string): void {
  const trimmed = url.trim();
  const currentHref = editor.getSelectedLinkUrl();
  const hasSelection = editor.getSelectedText().length > 0;

  editor.focus();

  if (!trimmed) {
    if (currentHref !== undefined || hasSelection) editor.deleteLink();
    return;
  }
  if (hasSelection) {
    editor.createLink(trimmed);
    return;
  }
  if (currentHref !== undefined) {
    const linkText = getLinkTextAtCursor(editor, currentHref);
    if (linkText) editor.editLink(trimmed, linkText);
    return;
  }
  editor.createLink(trimmed, trimmed);
}
