import { Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAppState } from "@/hooks/use-app-state";

export function SidebarUserFooter() {
  const { setSettingsOpen } = useAppState();

  return (
    <>
      <Separator className="bg-sidebar-border" />
      <div className="flex items-center gap-2.5 px-3 py-3">
        <Avatar size="sm">
          <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
            You
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-foreground">
            Your notes
          </p>
          <p className="truncate text-xs text-sidebar-foreground/50">Free plan</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => setSettingsOpen(true)}
          aria-label="Settings"
        >
          <Settings />
        </Button>
      </div>
    </>
  );
}
