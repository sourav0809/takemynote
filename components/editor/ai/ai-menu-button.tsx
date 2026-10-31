import { Sparkles } from "lucide-react";

import { AI_ACTION_ICONS } from "@/components/editor/ai/ai-action-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AI_ACTION_CONFIG, AI_ACTIONS, type AiAction } from "@/lib/ai/ai-actions";

interface AiMenuButtonProps {
  isBusy: boolean;
  onRun: (action: AiAction) => void;
}

/** "✦ AI" in the toolbar: runs one of the AI actions on the open note. */
export function AiMenuButton({ isBusy, onRun }: AiMenuButtonProps) {
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
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Ask AI about this note</DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
