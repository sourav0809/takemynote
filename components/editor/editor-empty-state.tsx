import { SidePanesToggle } from "@/components/app-shell/pane-toggle-button";
import { usePlatformModifierKeys } from "@/hooks/use-platform-modifier-key";

export function EditorEmptyState() {
  const { mod, alt } = usePlatformModifierKeys();

  return (
    <div className="relative flex h-full items-center justify-center bg-background px-6">
      {/* Desktop only (phones never show this state): the way back if every column is hidden. */}
      <SidePanesToggle className="absolute top-3 left-4 hidden lg:inline-flex" />
      <p className="text-sm text-muted-foreground">
        Pick a note on the left, or press {mod} {alt} N to start a new one.
      </p>
    </div>
  );
}
