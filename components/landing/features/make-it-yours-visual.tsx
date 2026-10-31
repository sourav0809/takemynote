import { cn } from "@/lib/utils";

interface ChoiceRow {
  label: string;
  options: string[];
  selected: string;
}

/** The real choices from Settings → Preferences. */
const CHOICES: ChoiceRow[] = [
  { label: "Layout", options: ["Classic", "Library + Page"], selected: "Classic" },
  { label: "Writing area", options: ["Left", "Centered", "Full"], selected: "Centered" },
  { label: "Theme", options: ["Light", "Dark", "System"], selected: "Light" },
];

const SHORTCUT_KEYS = ["⌘", "⌥", "N"];

/** A mini preferences panel: layout, writing area, theme and a shortcut. */
export function MakeItYoursVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-2 rounded-2xl bg-surface p-3.5 shadow-card">
      {CHOICES.map(({ label, options, selected }) => (
        <div key={label} className="flex items-center justify-between gap-3">
          <span className="shrink-0 text-[12px] font-medium text-muted">{label}</span>
          <span className="flex min-w-0 gap-0.5 rounded-full bg-sunken p-0.5">
            {options.map((option) => (
              <span
                key={option}
                className={cn(
                  "truncate rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  option === selected ? "bg-surface text-ink shadow-card" : "text-muted"
                )}
              >
                {option}
              </span>
            ))}
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-line pt-2.5">
        <span className="text-[12px] font-medium text-muted">New note</span>
        <span className="flex gap-1">
          {SHORTCUT_KEYS.map((key) => (
            <kbd
              key={key}
              className="min-w-6 rounded-md border border-line-strong bg-surface px-1.5 text-center font-mono text-[11px] leading-6 text-ink-soft"
            >
              {key}
            </kbd>
          ))}
        </span>
      </div>
    </div>
  );
}
