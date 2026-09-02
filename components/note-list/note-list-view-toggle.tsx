import { LayoutGrid, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NoteListView } from "@/lib/constants";

interface NoteListViewToggleProps {
  value: NoteListView;
  onValueChange: (value: NoteListView) => void;
}

export function NoteListViewToggle({ value, onValueChange }: NoteListViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-full bg-muted p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="List view"
        aria-pressed={value === "list"}
        onClick={() => onValueChange("list")}
        className={cn(
          "rounded-full text-foreground/70",
          value === "list" && "bg-background text-foreground shadow-sm"
        )}
      >
        <Rows3 className="size-4.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Grid view"
        aria-pressed={value === "grid"}
        onClick={() => onValueChange("grid")}
        className={cn(
          "rounded-full text-foreground/70",
          value === "grid" && "bg-background text-foreground shadow-sm"
        )}
      >
        <LayoutGrid className="size-4.5" />
      </Button>
    </div>
  );
}
