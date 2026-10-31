import { CircleCheck } from "lucide-react";

import { usePreferences } from "@/hooks/use-preferences";
import type { WritingPosition } from "@/lib/data/preferences-storage";
import { cn } from "@/lib/utils";

const POSITION_OPTIONS: { value: WritingPosition; label: string; hint: string }[] = [
  { value: "start", label: "Left", hint: "Starts at the edge" },
  { value: "center", label: "Centered", hint: "Like a page" },
  { value: "full", label: "Full width", hint: "Uses all the space" },
];

/** Where the text block sits inside the miniature page, per option. */
const PREVIEW_COLUMN_CLASS: Record<WritingPosition, string> = {
  start: "w-[62%]",
  center: "mx-auto w-[62%]",
  full: "w-full",
};

function WritingPreview({ value }: { value: WritingPosition }) {
  return (
    <span aria-hidden className="flex h-16 flex-col overflow-hidden rounded-lg border border-border bg-background sm:h-20">
      <span className="flex justify-center gap-0.5 border-b border-border py-1">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="size-1 rounded-[1px] bg-foreground/20" />
        ))}
      </span>
      <span className="flex-1 px-2 pt-1.5">
        <span className={cn("flex flex-col gap-1", PREVIEW_COLUMN_CLASS[value])}>
          <span className="h-1.5 w-1/2 rounded-full bg-foreground/60" />
          <span className="h-1 w-full rounded-full bg-foreground/15" />
          <span className="h-1 w-11/12 rounded-full bg-foreground/15" />
          <span className="h-1 w-4/5 rounded-full bg-foreground/15" />
        </span>
      </span>
    </span>
  );
}

/** The three writing-area cards (radio group). Applies the choice immediately. */
export function WritingPositionCards({ className }: { className?: string }) {
  const { writingPosition, setPreference } = usePreferences();

  return (
    <div role="radiogroup" aria-label="Writing area" className={cn("grid grid-cols-3 gap-2.5", className)}>
      {POSITION_OPTIONS.map((option) => {
        const isSelected = option.value === writingPosition;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setPreference("writingPosition", option.value)}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/25"
            )}
          >
            <WritingPreview value={option.value} />
            <span className="flex items-start justify-between gap-1 px-0.5">
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{option.label}</span>
                <span className="hidden truncate text-xs text-muted-foreground sm:block">
                  {option.hint}
                </span>
              </span>
              <CircleCheck
                className={cn("mt-0.5 size-3.5 shrink-0", isSelected ? "text-primary" : "invisible")}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Settings → Preferences: where note text sits in the writing area. */
export function WritingPositionPicker() {
  return (
    <div className="border-b border-border py-5">
      <p className="text-sm font-medium">Writing area</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Where your text sits on the page. The toolbar always stays centred.
      </p>
      <WritingPositionCards className="mt-3" />
    </div>
  );
}
