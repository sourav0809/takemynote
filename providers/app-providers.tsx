"use client";

import { AccountProvider, type AccountsConfig } from "@/components/account/account-provider";
import { AiProvider } from "@/components/ai/ai-provider";
import { TemplateGalleryProvider } from "@/components/templates/template-gallery-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider } from "@/hooks/use-app-state";
import { PreferencesProvider } from "@/hooks/use-preferences";
import { QueryProvider } from "@/providers/query-provider";

interface AppProvidersProps {
  /** What the server has configured for sign-in and sync. */
  accounts: AccountsConfig;
  children: React.ReactNode;
}

export function AppProviders({ accounts, children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AppStateProvider>
        <PreferencesProvider>
          <TooltipProvider>
            <AccountProvider config={accounts}>
              <AiProvider>
                <TemplateGalleryProvider>{children}</TemplateGalleryProvider>
              </AiProvider>
            </AccountProvider>
          </TooltipProvider>
        </PreferencesProvider>
      </AppStateProvider>
    </QueryProvider>
  );
}
