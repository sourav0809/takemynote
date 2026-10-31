import { flushSync } from "react-dom";
import { CircleCheck } from "lucide-react";

import { LayoutPreview } from "@/components/settings/layout-preview";
import { usePreferences } from "@/hooks/use-preferences";
import type { AppLayout } from "@/lib/data/preferences-storage";
import { cn } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const LAYOUT_OPTIONS: { value: AppLayout; label: string; description: string }[] = [
  {
    value: "classic",
    label: "Classic",
    description: "Folders, notes and the page in three columns.",
  },
  {
    value: "library",
    label: "Library + Page",
    description: "Find notes on the left, write on the right. Fewer columns.",
  },
];

/** The two layout cards (radio group). Applies the choice immediately. */
export function LayoutOptionCards({ className }: { className?: string }) {
  const { layout, setPreference } = usePreferences();

  const handleSelect = (value: AppLayout) => {
    if (value === layout) return;
    const canAnimate =
      typeof document.startViewTransition === "function" &&
      !window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (!canAnimate) {
      setPreference("layout", value);
      return;
    }
    // Cross-fade from the old layout to the new one.
    document.startViewTransition(() => flushSync(() => setPreference("layout", value)));
  };

  return (
    <div role="radiogroup" aria-label="Layout" className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      {LAYOUT_OPTIONS.map((option) => {
        const isSelected = option.value === layout;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex flex-col gap-2.5 rounded-xl border p-2.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-foreground/25"
            )}
          >
            <LayoutPreview layout={option.value} />
            <span className="flex items-start justify-between gap-2 px-0.5">
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </span>
              <CircleCheck
                className={cn("mt-0.5 size-4 shrink-0", isSelected ? "text-primary" : "invisible")}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Settings → Preferences: the layout choice with a short explanation. */
export function LayoutPicker() {
  return (
    <div className="border-b border-border pb-5">
      <p className="text-sm font-medium">Layout</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Choose how the app is arranged. On phones, both show one screen at a time.
      </p>
      <LayoutOptionCards className="mt-3" />
    </div>
  );
}
