import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { useSidePanes } from "@/hooks/use-side-panes";
import { cn } from "@/lib/utils";

interface PaneToggleButtonProps {
  /** "hide" collapses a column; "show" expands it. */
  action: "hide" | "show";
  label: string;
  onClick: () => void;
  /** Shows the ⌘⌥\ hint: only for the button that toggles every column. */
  showShortcut?: boolean;
  className?: string;
}

/** The small panel icon used to collapse and reopen desktop side columns. */
export function PaneToggleButton({ action, label, onClick, showShortcut, className }: PaneToggleButtonProps) {
  const { mod, alt } = usePlatformModifierKeys();
  const Icon = action === "hide" ? PanelLeftClose : PanelLeftOpen;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
            onClick={onClick}
          />
        }
      >
        <Icon className="size-4.5" />
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {showShortcut && <span className="opacity-60">{`${mod} ${alt} \\`}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

/** At the start of the page: collapses the side columns for focused writing, or brings them back. */
export function SidePanesToggle({ className }: { className?: string }) {
  const { isAnyCollapsed, toggleAll } = useSidePanes();

  return (
    <PaneToggleButton
      action={isAnyCollapsed ? "show" : "hide"}
      label={isAnyCollapsed ? "Expand sidebars" : "Collapse sidebars"}
      onClick={toggleAll}
      showShortcut
      className={className}
    />
  );
}
