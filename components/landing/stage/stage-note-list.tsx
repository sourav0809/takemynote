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
              active ? "border-brand bg-brand" : "border-transparent"
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  "truncate text-[12px] font-semibold",
                  active ? "text-brand-foreground" : "text-ink"
                )}
              >
                {title}
              </span>
              <span
                className={cn(
                  "shrink-0 font-mono text-[10px]",
                  active ? "text-brand-foreground/70" : "text-subtle"
                )}
              >
                {time}
              </span>
            </div>
            <p
              className={cn(
                "mt-0.5 truncate text-[11px]",
                active ? "text-brand-foreground/75" : "text-muted"
              )}
            >
              {preview}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
