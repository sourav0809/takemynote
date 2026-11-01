import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";
import { hasGoogleSignIn, hasImageUploads, isAccountsEnabled } from "@/lib/server/env";
import { SHARE_IMAGE } from "@/lib/seo";
import { AppProviders } from "@/providers/app-providers";
import { PageTransition } from "@/components/common/page-transition";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Your notes",
  description: "Write, organise and find your notes. Everything stays in this browser.",
  alternates: { canonical: "/notes" },
  // Shared links to the app get their own title (same preview image).
  openGraph: {
    type: "website",
    url: "/notes",
    siteName: APP_NAME,
    locale: "en_US",
    title: `Open ${APP_NAME}: your private notebook`,
    description: "Start writing in seconds. No sign-up, and your notes stay in your browser.",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Open ${APP_NAME}: your private notebook`,
    description: "Start writing in seconds. No sign-up, and your notes stay in your browser.",
  },
  // The app shell has no content of its own to rank; the landing page does.
  robots: { index: false, follow: true },
};

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppProviders accounts={{ enabled: isAccountsEnabled(), google: hasGoogleSignIn, imageUploads: hasImageUploads() }}>
      <PageTransition>
        <div className="flex h-dvh flex-col overflow-hidden">{children}</div>
      </PageTransition>
      <Toaster />
    </AppProviders>
  );
}
