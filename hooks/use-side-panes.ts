"use client";

import { useAppState } from "@/hooks/use-app-state";
import { usePreferences } from "@/hooks/use-preferences";

/**
 * Desktop side columns. The sidebar (Classic's folders, or the Library)
 * collapses to a slim icon rail; Classic's note list can be hidden on its own.
 */
export function useSidePanes() {
  const { layout, sidebarCollapsed, noteListCollapsed, setPreference, setPreferences } = usePreferences();
  const { activeFolder } = useAppState();
  // The scratchpad is a single page, so Classic shows no list for it.
  const hasNoteList = layout === "classic" && activeFolder !== "scratchpad";
  const isAnyCollapsed = sidebarCollapsed || (hasNoteList && noteListCollapsed);

  return {
    isSidebarExpanded: !sidebarCollapsed,
    isNoteListVisible: hasNoteList && !noteListCollapsed,
    isAnyCollapsed,
    setSidebarExpanded: (expanded: boolean) => setPreference("sidebarCollapsed", !expanded),
    setNoteListVisible: (visible: boolean) => setPreference("noteListCollapsed", !visible),
    /** Brings everything back if anything is collapsed; otherwise collapses all for focused writing. */
    toggleAll: () =>
      setPreferences({ sidebarCollapsed: !isAnyCollapsed, noteListCollapsed: !isAnyCollapsed }),
  };
}
