import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Italic, Strikethrough, Underline } from "lucide-react";

import { LinkPopoverButton } from "@/components/editor/link-popover-button";
import { ToolbarIconButton } from "@/components/editor/toolbar-icon-button";

interface SelectionBubbleMenuProps {
  editor: Editor;
}

export function SelectionBubbleMenu({ editor }: SelectionBubbleMenuProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isBold: currentEditor.isActive("bold"),
      isItalic: currentEditor.isActive("italic"),
      isUnderline: currentEditor.isActive("underline"),
      isStrike: currentEditor.isActive("strike"),
      isCode: currentEditor.isActive("code"),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      className="flex items-center gap-0.5 rounded-2xl border border-border bg-popover p-1 shadow-lg"
    >
      <ToolbarIconButton
        icon={Bold}
        label="Bold"
        isActive={state.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarIconButton
        icon={Italic}
        label="Italic"
        isActive={state.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarIconButton
        icon={Underline}
        label="Underline"
        isActive={state.isUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarIconButton
        icon={Strikethrough}
        label="Strikethrough"
        isActive={state.isStrike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <ToolbarIconButton
        icon={Code}
        label="Inline code"
        isActive={state.isCode}
        onClick={() => editor.chain().focus().toggleCode().run()}
      />
      <LinkPopoverButton editor={editor} />
    </BubbleMenu>
  );
}
