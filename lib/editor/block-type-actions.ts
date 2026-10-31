import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

type HeadingLevel = 1 | 2 | 3;

export type BlockTypeTarget =
  | { type: "heading"; level: HeadingLevel }
  | { type: "bulletListItem" | "numberedListItem" | "checkListItem" | "codeBlock" | "quote" };

type NoteBlock = NoteBlockEditor["document"][number];

const FALLBACK_BLOCK_TYPE = "paragraph";

function getSelectedBlocks(editor: NoteBlockEditor): NoteBlock[] {
  return editor.getSelection()?.blocks ?? [editor.getTextCursorPosition().block];
}

function matchesTarget(block: NoteBlock, target: BlockTypeTarget): boolean {
  if (block.type !== target.type) return false;
  if (target.type !== "heading") return true;
  return "level" in block.props && block.props.level === target.level;
}

export function isBlockTypeActive(editor: NoteBlockEditor, target: BlockTypeTarget): boolean {
  return getSelectedBlocks(editor).every((block) => matchesTarget(block, target));
}

/**
 * Converts every selected block to `target`, or back to a paragraph when they
 * all already are `target` — the same toggle behaviour as the old toolbar.
 */
export function toggleBlockType(editor: NoteBlockEditor, target: BlockTypeTarget): void {
  const blocks = getSelectedBlocks(editor);
  const isActive = blocks.every((block) => matchesTarget(block, target));

  editor.focus();
  editor.transact(() => {
    for (const block of blocks) {
      if (isActive) {
        editor.updateBlock(block, { type: FALLBACK_BLOCK_TYPE });
      } else if (target.type === "heading") {
        editor.updateBlock(block, { type: "heading", props: { level: target.level } });
      } else {
        editor.updateBlock(block, { type: target.type });
      }
    }
  });
}
