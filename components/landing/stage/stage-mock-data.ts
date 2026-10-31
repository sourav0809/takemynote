import { FileText, NotebookPen, Star, Trash2 } from "lucide-react";

export const STAGE_FOLDERS = [
  { label: "Notes", icon: FileText, count: 12, active: true },
  { label: "Favorites", icon: Star, count: 3, active: false },
  { label: "Scratchpad", icon: NotebookPen, count: null, active: false },
  { label: "Trash", icon: Trash2, count: null, active: false },
];

export const STAGE_CATEGORIES = [
  { label: "Ideas", dotClass: "bg-accent-edge" },
  { label: "Work", dotClass: "bg-brand" },
  { label: "Travel", dotClass: "bg-brand-deep" },
];

export const STAGE_NOTES = [
  { title: "Weekend in Lisbon", preview: "Pastéis de nata at Manteigaria…", time: "2m", active: true },
  { title: "Book club picks", preview: "Shortlist for November…", time: "1h", active: false },
  { title: "Sprint retro", preview: "What went well: shipped backup…", time: "Mon", active: false },
  { title: "Gift ideas", preview: "Film camera, linen notebook…", time: "Sun", active: false },
];

export const STAGE_TASKS = [
  { label: "Book the tram 28 early", done: true },
  { label: "Sunset at Miradouro da Graça", done: false },
  { label: "Find a fado bar in Alfama", done: false },
];

export const STAGE_AI_SUGGESTION =
  "Evenings by the river get breezy. Add a light jacket and book Alfama for Saturday night?";

export const STAGE_AI_ACTIONS = ["Summarize", "Make a checklist", "Fix spelling"];
