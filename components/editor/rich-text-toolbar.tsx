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
  Sparkles,
  Strikethrough,
  Underline,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Fragment } from "react";

import { LinkPopoverButton } from "@/components/editor/link-popover-button";
import { ToolbarIconButton } from "@/components/editor/toolbar-icon-button";
import { Button } from "@/components/ui/button";
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
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
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
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-1.5 sm:px-6">
      <div className="flex items-center gap-0.5 overflow-x-auto">
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
            <Separator orientation="vertical" className="mx-1 h-5" />
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
        <LinkPopoverButton editor={editor} isActive={state.isLink} />
      </div>

      <Button size="sm" className="shrink-0 gap-1.5">
        <Sparkles />
        AI Assist
      </Button>
    </div>
  );
}
