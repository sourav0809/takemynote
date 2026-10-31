import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Your notes",
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppProviders>
      <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
      <Toaster />
    </AppProviders>
  );
}
