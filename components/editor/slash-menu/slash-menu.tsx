import type { SuggestionMenuProps } from "@blocknote/react";
import { useEffect, useRef } from "react";

import { AI_GROUP, type SlashMenuItem } from "@/components/editor/slash-menu/slash-menu-items";
import { cn } from "@/lib/utils";

/** "⌘-Alt-1" → ["⌘", "⌥", "1"], drawn as small key caps. */
function toKeyCaps(badge: string): string[] {
  return badge
    .split("-")
    .filter(Boolean)
    .map((key) => (key === "Alt" ? "⌥" : key === "Shift" ? "⇧" : key.toUpperCase()));
}

/** The "/" command menu: grouped blocks with icons, shortcuts and an AI group. */
export function SlashMenu({ items, selectedIndex, onItemClick }: SuggestionMenuProps<SlashMenuItem>) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Insert block"
      className="no-scrollbar max-h-[min(380px,60vh)] w-[min(300px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
    >
      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matching blocks</p>
      ) : (
        items.map((item, index) => {
          const Icon = item.lucideIcon;
          const isSelected = index === selectedIndex;
          const startsGroup = index === 0 || items[index - 1].group !== item.group;
          return (
            <div key={`${item.group}-${item.title}`}>
              {startsGroup && (
                <p
                  className={cn(
                    "px-2.5 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase",
                    index > 0 && "mt-1 border-t border-border pt-3"
                  )}
                >
                  {item.group}
                </p>
              )}
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors",
                  isSelected ? "bg-accent" : "hover:bg-accent/60"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg border",
                    item.group === AI_GROUP
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : isSelected
                        ? "border-border bg-background text-foreground"
                        : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{item.title}</span>
                  {item.subtext && (
                    <span className="block truncate text-xs text-muted-foreground">{item.subtext}</span>
                  )}
                </span>
                {item.badge && (
                  <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
                    {toKeyCaps(item.badge).map((key) => (
                      <kbd
                        key={key}
                        className="min-w-5 rounded-md border border-border bg-muted/60 px-1 text-center font-mono text-[10px] leading-5 text-muted-foreground"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                )}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
