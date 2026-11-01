import { PenSquare, Settings2, Sparkles } from "lucide-react";
import { useRef } from "react";

import { AI_ACTION_ICONS } from "@/components/editor/ai/ai-action-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppState } from "@/hooks/use-app-state";
import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { AI_ACTION_CONFIG, AI_ACTIONS, type AiAction } from "@/lib/ai/ai-actions";

interface AiMenuButtonProps {
  isBusy: boolean;
  onRun: (action: AiAction) => void;
  /** Opens the inline "Ask AI" panel at the cursor or selection. */
  onAskAi: () => void;
}

/** "✦ AI" in the toolbar: whole-note actions, Ask AI at the cursor, and AI settings. */
export function AiMenuButton({ isBusy, onRun, onAskAi }: AiMenuButtonProps) {
  const { openSettings } = useAppState();
  const { mod } = usePlatformModifierKeys();
  // The Ask AI panel takes focus; the menu must not hand it back to this button.
  const isOpeningPanelRef = useRef(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1.5 px-2.5 text-primary hover:bg-primary/10 hover:text-primary"
            aria-label="AI actions"
          />
        }
      >
        <Sparkles className={isBusy ? "animate-pulse" : undefined} />
        <span className="hidden sm:inline">AI</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64"
        finalFocus={() => {
          const shouldRestore = !isOpeningPanelRef.current;
          isOpeningPanelRef.current = false;
          return shouldRestore;
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              isOpeningPanelRef.current = true;
              onAskAi();
            }}
          >
            <PenSquare className="text-primary" />
            <span className="flex flex-col">
              <span>Ask AI to write…</span>
              <span className="text-xs font-normal text-muted-foreground">Or select text to edit it</span>
            </span>
            <DropdownMenuShortcut>{mod}J</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>This note</DropdownMenuLabel>
          {AI_ACTIONS.map((action) => {
            const Icon = AI_ACTION_ICONS[action];
            return (
              <DropdownMenuItem key={action} onClick={() => onRun(action)}>
                <Icon className="text-primary" />
                <span className="flex flex-col">
                  <span>{AI_ACTION_CONFIG[action].label}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {AI_ACTION_CONFIG[action].hint}
                  </span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openSettings("ai")}>
            <Settings2 />
            AI settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
