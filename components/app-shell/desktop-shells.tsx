import { useState } from "react";
import { useDefaultLayout, usePanelRef, type PanelSize } from "react-resizable-panels";

import { SIDEBAR_RAIL_WIDTH, SidebarRail } from "@/components/app-shell/sidebar-rail";
import { ClassicListPane } from "@/components/classic/classic-list-pane";
import { ClassicSidebar } from "@/components/classic/classic-sidebar";
import { EditorPane } from "@/components/editor/editor-pane";
import { LibraryPane } from "@/components/library/library-pane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAppState } from "@/hooks/use-app-state";
import {
  CLASSIC_LIST_DEFAULT_SIZE,
  CLASSIC_LIST_MAX_SIZE,
  CLASSIC_LIST_MIN_SIZE,
  CLASSIC_SIDEBAR_DEFAULT_SIZE,
  CLASSIC_SIDEBAR_MAX_SIZE,
  CLASSIC_SIDEBAR_MIN_SIZE,
  LIBRARY_DEFAULT_SIZE,
  LIBRARY_MAX_SIZE,
  LIBRARY_MIN_SIZE,
} from "@/lib/constants";

/**
 * Side columns are resized by dragging their edge. Dragging the sidebar past
 * its minimum width shrinks it to an icon rail; Classic's note list closes
 * completely. Dragging back out opens them. Sizes (including closed ones) are
 * remembered.
 */
const LIST_COLLAPSED_SIZE = 0;
const RAIL_WIDTH_PX = parseInt(SIDEBAR_RAIL_WIDTH, 10);

/** Tracks whether the sidebar is down to its rail, and lets the rail open it again. */
function useSidebarRail() {
  const panelRef = usePanelRef();
  const [isRail, setRail] = useState(false);
  return {
    panelRef,
    isRail,
    // Called on mount too, so a sidebar remembered as collapsed starts as the rail.
    onResize: ({ inPixels }: PanelSize) => setRail(inPixels <= RAIL_WIDTH_PX + 1),
    expand: () => panelRef.current?.expand(),
  };
}

/** Classic: sidebar, note list and Page in three resizable columns. The sidebar shrinks to an icon rail. */
export function ClassicDesktopShell() {
  const { activeFolder } = useAppState();
  // The scratchpad is a single page, so it has no list column.
  const showList = activeFolder !== "scratchpad";
  const panelIds = showList ? ["classic-sidebar", "classic-list", "classic-page"] : ["classic-sidebar", "classic-page"];
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: "classic-layout", panelIds, storage: localStorage });
  const sidebar = useSidebarRail();

  return (
    <ResizablePanelGroup
      id="classic-layout"
      orientation="horizontal"
      className="h-dvh w-full"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <ResizablePanel
        id="classic-sidebar"
        defaultSize={CLASSIC_SIDEBAR_DEFAULT_SIZE}
        minSize={CLASSIC_SIDEBAR_MIN_SIZE}
        maxSize={CLASSIC_SIDEBAR_MAX_SIZE}
        collapsible
        collapsedSize={SIDEBAR_RAIL_WIDTH}
        panelRef={sidebar.panelRef}
        onResize={sidebar.onResize}
      >
        {sidebar.isRail ? <SidebarRail /> : <ClassicSidebar />}
      </ResizablePanel>
      <ResizableHandle />
      {showList && (
        <>
          <ResizablePanel
            id="classic-list"
            defaultSize={CLASSIC_LIST_DEFAULT_SIZE}
            minSize={CLASSIC_LIST_MIN_SIZE}
            maxSize={CLASSIC_LIST_MAX_SIZE}
            collapsible
            collapsedSize={LIST_COLLAPSED_SIZE}
          >
            <ClassicListPane />
          </ResizablePanel>
          <ResizableHandle />
        </>
      )}
      <ResizablePanel id="classic-page">
        <EditorPane />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

/** Library + Page: one column to find notes, one to write. The Library shrinks to an icon rail. */
export function LibraryDesktopShell() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "library-layout",
    panelIds: ["library", "page"],
    storage: localStorage,
  });
  const library = useSidebarRail();

  return (
    <ResizablePanelGroup
      id="library-layout"
      orientation="horizontal"
      className="h-dvh w-full"
      defaultLayout={defaultLayout}
      onLayoutChanged={onLayoutChanged}
    >
      <ResizablePanel
        id="library"
        defaultSize={LIBRARY_DEFAULT_SIZE}
        minSize={LIBRARY_MIN_SIZE}
        maxSize={LIBRARY_MAX_SIZE}
        collapsible
        collapsedSize={SIDEBAR_RAIL_WIDTH}
        panelRef={library.panelRef}
        onResize={library.onResize}
      >
        {library.isRail ? <SidebarRail onExpand={library.expand} /> : <LibraryPane />}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="page">
        <EditorPane />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
