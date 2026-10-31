export type TemplateCategory = "planning" | "work" | "personal" | "writing";

export interface NoteTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  /** Listed first in the gallery with a "Popular" badge. */
  featured?: boolean;
  /** Title given to the note; may use placeholders. */
  title: string;
  /**
   * Body in Markdown: headings, lists, "- [ ]" tasks, tables, "> " quotes,
   * "---" dividers and _italic_ prompts. Placeholders: {{date}}, {{weekday}},
   * {{month}}, {{weekRange}}, {{mon}} … {{sun}}.
   */
  markdown: string;
}
