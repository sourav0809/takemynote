import { cn } from "@/lib/utils";

/** A grey text line in the miniature. */
const Line = ({ className }: { className?: string }) => (
  <span className={cn("block h-1 rounded-full bg-ink/15", className)} />
);

function MiniNoteRows() {
  return (
    <span className="flex flex-col gap-1">
      <span className="flex flex-col gap-1 rounded-[4px] bg-brand px-1.5 py-1">
        <span className="block h-1 w-3/4 rounded-full bg-white/80" />
        <span className="block h-1 w-1/2 rounded-full bg-white/50" />
      </span>
      {[0, 1, 2].map((row) => (
        <span key={row} className="flex flex-col gap-1 px-1.5 py-1">
          <Line className="w-3/4" />
          <Line className="w-1/2" />
        </span>
      ))}
    </span>
  );
}

function MiniPage() {
  return (
    <span className="flex flex-1 flex-col gap-1.5 bg-surface p-2.5">
      <span className="block h-2 w-1/2 rounded-full bg-ink/60" />
      <Line className="w-11/12" />
      <Line className="w-10/12" />
      <Line className="w-8/12" />
    </span>
  );
}

/** A faithful miniature of each layout the app offers. */
function LayoutMiniature({ layout, label, isSelected }: { layout: "classic" | "library"; label: string; isSelected?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={cn(
          "flex h-20 overflow-hidden rounded-xl border bg-canvas",
          isSelected ? "border-brand ring-1 ring-brand" : "border-line"
        )}
      >
        {layout === "classic" ? (
          <>
            <span className="flex w-[22%] flex-col gap-1.5 border-r border-line p-2">
              <span className="mb-1 block h-1.5 w-3/4 rounded-full bg-brand" />
              <span className="block h-2 rounded-[3px] bg-sky-edge" />
              <Line className="w-2/3" />
              <Line className="w-1/2" />
            </span>
            <span className="w-[30%] border-r border-line bg-surface p-1.5">
              <MiniNoteRows />
            </span>
          </>
        ) : (
          <span className="flex w-[36%] flex-col gap-1.5 border-r border-line p-1.5">
            <span className="flex items-center justify-between px-0.5">
              <span className="block h-1.5 w-1/2 rounded-full bg-brand" />
              <span className="size-2 rounded-full bg-brand" />
            </span>
            <MiniNoteRows />
          </span>
        )}
        <MiniPage />
      </span>
      <span className="px-0.5 text-[12px] font-medium text-ink-soft">{label}</span>
    </div>
  );
}

const CHOICES: { label: string; options: string[]; selected: string }[] = [
  { label: "Writing area", options: ["Left", "Centered", "Full"], selected: "Centered" },
];

/** Layouts, writing area, theme and a shortcut: the real choices in Settings. */
export function MakeItYoursVisual() {
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <LayoutMiniature layout="classic" label="Classic" isSelected />
        <LayoutMiniature layout="library" label="Library + Page" />
      </div>
      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-3 shadow-card">
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
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2">
          <span className="text-[12px] font-medium text-muted">New note</span>
          <span className="flex gap-1">
            {["⌘", "⌥", "N"].map((key) => (
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
    </div>
  );
}
