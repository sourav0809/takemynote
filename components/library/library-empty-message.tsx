import { useAppState } from "@/hooks/use-app-state";
import { useCategories } from "@/hooks/use-categories";
import { RECENT_NOTE_WINDOW_DAYS } from "@/lib/constants";

/** One quiet sentence that says why the list is empty and what to do next. */
export function LibraryEmptyMessage() {
  const { activeFolder, activeCategoryId, searchQuery, listFilter } = useAppState();
  const { data: categories } = useCategories();

  const getMessage = (): string => {
    const query = searchQuery.trim();
    if (query) return `No notes match “${query}”.`;
    if (activeFolder === "trash") return "Trash is empty. Deleted notes wait here until you empty it.";
    if (activeFolder === "favorites") return "Star a note and it will show up here.";
    if (activeFolder === "scratchpad") return "Opening your scratchpad…";
    if (listFilter === "pinned") return "Pin a note to keep it at the top.";
    if (listFilter === "recent") return `Nothing edited in the last ${RECENT_NOTE_WINDOW_DAYS} days.`;
    const category = categories.find((item) => item.id === activeCategoryId);
    if (category) return `No notes in ${category.name} yet. New notes made here land in it.`;
    return "No notes yet. Start one with the + button.";
  };

  return <p className="px-3 py-6 text-sm leading-relaxed text-muted-foreground">{getMessage()}</p>;
}
