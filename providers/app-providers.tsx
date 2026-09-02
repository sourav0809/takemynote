"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/hooks/use-app-state";
import { PreferencesProvider } from "@/hooks/use-preferences";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <AppStateProvider>
          <PreferencesProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </PreferencesProvider>
        </AppStateProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
