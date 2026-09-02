import type { Editor, Range } from "@tiptap/core";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import type { SlashCommandItem } from "@/lib/slash-command-items";
import { cn } from "@/lib/utils";

export interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  editor: Editor;
  range: Range;
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  function SlashCommandList({ items, command }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-64 rounded-2xl border border-border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
          No results
        </div>
      );
    }

    return (
      <div className="flex w-64 flex-col gap-0.5 rounded-2xl border border-border bg-popover p-1.5 shadow-lg">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            data-selected={index === selectedIndex}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
              <item.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {item.title}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {item.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  }
);
