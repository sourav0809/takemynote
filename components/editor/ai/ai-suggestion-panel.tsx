import { RotateCcw, Sparkles, X } from "lucide-react";

import { AI_ACTION_ICONS } from "@/components/editor/ai/ai-action-icons";
import { Button } from "@/components/ui/button";
import type { AiAssistState } from "@/hooks/use-ai-assist";
import { AI_ACTION_CONFIG, AI_ACTIONS, type AiAction } from "@/lib/ai/ai-actions";

interface AiSuggestionPanelProps {
  state: AiAssistState;
  onApply: () => void;
  onRun: (action: AiAction) => void;
  onDismiss: () => void;
}

/** Turns Markdown list markers into readable glyphs for the preview only. */
function toPreviewText(markdown: string): string {
  return markdown
    .replace(/^(\s*)- \[ \] /gm, "$1☐ ")
    .replace(/^(\s*)- \[x\] /gim, "$1☑ ")
    .replace(/^(\s*)[-*] /gm, "$1• ")
    .replace(/\*\*(.+?)\*\*/g, "$1");
}

/** The card that shows an AI suggestion and lets the user apply, retry or dismiss it. */
export function AiSuggestionPanel({ state, onApply, onRun, onDismiss }: AiSuggestionPanelProps) {
  if (!state.action) return null;
  const config = AI_ACTION_CONFIG[state.action];

  return (
    <section
      aria-label="AI suggestion"
      aria-live="polite"
      className="absolute inset-x-3 bottom-3 z-20 flex max-h-[60%] flex-col rounded-2xl border border-primary/20 bg-popover p-4 text-popover-foreground shadow-xl duration-200 animate-in fade-in-0 slide-in-from-bottom-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[400px]"
    >
      <header className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
        </span>
        <p className="flex-1 text-sm font-semibold">{config.label}</p>
        <Button variant="ghost" size="icon-sm" aria-label="Close" onClick={onDismiss}>
          <X />
        </Button>
      </header>

      <div className="mt-3 min-h-0 overflow-y-auto">
        {state.status === "loading" && (
          <div className="flex flex-col gap-2 py-1" aria-label="Writing…">
            <span className="h-3 w-11/12 animate-pulse rounded-full bg-muted" />
            <span className="h-3 w-9/12 animate-pulse rounded-full bg-muted" />
            <span className="h-3 w-10/12 animate-pulse rounded-full bg-muted" />
          </div>
        )}
        {state.status === "error" && <p className="text-sm text-destructive">{state.error}</p>}
        {state.status === "done" && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{toPreviewText(state.text)}</p>
        )}
      </div>

      {state.status !== "loading" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {state.status === "done" && (
            <Button size="sm" onClick={onApply}>
              {config.applyLabel}
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onRun(state.action!)}>
            <RotateCcw />
            Try again
          </Button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
        {AI_ACTIONS.filter((action) => action !== state.action).map((action) => {
          const Icon = AI_ACTION_ICONS[action];
          return (
            <Button
              key={action}
              variant="ghost"
              size="xs"
              className="gap-1 text-muted-foreground"
              disabled={state.status === "loading"}
              onClick={() => onRun(action)}
            >
              <Icon className="text-primary" />
              {AI_ACTION_CONFIG[action].label}
            </Button>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Sends this note to OpenAI to write the suggestion.
      </p>
    </section>
  );
}
