import { useEditorState } from "@blocknote/react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Fragment } from "react";

import { LinkPopoverButton } from "@/components/editor/link-popover-button";
import { ToolbarIconButton } from "@/components/editor/toolbar-icon-button";
import { Separator } from "@/components/ui/separator";
import {
  type BlockTypeTarget,
  isBlockTypeActive,
  toggleBlockType,
} from "@/lib/editor/block-type-actions";
import type { NoteBlockEditor } from "@/lib/editor/note-editor-schema";

type TextStyle = "bold" | "italic" | "underline" | "strike";

interface ToolbarAction {
  icon: LucideIcon;
  label: string;
}

const TEXT_STYLE_ACTIONS: (ToolbarAction & { style: TextStyle })[] = [
  { icon: Bold, label: "Bold", style: "bold" },
  { icon: Italic, label: "Italic", style: "italic" },
  { icon: Underline, label: "Underline", style: "underline" },
  { icon: Strikethrough, label: "Strikethrough", style: "strike" },
];

// Block-type buttons, grouped as separator-delimited sections of the toolbar.
const BLOCK_TYPE_GROUPS: (ToolbarAction & { target: BlockTypeTarget })[][] = [
  [
    { icon: Heading1, label: "Heading 1", target: { type: "heading", level: 1 } },
    { icon: Heading2, label: "Heading 2", target: { type: "heading", level: 2 } },
  ],
  [
    { icon: List, label: "Bullet list", target: { type: "bulletListItem" } },
    { icon: ListOrdered, label: "Numbered list", target: { type: "numberedListItem" } },
    { icon: ListChecks, label: "Task list", target: { type: "checkListItem" } },
  ],
  [
    { icon: Code, label: "Code block", target: { type: "codeBlock" } },
    { icon: Quote, label: "Quote", target: { type: "quote" } },
  ],
];

interface RichTextToolbarProps {
  editor: NoteBlockEditor;
  /** Pinned to the right end of the toolbar (the AI menu). */
  trailing?: React.ReactNode;
}

export function RichTextToolbar({ editor, trailing }: RichTextToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      styles: currentEditor.getActiveStyles(),
      activeBlockTypes: Object.fromEntries(
        BLOCK_TYPE_GROUPS.flat().map(({ label, target }) => [
          label,
          isBlockTypeActive(currentEditor, target),
        ])
      ),
      isLink: currentEditor.getSelectedLinkUrl() !== undefined,
    }),
  });

  const handleToggleStyle = (style: TextStyle) => {
    editor.focus();
    editor.toggleStyles({ [style]: true });
  };

  return (
    <div className="flex shrink-0 items-center gap-2 border-y border-border px-2 py-1.5 lg:px-4">
      <div className="no-scrollbar mx-auto flex min-w-0 items-center gap-0.5 overflow-x-auto">
        {TEXT_STYLE_ACTIONS.map(({ icon, label, style }) => (
          <ToolbarIconButton
            key={style}
            icon={icon}
            label={label}
            isActive={Boolean(state.styles[style])}
            onClick={() => handleToggleStyle(style)}
          />
        ))}

        {BLOCK_TYPE_GROUPS.map((group, groupIndex) => (
          <Fragment key={groupIndex}>
            <Separator orientation="vertical" className="mx-1 h-5 shrink-0" />
            {group.map(({ icon, label, target }) => (
              <ToolbarIconButton
                key={label}
                icon={icon}
                label={label}
                isActive={state.activeBlockTypes[label]}
                onClick={() => toggleBlockType(editor, target)}
              />
            ))}
          </Fragment>
        ))}
        <Separator orientation="vertical" className="mx-1 h-5 shrink-0" />
        <LinkPopoverButton editor={editor} isActive={state.isLink} />
      </div>
      {trailing}
    </div>
  );
}
