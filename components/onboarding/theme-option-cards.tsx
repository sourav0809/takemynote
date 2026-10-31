import { CircleCheck } from "lucide-react";
import { useTheme } from "next-themes";

import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { cn } from "@/lib/utils";

type ThemeChoice = "light" | "dark" | "system";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match system" },
];

/** A tiny page drawn in the given palette; "system" shows both halves. */
function ThemeSwatch({ value }: { value: ThemeChoice }) {
  const page = (dark: boolean) => (
    <span className={cn("flex flex-1 flex-col gap-1 p-2", dark ? "bg-neutral-900" : "bg-white")}>
      <span className={cn("h-1.5 w-1/2 rounded-full", dark ? "bg-neutral-200" : "bg-neutral-800")} />
      <span className={cn("h-1 w-5/6 rounded-full", dark ? "bg-neutral-600" : "bg-neutral-300")} />
      <span className={cn("h-1 w-2/3 rounded-full", dark ? "bg-neutral-600" : "bg-neutral-300")} />
      <span className="mt-auto h-2 w-6 rounded-full bg-primary" />
    </span>
  );

  return (
    <span aria-hidden className="flex h-16 overflow-hidden rounded-lg border border-border">
      {value === "system" ? (
        <>
          {page(false)}
          {page(true)}
        </>
      ) : (
        page(value === "dark")
      )}
    </span>
  );
}

/** Light, dark or follow the device. Applies immediately. */
export function ThemeOptionCards() {
  const { theme, setTheme } = useTheme();
  const { setThemeSmoothly } = useThemeToggle();
  const current: ThemeChoice = theme === "light" || theme === "dark" ? theme : "system";

  const handleSelect = (value: ThemeChoice) => {
    if (value === "system") setTheme("system");
    else void setThemeSmoothly(value);
  };

  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-2.5">
      {THEME_OPTIONS.map((option) => {
        const isSelected = option.value === current;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/25"
            )}
          >
            <ThemeSwatch value={option.value} />
            <span className="flex items-center justify-between gap-1 px-0.5">
              <span className="truncate text-[13px] font-medium">{option.label}</span>
              <CircleCheck className={cn("size-3.5 shrink-0", isSelected ? "text-primary" : "invisible")} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
