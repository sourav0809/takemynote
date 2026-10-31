import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { NOTE_SEARCH_INPUT_ID } from "@/hooks/use-global-shortcuts";

interface NoteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteSearchBar({ value, onChange }: NoteSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={NOTE_SEARCH_INPUT_ID}
        type="search"
        placeholder="Search notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 border-border bg-muted/60 pl-9 shadow-none hover:bg-muted focus-visible:bg-background lg:h-9 dark:bg-input/40"
      />
    </div>
  );
}
