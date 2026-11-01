"use client";

import { autoUpdate, flip, offset, shift, size, useFloating } from "@floating-ui/react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronRight,
  KeyRound,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
} from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { useAi } from "@/components/ai/ai-provider";
import { AiMarkdownPreview } from "@/components/editor/ai/ai-markdown-preview";
import {
  SELECTION_ACTIONS,
  SELECTION_SUBMENUS,
  WRITE_ACTIONS,
  type InlineAiAction,
  type InlineAiSubmenu,
} from "@/components/editor/ai/inline-ai-actions";
import { Button } from "@/components/ui/button";
import { useAiSettings } from "@/hooks/use-ai-settings";
import type { InlineAi } from "@/hooks/use-inline-ai";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { getModelOption } from "@/lib/ai/providers";
import { cn } from "@/lib/utils";

const DESKTOP_MEDIA_QUERY = "(min-width: 640px)";
const PANEL_MAX_WIDTH_PX = 600;
const PANEL_MIN_WIDTH_PX = 320;
const VIEWPORT_PADDING_PX = 12;

interface PanelItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  hasSubmenu?: boolean;
  isPrimary?: boolean;
}

type MenuId = "main" | InlineAiSubmenu["id"];

interface InlineAiPanelProps {
  ai: InlineAi;
}

/** The "Ask AI" panel for a selection or the cursor. Renders nothing while closed. */
export function InlineAiPanel({ ai }: InlineAiPanelProps) {
  if (!ai.isOpen) return null;
  return <InlineAiPanelContent ai={ai} />;
}

