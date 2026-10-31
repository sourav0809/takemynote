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

/** Classic: sidebar, note list and Page in three resizable columns. */
export function ClassicDesktopShell() {
  const { activeFolder } = useAppState();
  // The scratchpad is a single page, so it has no list column.
  const showList = activeFolder !== "scratchpad";

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-dvh w-full">
      <ResizablePanel
        id="classic-sidebar"
        defaultSize={CLASSIC_SIDEBAR_DEFAULT_SIZE}
        minSize={CLASSIC_SIDEBAR_MIN_SIZE}
        maxSize={CLASSIC_SIDEBAR_MAX_SIZE}
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
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-dvh w-full">
      <ResizablePanel
        id="library"
        defaultSize={LIBRARY_DEFAULT_SIZE}
        minSize={LIBRARY_MIN_SIZE}
        maxSize={LIBRARY_MAX_SIZE}
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
