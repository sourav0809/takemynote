import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface NoteSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function NoteSearchBar({ value, onChange }: NoteSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search for notes"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
