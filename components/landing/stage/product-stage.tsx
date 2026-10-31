import { StageEditor } from "@/components/landing/stage/stage-editor";
import { StageNoteList } from "@/components/landing/stage/stage-note-list";
import { StageSidebar } from "@/components/landing/stage/stage-sidebar";
import { cn } from "@/lib/utils";

const WINDOW_CONTROL_CLASSES = ["bg-window-close", "bg-window-minimize", "bg-window-zoom"];

export function ProductStage() {
  return (
    <div className="relative isolate overflow-hidden rounded-[28px] border border-stage-line bg-stage p-3 stage-ruled sm:p-6 lg:p-10">
      <div
        aria-hidden
        className="absolute -top-24 left-1/4 -z-10 h-64 w-1/2 rounded-full bg-sky-ink/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-16 bottom-0 -z-10 h-56 w-72 rounded-full bg-accent-edge/25 blur-3xl"
      />

      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-surface shadow-window">
        <div className="flex h-9 items-center gap-2 border-b border-line bg-canvas px-4">
          {WINDOW_CONTROL_CLASSES.map((colorClass) => (
            <span
              key={colorClass}
              className={cn("size-3 rounded-full ring-1 ring-black/10 ring-inset", colorClass)}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:grid-cols-[11rem_minmax(0,15rem)_minmax(0,1fr)]">
          <StageSidebar />
          <StageNoteList />
          <StageEditor />
        </div>
      </div>
    </div>
  );
}
