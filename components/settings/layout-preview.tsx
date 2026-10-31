import type { AppLayout } from "@/lib/data/preferences-storage";
import { cn } from "@/lib/utils";

/** A grey text line in the miniature. */
function Line({ className }: { className?: string }) {
  return <span className={cn("block h-1 rounded-full bg-foreground/15", className)} />;
}

/** One note row in the miniature list; the first one is the selected note. */
function NoteRow({ isSelected }: { isSelected?: boolean }) {
  return (
    <span
      className={cn(
        "flex flex-col gap-1 rounded-[4px] px-1.5 py-1",
        isSelected ? "bg-primary" : ""
      )}
    >
      <Line className={cn("w-3/4", isSelected && "bg-primary-foreground/80")} />
      <Line className={cn("w-1/2", isSelected && "bg-primary-foreground/50")} />
    </span>
  );
}

function NoteRows() {
  return (
    <span className="flex flex-col gap-1">
      <NoteRow isSelected />
      <NoteRow />
      <NoteRow />
      <NoteRow />
    </span>
  );
}

function PagePreview() {
  return (
    <span className="flex flex-1 flex-col gap-1.5 bg-background p-2.5">
      <span className="mb-1 flex gap-1">
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className="size-1.5 rounded-[2px] bg-foreground/15" />
        ))}
      </span>
      <span className="block h-2 w-1/2 rounded-full bg-foreground/60" />
      <Line className="w-11/12" />
      <Line className="w-10/12" />
      <Line className="w-9/12" />
      <Line className="w-7/12" />
    </span>
  );
}

/** A small, faithful drawing of each layout for the Settings picker. */
export function LayoutPreview({ layout }: { layout: AppLayout }) {
  return (
    <span
      aria-hidden
      className="flex h-28 overflow-hidden rounded-lg border border-border bg-sidebar"
    >
      {layout === "classic" ? (
        <>
          <span className="flex w-[22%] flex-col gap-1.5 border-r border-border p-2">
            <span className="mb-1 block h-1.5 w-3/4 rounded-full bg-primary" />
            <span className="block h-2 rounded-[3px] bg-sidebar-accent" />
            <Line className="w-2/3" />
            <Line className="w-3/4" />
            <Line className="w-1/2" />
          </span>
          <span className="w-[30%] border-r border-border bg-background p-1.5">
            <NoteRows />
          </span>
        </>
      ) : (
        <span className="flex w-[34%] flex-col gap-1.5 border-r border-border p-1.5">
          <span className="flex items-center justify-between px-0.5">
            <span className="block h-1.5 w-1/2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
          </span>
          <span className="block h-2 rounded-[3px] bg-background" />
          <NoteRows />
        </span>
      )}
      <PagePreview />
    </span>
  );
}
