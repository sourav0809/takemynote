import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import { PageTransition } from "@/components/common/page-transition";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Your notes",
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppProviders>
      <PageTransition>
        <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
      </PageTransition>
      <Toaster />
    </AppProviders>
  );
}
