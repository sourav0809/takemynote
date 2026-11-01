import { Moon, Sun } from "lucide-react";

import { AccountMenu } from "@/components/account/account-menu";
import { Button } from "@/components/ui/button";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

/** Sidebar footer: the profile chip (Settings and account inside) and light/dark. */
export function LibraryFooter() {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <AccountMenu />
      <Button
        variant="ghost"
        size="icon"
        className="size-10 shrink-0 text-muted-foreground lg:size-9"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={toggleTheme}
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </div>
  );
}
