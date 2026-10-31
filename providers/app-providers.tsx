"use client";

import { AiProvider } from "@/components/ai/ai-provider";
import { TemplateGalleryProvider } from "@/components/templates/template-gallery-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/hooks/use-app-state";
import { PreferencesProvider } from "@/hooks/use-preferences";
import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AppStateProvider>
        <PreferencesProvider>
          <TooltipProvider>
            <AiProvider>
              <TemplateGalleryProvider>{children}</TemplateGalleryProvider>
            </AiProvider>
          </TooltipProvider>
        </PreferencesProvider>
      </AppStateProvider>
    </QueryProvider>
  );
}
