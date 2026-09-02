import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";

export function EditorEmptyState() {
  const { mod, alt } = usePlatformModifierKeys();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-background text-center">
      <p className="text-base font-medium text-foreground">Create a note</p>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        Select a note from the list, or press
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          {mod}
        </kbd>
        +
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          {alt}
        </kbd>
        +
        <kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          N
        </kbd>
      </p>
    </div>
  );
}
