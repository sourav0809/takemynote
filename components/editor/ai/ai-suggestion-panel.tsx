import { KeyRound, RotateCcw, Sparkles, Square, X } from "lucide-react";

import { useAi } from "@/components/ai/ai-provider";
import { AI_ACTION_ICONS } from "@/components/editor/ai/ai-action-icons";
import { AiMarkdownPreview } from "@/components/editor/ai/ai-markdown-preview";
import { Button } from "@/components/ui/button";
import { useAiSettings } from "@/hooks/use-ai-settings";
import type { AiStreamState } from "@/hooks/use-ai-stream";
import { AI_ACTION_CONFIG, AI_ACTIONS, type AiAction } from "@/lib/ai/ai-actions";
import { AI_PROVIDERS } from "@/lib/ai/providers";

interface AiSuggestionPanelProps {
  action: AiAction | null;
  state: AiStreamState;
  onApply: () => void;
  onRun: (action: AiAction) => void;
  onStop: () => void;
  onDismiss: () => void;
}

/** The card that streams a whole-note AI suggestion and lets the user apply, retry or dismiss it. */
export function AiSuggestionPanel({ action, state, onApply, onRun, onStop, onDismiss }: AiSuggestionPanelProps) {
  const { openAiSetup } = useAi();
  const { provider } = useAiSettings();
  if (!action) return null;

  const config = AI_ACTION_CONFIG[action];
  const isStreaming = state.status === "streaming";

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
        {isStreaming && !state.text && (
          <div className="flex flex-col gap-2 py-1" aria-label="Writing…">
            <span className="h-3 w-11/12 animate-pulse rounded-full bg-muted" />
            <span className="h-3 w-9/12 animate-pulse rounded-full bg-muted" />
            <span className="h-3 w-10/12 animate-pulse rounded-full bg-muted" />
          </div>
        )}
        {state.status === "error" && state.error && (
          <p className="text-sm text-destructive">{state.error.message}</p>
        )}
        {state.text && <AiMarkdownPreview markdown={state.text} isStreaming={isStreaming} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isStreaming && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onStop}>
            <Square className="size-3 fill-current" />
            Stop
          </Button>
        )}
        {state.status === "done" && (
          <Button size="sm" onClick={onApply}>
            {config.applyLabel}
          </Button>
        )}
        {state.status === "error" && state.error?.needsSetup && (
          <Button size="sm" className="gap-1.5" onClick={openAiSetup}>
            <KeyRound />
            Set up AI key
          </Button>
        )}
        {!isStreaming && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onRun(action)}>
            <RotateCcw />
            Try again
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
        {AI_ACTIONS.filter((other) => other !== action).map((other) => {
          const Icon = AI_ACTION_ICONS[other];
          return (
            <Button
              key={other}
              variant="ghost"
              size="xs"
              className="gap-1 text-muted-foreground"
              disabled={isStreaming}
              onClick={() => onRun(other)}
            >
              <Icon className="text-primary" />
              {AI_ACTION_CONFIG[other].label}
            </Button>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Sends this note to {AI_PROVIDERS[provider].name} with your key.
      </p>
    </section>
  );
}
