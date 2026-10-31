import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { SHORTCUTS } from "@/lib/shortcuts";

export function ShortcutsTab() {
  const { mod, alt } = usePlatformModifierKeys();

  return (
    <div className="flex flex-col">
      {SHORTCUTS.map((shortcut) => {
        const keys = [mod, alt, shortcut.keyLabel];
        return (
          <div
            key={shortcut.id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
          >
            <span className="text-sm text-foreground">{shortcut.label}</span>
            <div className="flex shrink-0 items-center gap-1">
              {keys.map((key, index) => (
                <span key={key} className="flex items-center gap-1">
                  <kbd className="min-w-6 rounded-md border border-border bg-muted px-1.5 py-0.5 text-center font-mono text-xs">
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
      <p className="pt-4 text-xs text-muted-foreground">
        Type / inside a note for blocks, and select text for formatting.
      </p>
    </div>
  );
}
