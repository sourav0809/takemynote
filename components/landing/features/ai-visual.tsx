import type { LucideIcon } from "lucide-react";
import { ListChecks, PenLine, Sparkles, SpellCheck, TextQuote } from "lucide-react";

const AI_CHIPS: { icon: LucideIcon; label: string }[] = [
  { icon: TextQuote, label: "Summarize" },
  { icon: ListChecks, label: "Make a checklist" },
  { icon: SpellCheck, label: "Fix spelling" },
  { icon: PenLine, label: "Continue writing" },
];

/** A mini AI suggestion card, matching the one inside the app. */
export function AiVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2.5">
      <div className="rounded-2xl bg-surface p-3.5 shadow-card">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
          <span className="flex size-6 items-center justify-center rounded-full bg-sky-tint text-sky-ink">
            <Sparkles className="size-3.5" />
          </span>
          Make a checklist
        </p>
        <ul className="mt-2.5 flex flex-col gap-1.5 text-[13px] text-ink-soft">
          {["Book the tram 28 early", "Sunset at Miradouro da Graça", "Find a fado bar in Alfama"].map(
            (task) => (
              <li key={task} className="flex items-center gap-2">
                <span className="size-3.5 shrink-0 rounded-[4px] border border-line-strong" />
                <span className="truncate">{task}</span>
              </li>
            )
          )}
        </ul>
        <div className="mt-3 flex gap-2">
          <span className="rounded-full bg-brand px-3 py-1 text-[12px] font-semibold text-brand-foreground">
            Add to note
          </span>
          <span className="rounded-full border border-line px-3 py-1 text-[12px] font-semibold text-ink-soft">
            Try again
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {AI_CHIPS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-line bg-surface px-2.5 text-[11px] font-semibold text-muted"
          >
            <Icon className="size-3 text-sky-ink" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
