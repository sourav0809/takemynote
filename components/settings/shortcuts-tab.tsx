import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";

const SHORTCUTS = [
  { label: "New note", key: "N" },
  { label: "Search notes", key: "F" },
  { label: "Toggle preview", key: "P" },
  { label: "Toggle favorite", key: "S" },
  { label: "Move to trash", key: "D" },
  { label: "Toggle dark mode", key: "L" },
];

export function ShortcutsTab() {
  const { mod, alt } = usePlatformModifierKeys();

  return (
    <div className="flex flex-col">
      {SHORTCUTS.map((shortcut) => {
        const keys = [mod, alt, shortcut.key];
        return (
          <div
            key={shortcut.label}
            className="flex items-center justify-between border-b border-border py-3 last:border-b-0"
          >
            <span className="text-sm text-foreground">{shortcut.label}</span>
            <div className="flex items-center gap-1">
              {keys.map((key, index) => (
                <span key={key} className="flex items-center gap-1">
                  <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {key}
                  </kbd>
                  {index < keys.length - 1 && (
                    <span className="text-xs text-muted-foreground">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
