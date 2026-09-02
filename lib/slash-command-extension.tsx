import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";

import type { SlashCommandListRef } from "@/components/editor/slash-command-list";
import { SlashCommandList } from "@/components/editor/slash-command-list";
import { updateFloatingPosition } from "@/lib/floating-position";
import { filterSlashCommandItems, type SlashCommandItem } from "@/lib/slash-command-items";

const suggestionOptions: Omit<SuggestionOptions<SlashCommandItem>, "editor"> = {
  char: "/",
  startOfLine: false,
  items: ({ query }) => filterSlashCommandItems(query),
  command: ({ editor, range, props }) => {
    props.command({ editor, range });
  },
  render: () => {
    let component: ReactRenderer<SlashCommandListRef> | undefined;

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandList, {
          props: { ...props, command: (item: SlashCommandItem) => item.command(props) },
          editor: props.editor,
        });

        if (!props.clientRect) return;

        component.element.style.position = "absolute";
        component.element.style.zIndex = "50";
        document.body.appendChild(component.element);
        updateFloatingPosition({
          editor: props.editor,
          element: component.element,
          clientRect: props.clientRect,
        });
      },
      onUpdate: (props) => {
        component?.updateProps({
          ...props,
          command: (item: SlashCommandItem) => item.command(props),
        });

        if (!props.clientRect) return;
        if (!component) return;
        updateFloatingPosition({
          editor: props.editor,
          element: component.element,
          clientRect: props.clientRect,
        });
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          component?.destroy();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },
      onExit: () => {
        component?.element.remove();
        component?.destroy();
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return { suggestion: suggestionOptions };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
