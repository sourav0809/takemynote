import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NoteListFilter } from "@/lib/constants";

interface NoteListFilterTabsProps {
  value: NoteListFilter;
  onValueChange: (value: NoteListFilter) => void;
}

const FILTERS: { value: NoteListFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "recent", label: "Recent" },
  { value: "pinned", label: "Pinned" },
];

export function NoteListFilterTabs({ value, onValueChange }: NoteListFilterTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(newValue) => onValueChange(newValue as NoteListFilter)}
    >
      <TabsList>
        {FILTERS.map((filter) => (
          <TabsTrigger key={filter.value} value={filter.value}>
            {filter.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
