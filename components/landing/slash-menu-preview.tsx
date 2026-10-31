import { Code2, Heading1, ListChecks, Quote } from "lucide-react";
import { SLASH_PREVIEW_ITEMS } from "@/components/landing/landing-content";
import { cn } from "@/lib/utils";

const ITEM_ICONS = [Heading1, ListChecks, Quote, Code2];
const ACTIVE_INDEX = 1;

interface SlashMenuPreviewProps {
  className?: string;
}

export function SlashMenuPreview({ className }: SlashMenuPreviewProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "w-full max-w-60 rounded-2xl border border-line bg-surface p-1.5 shadow-float",
        className
      )}
    >
      <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-semibold tracking-wide text-subtle uppercase">
        Blocks
      </p>
      <ul>
        {SLASH_PREVIEW_ITEMS.map((item, index) => {
          const Icon = ITEM_ICONS[index];
          const isActive = index === ACTIVE_INDEX;
          return (
            <li
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2 py-1.5",
                isActive && "bg-sunken"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                  isActive ? "border-accent-edge/60 bg-accent" : "border-line bg-surface"
                )}
              >
                <Icon className="size-3.5 text-ink-soft" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink">
                  {item.label}
                </span>
                <span className="block truncate text-[11px] text-muted">{item.hint}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
