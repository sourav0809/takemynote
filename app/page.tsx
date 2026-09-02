"use client";

import { AppShell } from "@/components/app-shell/app-shell";
import { SettingsDialog } from "@/components/settings/settings-dialog";

export default function Home() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <AppShell />
      <SettingsDialog />
    </div>
  );
}
