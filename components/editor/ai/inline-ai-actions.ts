import type { LucideIcon } from "lucide-react";
import {
  Languages,
  Lightbulb,
  List,
  ListChecks,
  ListTree,
  Minimize2,
  Mic,
  PenLine,
  SpellCheck,
  TextQuote,
  Wand2,
  WrapText,
} from "lucide-react";

/** A ready-made instruction in the inline AI panel. */
export interface InlineAiAction {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Sent to the model as the task. */
  instruction: string;
}

/** A sub-list (tone, language) opened from the main list. */
export interface InlineAiSubmenu {
  id: "tone" | "translate";
  label: string;
  icon: LucideIcon;
  actions: InlineAiAction[];
}

export const SELECTION_ACTIONS: InlineAiAction[] = [
  {
    id: "improve",
    label: "Improve writing",
    icon: Wand2,
    instruction: "Improve clarity and flow. Keep the meaning, structure and my voice.",
  },
  {
    id: "grammar",
    label: "Fix spelling & grammar",
    icon: SpellCheck,
    instruction: "Fix spelling, grammar and punctuation only. Change nothing else.",
  },
  {
    id: "shorter",
    label: "Make shorter",
    icon: Minimize2,
    instruction: "Make it about half as long. Keep every key point.",
  },
  {
    id: "longer",
    label: "Make longer",
    icon: WrapText,
    instruction: "Expand it with a little more detail and explanation. Don't invent facts.",
  },
  {
    id: "simplify",
    label: "Simplify language",
    icon: TextQuote,
    instruction: "Rewrite it in simpler words and shorter sentences.",
  },
  {
    id: "list",
    label: "Turn into a list",
    icon: List,
    instruction: "Turn it into a clear bullet list.",
  },
];

const TONES = ["Professional", "Friendly", "Casual", "Confident", "Direct"];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
  "Hindi",
  "Japanese",
  "Korean",
  "Chinese (Simplified)",
  "Arabic",
];

export const SELECTION_SUBMENUS: InlineAiSubmenu[] = [
  {
    id: "tone",
    label: "Change tone",
    icon: Mic,
    actions: TONES.map((tone) => ({
      id: `tone-${tone.toLowerCase()}`,
      label: tone,
      icon: Mic,
      instruction: `Rewrite it in a ${tone.toLowerCase()} tone. Keep the meaning.`,
    })),
  },
  {
    id: "translate",
    label: "Translate",
    icon: Languages,
    actions: LANGUAGES.map((language) => ({
      id: `translate-${language.toLowerCase()}`,
      label: language,
      icon: Languages,
      instruction: `Translate it into ${language}. Keep the formatting.`,
    })),
  },
];

export const WRITE_ACTIONS: InlineAiAction[] = [
  {
    id: "continue",
    label: "Continue writing",
    icon: PenLine,
    instruction: "Continue naturally from where the note stops, for one or two short paragraphs.",
  },
  {
    id: "brainstorm",
    label: "Brainstorm ideas",
    icon: Lightbulb,
    instruction: "Brainstorm 5 to 8 useful ideas related to this note, as a bullet list.",
  },
  {
    id: "outline",
    label: "Draft an outline",
    icon: ListTree,
    instruction: "Draft a short outline with headings and bullet points for this note.",
  },
  {
    id: "todo",
    label: "Make a to-do list",
    icon: ListChecks,
    instruction: 'Write a practical task list ("- [ ] " items) based on this note.',
  },
];
