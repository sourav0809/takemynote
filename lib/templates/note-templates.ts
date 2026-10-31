import { PERSONAL_TEMPLATES } from "@/lib/templates/library/personal";
import { PLANNING_TEMPLATES } from "@/lib/templates/library/planning";
import { WORK_TEMPLATES } from "@/lib/templates/library/work";
import { WRITING_TEMPLATES } from "@/lib/templates/library/writing";
import type { NoteTemplate, TemplateCategory } from "@/lib/templates/template-types";

export type { NoteTemplate, TemplateCategory } from "@/lib/templates/template-types";

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "planning", label: "Planning" },
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "writing", label: "Writing" },
];

/** Every free template, popular ones first. */
export const NOTE_TEMPLATES: NoteTemplate[] = [
  ...PLANNING_TEMPLATES,
  ...WORK_TEMPLATES,
  ...PERSONAL_TEMPLATES,
  ...WRITING_TEMPLATES,
].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const formatDay = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** Placeholder values for "now": today, this week (Monday to Sunday) and this month. */
function getPlaceholderValues(now: Date): Record<string, string> {
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now.getTime() - mondayOffset * MS_PER_DAY);
  const weekDays = DAY_KEYS.map((_, index) => new Date(monday.getTime() + index * MS_PER_DAY));

  return {
    date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
    month: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    weekRange: `${formatDay(weekDays[0])} – ${formatDay(weekDays[6])}`,
    ...Object.fromEntries(
      DAY_KEYS.map((key, index) => [
        key,
        weekDays[index].toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      ])
    ),
  };
}

/** Fills the placeholders and returns the note's title and Markdown body. */
export function renderTemplate(template: NoteTemplate, now: Date = new Date()) {
  const values = getPlaceholderValues(now);
  const fill = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
  return { title: fill(template.title), markdown: fill(template.markdown) };
}
