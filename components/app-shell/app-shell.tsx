import { ClassicDesktopShell, LibraryDesktopShell } from "@/components/app-shell/desktop-shells";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePreferences } from "@/hooks/use-preferences";
import { DESKTOP_MEDIA_QUERY } from "@/lib/constants";

/** Picks the layout the user chose in Settings (Classic by default) for this screen size. */
export function AppShell() {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const { layout } = usePreferences();

  // Unknown until hydration: render nothing rather than the wrong layout, so
  // only one editor instance ever mounts.
  if (isDesktop === null) {
    return <div className="h-dvh bg-background" aria-busy="true" />;
  }

  if (!isDesktop) return <MobileShell layout={layout} />;
  return layout === "library" ? <LibraryDesktopShell /> : <ClassicDesktopShell />;
}
