import { codeBlockOptions } from "@blocknote/code-block";
import { type BlockNoteEditor, BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";

// Default BlockNote blocks, with the code block configured for the languages
// bundled by `@blocknote/code-block` so syntax highlighting can resolve them.
export const noteEditorSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec(codeBlockOptions),
  },
});

export type NoteEditorSchema = typeof noteEditorSchema;

export type NoteBlockEditor = BlockNoteEditor<
  NoteEditorSchema["blockSchema"],
  NoteEditorSchema["inlineContentSchema"],
  NoteEditorSchema["styleSchema"]
>;
