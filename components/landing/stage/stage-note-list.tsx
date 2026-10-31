import { Search } from "lucide-react";
import { STAGE_NOTES } from "@/components/landing/stage/stage-mock-data";
import { cn } from "@/lib/utils";

export function StageNoteList() {
  return (
    <div className="hidden min-w-0 flex-col gap-2 border-r border-line bg-surface p-3 md:flex">
      <div className="flex h-8 items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 text-[12px] text-subtle">
        <Search className="size-3.5" />
        Search notes
      </div>
      <ul className="flex flex-col gap-1">
        {STAGE_NOTES.map(({ title, preview, time, active }) => (
          <li
            key={title}
            className={cn(
              "rounded-xl border px-2.5 py-2",
              active ? "border-line bg-sunken" : "border-transparent"
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[12px] font-semibold text-ink">{title}</span>
              <span className="shrink-0 font-mono text-[10px] text-subtle">{time}</span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-muted">{preview}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
