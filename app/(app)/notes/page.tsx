"use client";

import { AppShell } from "@/components/app-shell/app-shell";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useGlobalShortcuts } from "@/hooks/use-global-shortcuts";

export default function NotesPage() {
  useGlobalShortcuts();

  return (
    <div className="h-dvh w-full overflow-hidden">
      <AppShell />
      <SettingsDialog />
      <OnboardingDialog />
    </div>
  );
}