function InlineAiPanelContent({ ai }: InlineAiPanelProps) {
  const { openAiSetup } = useAi();
  const { provider, model } = useAiSettings();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY) ?? true;
  const { mod } = usePlatformModifierKeys();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [instruction, setInstruction] = useState("");
  const [menu, setMenu] = useState<MenuId>("main");
  const [activeIndex, setActiveIndex] = useState(0);
  const [taskLabel, setTaskLabel] = useState("");

  const { state, mode } = ai;
  const isStreaming = state.status === "streaming";
  const hasResult = state.status === "done";

  const {
    refs: { setFloating, setPositionReference },
    floatingStyles,
    elements,
  } = useFloating({
    open: true,
    placement: "bottom-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: VIEWPORT_PADDING_PX }),
      shift({ padding: VIEWPORT_PADDING_PX }),
      size({
        padding: VIEWPORT_PADDING_PX,
        apply({ availableHeight, rects, elements: { floating } }) {
          const width = Math.max(PANEL_MIN_WIDTH_PX, Math.min(rects.reference.width, PANEL_MAX_WIDTH_PX));
          floating.style.width = `${width}px`;
          floating.style.maxHeight = `${Math.max(220, availableHeight)}px`;
        },
      }),
    ],
  });

  const { getAnchorRect, getEditorElement } = ai;
  useLayoutEffect(() => {
    setPositionReference({ getBoundingClientRect: getAnchorRect, contextElement: getEditorElement() });
  }, [setPositionReference, getAnchorRect, getEditorElement]);

  // A click elsewhere closes the panel, unless there's a result to keep.
  const { close } = ai;
  useEffect(() => {
    if (isStreaming || hasResult) return;
    const handlePointerDown = (event: PointerEvent) => {
      const panel = elements.floating;
      const target = event.target as Element | null;
      // Dialogs and menus opened from the panel live in portals.
      if (panel?.contains(target) || target?.closest("[role=dialog], [data-slot=select-content]")) return;
      close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [elements.floating, isStreaming, hasResult, close]);

  const runAction = (label: string, text: string) => {
    setTaskLabel(label);
    setInstruction("");
    setMenu("main");
    setActiveIndex(0);
    ai.run(text);
  };

  const toItem = (action: InlineAiAction): PanelItem => ({
    key: action.id,
    label: action.label,
    icon: action.icon,
    onSelect: () => runAction(action.label, action.instruction),
  });

  const openMenu = (next: MenuId) => {
    setMenu(next);
    setActiveIndex(0);
  };

  const items: PanelItem[] = (() => {
    if (isStreaming) return [];
    if (hasResult) {
      return [
        {
          key: "accept",
          label: mode === "selection" ? "Replace selection" : "Insert",
          icon: Check,
          onSelect: ai.accept,
          isPrimary: true,
        },
        ...(mode === "selection"
          ? [{ key: "below", label: "Insert below", icon: ArrowDownToLine, onSelect: ai.insertBelow }]
          : []),
        { key: "retry", label: "Try again", icon: RotateCcw, onSelect: ai.retry },
        { key: "discard", label: "Discard", icon: Trash2, onSelect: ai.close },
      ];
    }
    if (state.status === "error") {
      return [
        ...(state.error?.needsSetup
          ? [{ key: "setup", label: "Set up AI key", icon: KeyRound, onSelect: openAiSetup, isPrimary: true }]
          : []),
        { key: "retry", label: "Try again", icon: RotateCcw, onSelect: ai.retry },
        { key: "discard", label: "Discard", icon: Trash2, onSelect: ai.close },
      ];
    }
    if (mode === "write") return WRITE_ACTIONS.map(toItem);
    if (menu !== "main") {
      const submenu = SELECTION_SUBMENUS.find((entry) => entry.id === menu)!;
      return [
        { key: "back", label: "Back", icon: ArrowLeft, onSelect: () => openMenu("main") },
        ...submenu.actions.map((action) => ({
          ...toItem(action),
          onSelect: () => runAction(`${submenu.label}: ${action.label}`, action.instruction),
        })),
      ];
    }
    return [
      ...SELECTION_ACTIONS.map(toItem),
      ...SELECTION_SUBMENUS.map((submenu) => ({
        key: submenu.id,
        label: submenu.label,
        icon: submenu.icon,
        hasSubmenu: true,
        onSelect: () => openMenu(submenu.id),
      })),
    ];
  })();

  const safeActiveIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));

  const submitInstruction = () => {
    const text = instruction.trim();
    if (!text || isStreaming) return;
    runAction(text, text);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (menu !== "main") openMenu("main");
      else if (isStreaming) ai.stop();
      else ai.close();
      return;
    }
    if (event.target !== inputRef.current) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (items.length === 0) return;
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((safeActiveIndex + step + items.length) % items.length);
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if ((event.metaKey || event.ctrlKey) && hasResult) ai.accept();
      else if (instruction.trim()) submitInstruction();
      else items[safeActiveIndex]?.onSelect();
    }
  };

  const modelLabel = getModelOption(provider, model)?.label ?? model;
  const placeholder = hasResult
    ? "Tell AI what to change…"
    : mode === "selection"
      ? isDesktop
        ? "Ask AI to edit… e.g. add a few bullets and fix grammar"
        : "Ask AI to edit…"
      : isDesktop
        ? "Ask AI to write… e.g. a short intro for this note"
        : "Ask AI to write…";

  return (
    <div
      ref={setFloating}
      role="dialog"
      aria-label="Ask AI"
      onKeyDown={handleKeyDown}
      style={isDesktop ? floatingStyles : undefined}
      className={cn(
        "z-40 flex flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/5 duration-150 animate-in fade-in-0 dark:ring-foreground/10",
        isDesktop
          ? "slide-in-from-top-1"
          : // The size middleware still writes an inline width and max height; a sheet ignores both.
            "fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] max-h-[75dvh]! w-auto! slide-in-from-bottom-4"
      )}
    >
      {(state.text || isStreaming) && (
        <div className="min-h-0 shrink overflow-y-auto border-b border-border px-4 py-3" aria-live="polite">
          {taskLabel && (
            <p className="mb-2 truncate text-xs font-medium text-muted-foreground">{taskLabel}</p>
          )}
          {state.text ? (
            <AiMarkdownPreview markdown={state.text} isStreaming={isStreaming} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Writing…
            </p>
          )}
        </div>
      )}

      {state.status === "error" && state.error && (
        <p role="alert" className="border-b border-border px-4 py-3 text-sm text-destructive">
          {state.error.message}
        </p>
      )}

      <div className="flex shrink-0 items-center gap-2 px-3 py-2">
        <Sparkles className="size-4 shrink-0 text-primary" />
        <input
          ref={inputRef}
          autoFocus
          value={instruction}
          readOnly={isStreaming}
          onChange={(event) => setInstruction(event.target.value)}
          placeholder={isStreaming ? "Writing…" : placeholder}
          aria-label="Instruction for AI"
          aria-controls={listId}
          aria-activedescendant={items.length > 0 ? `${listId}-${safeActiveIndex}` : undefined}
          className="h-9 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        {isStreaming ? (
          <Button variant="secondary" size="icon-sm" aria-label="Stop" onClick={ai.stop}>
            <Square className="size-3 fill-current" />
          </Button>
        ) : (
          <Button size="icon-sm" aria-label="Send" disabled={!instruction.trim()} onClick={submitInstruction}>
            <ArrowUp />
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <ul id={listId} role="listbox" aria-label="AI actions" className="min-h-0 shrink-0 overflow-y-auto border-t border-border p-1.5 sm:max-h-72">
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === safeActiveIndex;
            return (
              <li
                key={item.key}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isActive}
                onPointerMove={() => setActiveIndex(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={item.onSelect}
                className={cn(
                  "flex h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-sm select-none",
                  isActive && "bg-muted"
                )}
              >
                <Icon className={cn("size-4 shrink-0", item.isPrimary ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("flex-1 truncate", item.isPrimary && "font-medium")}>{item.label}</span>
                {item.hasSubmenu && <ChevronRight className="size-4 shrink-0 text-muted-foreground" />}
                {item.isPrimary && hasResult && isDesktop && (
                  <kbd className="font-sans text-[11px] text-muted-foreground">{mod} ↵</kbd>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-muted/40 px-4 py-1.5 text-[11px] text-muted-foreground">
        <span className="truncate">{modelLabel}</span>
        <span className="hidden sm:inline">Esc to close</span>
      </div>
    </div>
  );
}
