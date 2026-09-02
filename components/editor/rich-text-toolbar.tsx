import type { Editor } from "@tiptap/react";
import { useEditorState } from "@tiptap/react";
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

import { LinkPopoverButton } from "@/components/editor/link-popover-button";
import { ToolbarIconButton } from "@/components/editor/toolbar-icon-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RichTextToolbarProps {
  editor: Editor;
}

export function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isBold: currentEditor.isActive("bold"),
      isItalic: currentEditor.isActive("italic"),
      isUnderline: currentEditor.isActive("underline"),
      isStrike: currentEditor.isActive("strike"),
      isHeading1: currentEditor.isActive("heading", { level: 1 }),
      isHeading2: currentEditor.isActive("heading", { level: 2 }),
      isBulletList: currentEditor.isActive("bulletList"),
      isOrderedList: currentEditor.isActive("orderedList"),
      isTaskList: currentEditor.isActive("taskList"),
      isCodeBlock: currentEditor.isActive("codeBlock"),
      isBlockquote: currentEditor.isActive("blockquote"),
    }),
  });

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-1.5 sm:px-6">
      <div className="flex items-center gap-0.5 overflow-x-auto">
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

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarIconButton
          icon={Heading1}
          label="Heading 1"
          isActive={state.isHeading1}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarIconButton
          icon={Heading2}
          label="Heading 2"
          isActive={state.isHeading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarIconButton
          icon={List}
          label="Bullet list"
          isActive={state.isBulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarIconButton
          icon={ListOrdered}
          label="Numbered list"
          isActive={state.isOrderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarIconButton
          icon={ListChecks}
          label="Task list"
          isActive={state.isTaskList}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarIconButton
          icon={Code}
          label="Code block"
          isActive={state.isCodeBlock}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarIconButton
          icon={Quote}
          label="Quote"
          isActive={state.isBlockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <LinkPopoverButton editor={editor} />
      </div>

      <Button size="sm" className="shrink-0 gap-1.5">
        <Sparkles />
        AI Assist
      </Button>
    </div>
  );
}
