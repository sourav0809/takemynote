import type { AnyExtension } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Link } from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Typography } from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

import { SlashCommand } from "@/lib/slash-command-extension";

const lowlight = createLowlight(common);

export function createNoteEditorExtensions(placeholder: string): AnyExtension[] {
  return [
    StarterKit.configure({
      link: false,
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { class: "text-primary underline underline-offset-4" },
    }),
    TaskList.configure({ HTMLAttributes: { class: "not-prose" } }),
    TaskItem.configure({ nested: true }),
    Typography,
    Placeholder.configure({ placeholder }),
    SlashCommand,
  ];
}
