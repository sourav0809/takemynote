import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToolbarIconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant?: "default" | "destructive";
}

export function ToolbarIconButton({
  icon: Icon,
  label,
  onClick,
  isActive,
  disabled,
  variant = "default",
}: ToolbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              "text-muted-foreground",
              variant === "destructive" &&
                "hover:bg-destructive/10 hover:text-destructive",
              isActive && "bg-accent text-accent-foreground"
            )}
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
