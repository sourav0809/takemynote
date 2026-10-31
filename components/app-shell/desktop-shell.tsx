import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { NoteListPane } from "@/components/note-list/note-list-pane";
import { EditorPane } from "@/components/editor/editor-pane";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAppState } from "@/hooks/use-app-state";
import {
  NOTE_LIST_DEFAULT_SIZE,
  NOTE_LIST_MAX_SIZE,
  NOTE_LIST_MIN_SIZE,
  SIDEBAR_DEFAULT_SIZE,
  SIDEBAR_MAX_SIZE,
  SIDEBAR_MIN_SIZE,
} from "@/lib/constants";

export function AppShell() {
  const { activeFolder } = useAppState();
  const isScratchpad = activeFolder === "scratchpad";

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-screen w-full">
      <ResizablePanel
        id="sidebar"
        defaultSize={SIDEBAR_DEFAULT_SIZE}
        minSize={SIDEBAR_MIN_SIZE}
        maxSize={SIDEBAR_MAX_SIZE}
      >
        <AppSidebar />
      </ResizablePanel>
      <ResizableHandle />

      {!isScratchpad && (
        <>
          <ResizablePanel
            id="note-list"
            defaultSize={NOTE_LIST_DEFAULT_SIZE}
            minSize={NOTE_LIST_MIN_SIZE}
            maxSize={NOTE_LIST_MAX_SIZE}
          >
            <NoteListPane />
          </ResizablePanel>
          <ResizableHandle />
        </>
      )}
      <ResizablePanel id="editor">
        <EditorPane />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
