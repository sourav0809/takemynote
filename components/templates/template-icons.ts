import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarCheck,
  CalendarRange,
  ChefHat,
  ClipboardList,
  Coffee,
  Dumbbell,
  FileText,
  FlaskConical,
  Goal,
  History,
  Lightbulb,
  ListChecks,
  NotebookPen,
  Plane,
  Rocket,
  UserSearch,
  Users,
  UsersRound,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

/** One icon per template id (lib/templates/library/*). */
export const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "daily-planner": CalendarCheck,
  "weekly-planner": CalendarRange,
  "weekly-review": History,
  "monthly-goals": Goal,
  "habit-tracker": ListChecks,
  "meeting-notes": Users,
  "project-plan": Rocket,
  "one-on-one": UsersRound,
  "product-spec": ClipboardList,
  standup: Coffee,
  "interview-notes": UserSearch,
  journal: NotebookPen,
  "trip-planner": Plane,
  "meal-planner": UtensilsCrossed,
  budget: Wallet,
  "workout-log": Dumbbell,
  recipe: ChefHat,
  "book-notes": BookOpen,
  "blog-post": FileText,
  brainstorm: Lightbulb,
  "research-notes": FlaskConical,
};

export function getTemplateIcon(id: string): LucideIcon {
  return TEMPLATE_ICONS[id] ?? FileText;
}
