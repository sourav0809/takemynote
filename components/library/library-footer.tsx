import { Moon, Settings, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppState } from "@/hooks/use-app-state";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export function LibraryFooter() {
  const { setSettingsOpen } = useAppState();
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <div className="flex shrink-0 items-center justify-between border-t border-border px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <Button
        variant="ghost"
        className="h-10 gap-2 px-2.5 text-muted-foreground lg:h-9"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings />
        Settings
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-10 text-muted-foreground lg:size-9"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
}
