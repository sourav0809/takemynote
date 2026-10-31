import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";
import { SHORTCUTS } from "@/lib/shortcuts";

export function ShortcutsTab() {
  const { mod, alt } = usePlatformModifierKeys();
  const rows = [
    ...SHORTCUTS.map((shortcut) => ({ id: shortcut.id, label: shortcut.label, keys: [mod, alt, shortcut.keyLabel] })),
    // Handled by the note editor, not lib/shortcuts.ts: it only works inside a note.
    { id: "askAi", label: "Ask AI (inside a note)", keys: [mod, "J"] },
  ];

  return (
    <div className="flex flex-col">
      {rows.map(({ id, label, keys }) => {
        return (
          <div
            key={id}
            className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
          >
            <span className="text-sm text-foreground">{label}</span>
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
