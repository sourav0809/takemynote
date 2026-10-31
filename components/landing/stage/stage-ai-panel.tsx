import { Sparkles } from "lucide-react";
import { STAGE_AI_ACTIONS, STAGE_AI_SUGGESTION } from "@/components/landing/stage/stage-mock-data";

export function StageAiPanel() {
  return (
    <div aria-hidden className="flex min-w-0 flex-col gap-2.5">
      <div className="rounded-2xl border border-violet-edge bg-violet-tint p-4">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-surface text-violet-ink shadow-card">
            <Sparkles className="size-3.5" />
          </span>
          <span className="text-[13px] font-semibold text-ink">AI suggestion</span>
        </div>
        <p className="mt-2.5 text-[13px] leading-relaxed text-ink-soft">{STAGE_AI_SUGGESTION}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex h-7 items-center rounded-full bg-ink px-3 text-[12px] font-semibold text-white">
            Add to note
          </span>
          <span className="inline-flex h-7 items-center rounded-full border border-violet-edge bg-surface px-3 text-[12px] font-semibold text-ink-soft">
            Try again
          </span>
        </div>
      </div>

      <ul className="flex flex-wrap gap-1.5">
        {STAGE_AI_ACTIONS.map((action) => (
          <li
            key={action}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-[11px] font-semibold text-muted"
          >
            <Sparkles className="size-3 text-violet-ink" />
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}
