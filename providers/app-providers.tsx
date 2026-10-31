"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/hooks/use-app-state";
import { PreferencesProvider } from "@/hooks/use-preferences";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppStateProvider>
        <PreferencesProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </PreferencesProvider>
      </AppStateProvider>
    </QueryProvider>
  );
}
