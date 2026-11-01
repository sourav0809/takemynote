import { SidebarRail } from "@/components/app-shell/sidebar-rail";
import { ClassicListPane } from "@/components/classic/classic-list-pane";
import { ClassicSidebar } from "@/components/classic/classic-sidebar";
import { EditorPane } from "@/components/editor/editor-pane";
import { LibraryPane } from "@/components/library/library-pane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidePanes } from "@/hooks/use-side-panes";
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
 * Classic: sidebar, note list and Page in three resizable columns. The sidebar
 * collapses to an icon rail; the note list can be hidden.
 */
export function ClassicDesktopShell() {
  const { isSidebarExpanded, isNoteListVisible, setSidebarExpanded, setNoteListVisible } = useSidePanes();

  return (
    <div className="flex h-dvh w-full">
      {!isSidebarExpanded && <SidebarRail onExpand={() => setSidebarExpanded(true)} />}
      <ResizablePanelGroup orientation="horizontal" className="h-full min-w-0 flex-1">
        {isSidebarExpanded && (
          <>
            <ResizablePanel
              id="classic-sidebar"
              defaultSize={CLASSIC_SIDEBAR_DEFAULT_SIZE}
              minSize={CLASSIC_SIDEBAR_MIN_SIZE}
              maxSize={CLASSIC_SIDEBAR_MAX_SIZE}
            >
              <ClassicSidebar onCollapse={() => setSidebarExpanded(false)} />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}
        {isNoteListVisible && (
          <>
            <ResizablePanel
              id="classic-list"
              defaultSize={CLASSIC_LIST_DEFAULT_SIZE}
              minSize={CLASSIC_LIST_MIN_SIZE}
              maxSize={CLASSIC_LIST_MAX_SIZE}
            >
              <ClassicListPane onCollapse={() => setNoteListVisible(false)} />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}
        <ResizablePanel id="classic-page">
          <EditorPane />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

/** Library + Page: one column to find notes, one to write. The Library collapses to an icon rail. */
export function LibraryDesktopShell() {
  const { isSidebarExpanded, setSidebarExpanded } = useSidePanes();

  return (
    <div className="flex h-dvh w-full">
      {!isSidebarExpanded && <SidebarRail onExpand={() => setSidebarExpanded(true)} expandOnNavigate />}
      <ResizablePanelGroup orientation="horizontal" className="h-full min-w-0 flex-1">
        {isSidebarExpanded && (
          <>
            <ResizablePanel
              id="library"
              defaultSize={LIBRARY_DEFAULT_SIZE}
              minSize={LIBRARY_MIN_SIZE}
              maxSize={LIBRARY_MAX_SIZE}
            >
              <LibraryPane onCollapse={() => setSidebarExpanded(false)} />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}
        <ResizablePanel id="page">
          <EditorPane />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
