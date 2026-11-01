import { useDefaultLayout } from "react-resizable-panels";

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
 * Side columns close by dragging their edge past the minimum width, and open
 * again by dragging it back out. Sizes (including closed ones) are remembered.
 */
const COLLAPSED_SIZE = 0;

/** Classic: sidebar, note list and Page in three resizable columns. */
export function ClassicDesktopShell() {
  const { activeFolder } = useAppState();
  // The scratchpad is a single page, so it has no list column.
  const showList = activeFolder !== "scratchpad";
  const panelIds = showList ? ["classic-sidebar", "classic-list", "classic-page"] : ["classic-sidebar", "classic-page"];
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({ id: "classic-layout", panelIds, storage: localStorage });

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
        collapsedSize={COLLAPSED_SIZE}
      >
        <ClassicSidebar />
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
            collapsedSize={COLLAPSED_SIZE}
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

/** Library + Page: one column to find notes, one to write. */
export function LibraryDesktopShell() {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "library-layout",
    panelIds: ["library", "page"],
    storage: localStorage,
  });

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
        collapsedSize={COLLAPSED_SIZE}
      >
        <LibraryPane />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel id="page">
        <EditorPane />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
