import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";

export function EditorEmptyState() {
  const { mod, alt } = usePlatformModifierKeys();

  return (
    <div className="flex h-full items-center justify-center bg-background px-6">
      <p className="text-sm text-muted-foreground">
        Pick a note on the left, or press {mod} {alt} N to start a new one.
      </p>
    </div>
  );
}
