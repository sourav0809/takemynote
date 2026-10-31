import { Check } from "lucide-react";
import { SlashMenuPreview } from "@/components/landing/slash-menu-preview";
import { StageAiPanel } from "@/components/landing/stage/stage-ai-panel";
import { STAGE_TASKS } from "@/components/landing/stage/stage-mock-data";
import { cn } from "@/lib/utils";

export function StageEditor() {
  return (
    <div className="relative min-w-0 bg-surface px-5 pt-6 pb-8 sm:px-8 sm:pt-8">
      <p className="text-[11px] font-medium text-subtle">
        <span className="text-peach-ink">Travel</span> · Edited just now
      </p>
      <h3 className="mt-2 text-[22px] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
        Weekend in Lisbon
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed text-muted sm:text-[14px]">
        Land Friday morning. Drop bags in Príncipe Real, then{" "}
        <span className="marker text-ink">pastéis de nata at Manteigaria</span> before anything
        else.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {STAGE_TASKS.map(({ label, done }) => (
          <li key={label} className="flex items-center gap-2.5 text-[13px] sm:text-[14px]">
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-[5px] border",
                done ? "border-ink bg-ink text-white" : "border-line-strong bg-surface"
              )}
            >
              {done && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className={cn(done ? "text-subtle line-through" : "text-ink-soft")}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] xl:items-start">
        <div className="hidden xl:block">
          <p className="flex items-center text-[13px] text-ink sm:text-[14px]">
            /
            <span aria-hidden className="ml-px h-4 w-px animate-pulse bg-ink" />
          </p>
          <SlashMenuPreview className="mt-2" />
        </div>
        <StageAiPanel />
      </div>
    </div>
  );
}
